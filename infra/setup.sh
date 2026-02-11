#!/bin/bash
# ============================================
# OCCHIALE VPS Setup Script
# Installs Docker, configures .env, starts services
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
# 3. Create .env from .env.example
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

  # Write generated values
  sed -i "s|^EVOLUTION_API_KEY=.*|EVOLUTION_API_KEY=${EVOLUTION_KEY}|" .env
  sed -i "s|^POSTGRES_EVOLUTION_PASSWORD=.*|POSTGRES_EVOLUTION_PASSWORD=${POSTGRES_PW}|" .env
  sed -i "s|^MEILISEARCH_MASTER_KEY=.*|MEILISEARCH_MASTER_KEY=${MEILI_KEY}|" .env

  warn "Generated random keys for EVOLUTION_API_KEY, POSTGRES_EVOLUTION_PASSWORD, MEILISEARCH_MASTER_KEY"
  warn "Edit .env to set EVOLUTION_SERVER_URL to your VPS public URL"
  echo ""
  echo "  Generated keys:"
  echo "    EVOLUTION_API_KEY=${EVOLUTION_KEY}"
  echo "    MEILISEARCH_MASTER_KEY=${MEILI_KEY}"
  echo ""
  echo "  Save these keys! You'll need them in your Next.js .env.local"
  echo ""
else
  log ".env already exists, skipping generation"
fi

# ------------------------------------------
# 4. Start services
# ------------------------------------------
log "Starting Docker services..."
docker compose up -d

# ------------------------------------------
# 5. Health check
# ------------------------------------------
log "Waiting for services to be healthy..."
sleep 10

echo ""
log "Service Status:"
echo "-----------------------------------"

# Check Evolution API
if curl -sf http://localhost:8080/ &>/dev/null; then
  echo -e "  Evolution API:  ${GREEN}✓ Running${NC} (port 8080)"
else
  echo -e "  Evolution API:  ${RED}✗ Not ready${NC} (may still be starting)"
fi

# Check Redis
if docker exec occhiale-redis redis-cli ping 2>/dev/null | grep -q PONG; then
  echo -e "  Redis:          ${GREEN}✓ Running${NC} (port 6379)"
else
  echo -e "  Redis:          ${RED}✗ Not ready${NC}"
fi

# Check PostgreSQL
if docker exec occhiale-postgres-evolution pg_isready -U evolution -d evolution &>/dev/null; then
  echo -e "  PostgreSQL:     ${GREEN}✓ Running${NC} (port 5433)"
else
  echo -e "  PostgreSQL:     ${RED}✗ Not ready${NC}"
fi

# Check Meilisearch
if curl -sf http://localhost:7700/health &>/dev/null; then
  echo -e "  Meilisearch:    ${GREEN}✓ Running${NC} (port 7700)"
else
  echo -e "  Meilisearch:    ${RED}✗ Not ready${NC} (may still be starting)"
fi

echo "-----------------------------------"
echo ""
log "Setup complete! Next steps:"
echo "  1. Set EVOLUTION_SERVER_URL in .env to your VPS public URL"
echo "  2. Copy EVOLUTION_API_KEY and MEILISEARCH_MASTER_KEY to your Next.js .env.local"
echo "  3. Configure DNS/reverse proxy (nginx/caddy) for HTTPS"
echo "  4. Run: docker compose logs -f  (to monitor)"
