#!/bin/bash
# ============================================
# OCCHIALE VPS Setup Script
# Installs Docker, configures .env, sets up firewall,
# starts services with Caddy reverse proxy + auto SSL
# Run: chmod +x setup.sh && ./setup.sh
# ============================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}[OCCHIALE]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ------------------------------------------
# 1. Check & Install Docker
# ------------------------------------------
if ! command -v docker &>/dev/null; then
  log "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  log "Docker installed. You may need to log out and back in for group changes."
else
  log "Docker already installed: $(docker --version)"
fi

# ------------------------------------------
# 2. Check Docker Compose (v2 plugin)
# ------------------------------------------
if ! docker compose version &>/dev/null; then
  error "Docker Compose plugin not found. Install it manually:"
  echo "  sudo apt install docker-compose-plugin"
  exit 1
else
  log "Docker Compose: $(docker compose version)"
fi

# ------------------------------------------
# 3. Configure UFW Firewall
# ------------------------------------------
if command -v ufw &>/dev/null; then
  log "Configuring UFW firewall..."
  sudo ufw default deny incoming
  sudo ufw default allow outgoing
  sudo ufw allow 22/tcp comment 'SSH'
  sudo ufw allow 80/tcp comment 'HTTP (Caddy)'
  sudo ufw allow 443/tcp comment 'HTTPS (Caddy)'
  sudo ufw allow 443/udp comment 'HTTP/3 QUIC (Caddy)'
  sudo ufw --force enable
  log "Firewall configured: SSH (22), HTTP (80), HTTPS (443) allowed"
else
  warn "UFW not found. Install with: sudo apt install ufw"
  warn "Skipping firewall configuration"
fi

# ------------------------------------------
# 4. Create .env from .env.example
# ------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -f .env ]; then
  log "Creating .env from .env.example..."
  cp .env.example .env

  # Generate random keys
  EVOLUTION_KEY=$(openssl rand -hex 32)
  POSTGRES_PW=$(openssl rand -base64 24 | tr -d '=+/')
  MEILI_KEY=$(openssl rand -hex 32)
  REDIS_PW=$(openssl rand -hex 16)

  # Write generated values
  sed -i "s|^EVOLUTION_API_KEY=.*|EVOLUTION_API_KEY=${EVOLUTION_KEY}|" .env
  sed -i "s|^POSTGRES_EVOLUTION_PASSWORD=.*|POSTGRES_EVOLUTION_PASSWORD=${POSTGRES_PW}|" .env
  sed -i "s|^MEILISEARCH_MASTER_KEY=.*|MEILISEARCH_MASTER_KEY=${MEILI_KEY}|" .env
  sed -i "s|^REDIS_PASSWORD=.*|REDIS_PASSWORD=${REDIS_PW}|" .env

  warn "Generated random keys for all services"
  warn "IMPORTANT: Edit .env to set your domain names:"
  warn "  EVOLUTION_DOMAIN=api.yourdomain.com"
  warn "  MEILISEARCH_DOMAIN=search.yourdomain.com"
  warn "  EVOLUTION_SERVER_URL=https://api.yourdomain.com"
  echo ""
  echo "  Generated keys (save these for your Next.js .env.local):"
  echo "    EVOLUTION_API_KEY=${EVOLUTION_KEY}"
  echo "    MEILISEARCH_MASTER_KEY=${MEILI_KEY}"
  echo ""
else
  log ".env already exists, skipping generation"
fi

# ------------------------------------------
# 5. Prompt for domain configuration
# ------------------------------------------
echo ""
read -p "Enter your Evolution API domain (e.g., api.yourdomain.com): " EVOLUTION_DOMAIN
read -p "Enter your Meilisearch domain (e.g., search.yourdomain.com): " MEILISEARCH_DOMAIN

if [ -n "$EVOLUTION_DOMAIN" ]; then
  sed -i "s|^EVOLUTION_DOMAIN=.*|EVOLUTION_DOMAIN=${EVOLUTION_DOMAIN}|" .env
  sed -i "s|^EVOLUTION_SERVER_URL=.*|EVOLUTION_SERVER_URL=https://${EVOLUTION_DOMAIN}|" .env
fi

if [ -n "$MEILISEARCH_DOMAIN" ]; then
  sed -i "s|^MEILISEARCH_DOMAIN=.*|MEILISEARCH_DOMAIN=${MEILISEARCH_DOMAIN}|" .env
fi

# ------------------------------------------
# 6. Start services
# ------------------------------------------
log "Starting Docker services..."
docker compose up -d

# ------------------------------------------
# 7. Health check
# ------------------------------------------
log "Waiting for services to be healthy..."
sleep 15

echo ""
log "Service Status:"
echo "-----------------------------------"

# Check Caddy
if docker ps --filter "name=occhiale-caddy" --filter "status=running" -q | grep -q .; then
  echo -e "  Caddy (proxy):  ${GREEN}✓ Running${NC} (ports 80, 443)"
else
  echo -e "  Caddy (proxy):  ${RED}✗ Not ready${NC}"
fi

# Check Evolution API
if docker exec occhiale-caddy wget -qO- http://evolution-api:8080/ &>/dev/null 2>&1; then
  echo -e "  Evolution API:  ${GREEN}✓ Running${NC} (internal :8080)"
else
  echo -e "  Evolution API:  ${YELLOW}⏳ Starting${NC} (may take a moment)"
fi

# Check Redis
if docker exec occhiale-redis redis-cli ping 2>/dev/null | grep -q PONG; then
  echo -e "  Redis:          ${GREEN}✓ Running${NC} (internal :6379)"
else
  echo -e "  Redis:          ${RED}✗ Not ready${NC}"
fi

# Check PostgreSQL
if docker exec occhiale-postgres-evolution pg_isready -U evolution -d evolution &>/dev/null; then
  echo -e "  PostgreSQL:     ${GREEN}✓ Running${NC} (internal :5432)"
else
  echo -e "  PostgreSQL:     ${RED}✗ Not ready${NC}"
fi

# Check Meilisearch
if docker exec occhiale-caddy wget -qO- http://meilisearch:7700/health &>/dev/null 2>&1; then
  echo -e "  Meilisearch:    ${GREEN}✓ Running${NC} (internal :7700)"
else
  echo -e "  Meilisearch:    ${YELLOW}⏳ Starting${NC} (may take a moment)"
fi

echo "-----------------------------------"
echo ""
# ------------------------------------------
# 7. Setup Backup Cron
# ------------------------------------------
log "Configuring automatic database backups..."

# Install postgresql-client for pg_dump
if ! command -v pg_dump &>/dev/null; then
  apt-get install -y postgresql-client-common postgresql-client >/dev/null 2>&1 || true
fi

mkdir -p "${BACKUP_DIR:-/opt/occhiale/backups}"

# Add cron job for daily backup at 3 AM
CRON_CMD="0 3 * * * cd $SCRIPT_DIR && ./backup.sh >> /var/log/occhiale-backup.log 2>&1"
if ! crontab -l 2>/dev/null | grep -q "backup.sh"; then
  (crontab -l 2>/dev/null; echo "$CRON_CMD") | crontab -
  log "Backup cron job added (daily at 3 AM)"
else
  log "Backup cron job already configured"
fi

# ------------------------------------------
# Done
# ------------------------------------------
log "Setup complete! Next steps:"
echo "  1. Ensure DNS A records point to this VPS IP for:"
echo "     - ${EVOLUTION_DOMAIN:-api.yourdomain.com}"
echo "     - ${MEILISEARCH_DOMAIN:-search.yourdomain.com}"
echo "  2. Caddy will automatically obtain SSL certificates"
echo "  3. Copy EVOLUTION_API_KEY and MEILISEARCH_MASTER_KEY to your Next.js .env.local"
echo "  4. Deploy Next.js to Vercel and configure environment variables"
echo "  5. Monitor: docker compose logs -f"
echo "  6. Backups: check /var/log/occhiale-backup.log"
