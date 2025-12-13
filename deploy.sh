#!/bin/bash
# deploy.sh - Secure deployment script with migrations
set -e

echo "====================================="
echo "  Secure Production Deployment"
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Build images
echo -e "${YELLOW}[1/5] Building Docker images...${NC}"
docker compose build --no-cache

# Step 2: Start database and redis
echo -e "${YELLOW}[2/5] Starting database and Redis...${NC}"
docker compose up -d dorkpf-db redis

# Wait for database to be healthy
echo -e "${YELLOW}Waiting for database to be healthy...${NC}"
timeout 60 bash -c 'until docker compose ps dorkpf-db | grep -q "healthy"; do sleep 2; done' || {
    echo -e "${RED}Database failed to become healthy${NC}"
    exit 1
}

# Step 3: Run migrations
echo -e "${YELLOW}[3/5] Running database migrations...${NC}"
docker compose run --rm dorkpf-migrate

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed successfully${NC}"
else
    echo -e "${RED}✗ Migration failed${NC}"
    exit 1
fi

# Step 4: Start the application
echo -e "${YELLOW}[4/5] Starting the application...${NC}"
docker compose up -d dorkpf-app cron-scheduler

# Step 5: Monitor startup
echo -e "${YELLOW}[5/5] Monitoring application startup...${NC}"
docker compose logs -f dorkpf-app &
LOG_PID=$!

# Wait for health check to pass
echo -e "${YELLOW}Waiting for application to be healthy...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=30
while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if docker compose ps dorkpf-app | grep -q "healthy"; then
        echo -e "${GREEN}✓ Application is healthy!${NC}"
        kill $LOG_PID 2>/dev/null || true
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    sleep 3
done

if [ $ATTEMPTS -eq $MAX_ATTEMPTS ]; then
    echo -e "${RED}✗ Application failed to become healthy${NC}"
    kill $LOG_PID 2>/dev/null || true
    docker compose logs dorkpf-app
    exit 1
fi

# Summary
echo ""
echo -e "${GREEN}====================================="
echo "  Deployment Successful!"
echo "=====================================${NC}"
echo ""
echo "Application is running at: https://${DOMAIN}"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f dorkpf-app    # View logs"
echo "  docker compose ps                     # View status"
echo "  docker compose down                   # Stop all services"
echo ""
