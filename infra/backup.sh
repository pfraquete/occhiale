#!/bin/bash
# ============================================
# OCCHIALE — Database Backup Script
# ============================================
# Usage:
#   ./backup.sh                  # Manual backup
#   Add to crontab for automatic:
#   0 3 * * * /opt/occhiale/infra/backup.sh >> /var/log/occhiale-backup.log 2>&1
#
# Prerequisites:
#   - pg_dump installed (apt install postgresql-client)
#   - .env file with POSTGRES_* variables
#   - Optional: rclone configured for cloud storage
# ============================================

set -euo pipefail

# ------------------------------------------
# Configuration
# ------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# Defaults
BACKUP_DIR="${BACKUP_DIR:-/opt/occhiale/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_DB="${POSTGRES_DB:-evolution}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-}"
CLOUD_REMOTE="${CLOUD_REMOTE:-}"  # e.g., "s3:occhiale-backups" or "gdrive:backups"

# ------------------------------------------
# Functions
# ------------------------------------------

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

error() {
  log "ERROR: $1" >&2
  exit 1
}

# ------------------------------------------
# Pre-checks
# ------------------------------------------

command -v pg_dump >/dev/null 2>&1 || error "pg_dump not found. Install: apt install postgresql-client"

mkdir -p "$BACKUP_DIR"

# ------------------------------------------
# Backup
# ------------------------------------------

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/occhiale_${TIMESTAMP}.sql.gz"

log "Starting database backup..."
log "  Host: ${POSTGRES_HOST}:${POSTGRES_PORT}"
log "  Database: ${POSTGRES_DB}"
log "  Output: ${BACKUP_FILE}"

PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
  -h "$POSTGRES_HOST" \
  -p "$POSTGRES_PORT" \
  -U "$POSTGRES_USER" \
  -d "$POSTGRES_DB" \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --format=plain \
  2>/dev/null | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
log "Backup completed: ${BACKUP_FILE} (${BACKUP_SIZE})"

# ------------------------------------------
# Supabase backup (if using hosted Supabase)
# ------------------------------------------

if [ -n "${SUPABASE_DB_URL:-}" ]; then
  SUPABASE_BACKUP_FILE="${BACKUP_DIR}/supabase_${TIMESTAMP}.sql.gz"
  log "Starting Supabase database backup..."
  log "  Output: ${SUPABASE_BACKUP_FILE}"

  pg_dump "$SUPABASE_DB_URL" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --format=plain \
    2>/dev/null | gzip > "$SUPABASE_BACKUP_FILE"

  SUPABASE_SIZE=$(du -h "$SUPABASE_BACKUP_FILE" | cut -f1)
  log "Supabase backup completed: ${SUPABASE_BACKUP_FILE} (${SUPABASE_SIZE})"
fi

# ------------------------------------------
# Cloud upload (optional)
# ------------------------------------------

if [ -n "$CLOUD_REMOTE" ] && command -v rclone >/dev/null 2>&1; then
  log "Uploading to cloud: ${CLOUD_REMOTE}"
  rclone copy "$BACKUP_FILE" "$CLOUD_REMOTE/" --progress 2>&1 | while read -r line; do
    log "  rclone: $line"
  done

  if [ -n "${SUPABASE_DB_URL:-}" ] && [ -f "${SUPABASE_BACKUP_FILE:-}" ]; then
    rclone copy "$SUPABASE_BACKUP_FILE" "$CLOUD_REMOTE/" --progress 2>&1 | while read -r line; do
      log "  rclone: $line"
    done
  fi

  log "Cloud upload completed"
fi

# ------------------------------------------
# Retention: delete old backups
# ------------------------------------------

log "Cleaning backups older than ${RETENTION_DAYS} days..."
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete -print | wc -l)
log "Deleted ${DELETED} old backup(s)"

# ------------------------------------------
# Summary
# ------------------------------------------

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
log "Backup summary: ${TOTAL_BACKUPS} backup(s), ${TOTAL_SIZE} total"
log "Done."
