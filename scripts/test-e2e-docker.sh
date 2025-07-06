#!/bin/bash

# E2E Test Runner with Docker PostgreSQL
# This script manages the test database container and runs Cypress tests

set -e

echo "🚀 Starting E2E Tests with Docker PostgreSQL"
echo "==========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
    if [ "$KEEP_DB" != "true" ]; then
        docker compose -p saldoify-test -f docker-compose.test.yml down -v
    else
        echo -e "${YELLOW}ℹ️  Keeping test database running (use --cleanup to remove)${NC}"
    fi
    
    # Kill the preview server if it's running
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Parse arguments
HEADLESS=false
KEEP_DB=false
CLEANUP_ONLY=false

for arg in "$@"; do
    case $arg in
        --headless)
            HEADLESS=true
            shift
            ;;
        --keep-db)
            KEEP_DB=true
            shift
            ;;
        --cleanup)
            CLEANUP_ONLY=true
            shift
            ;;
        *)
            ;;
    esac
done

# If cleanup only, just remove the container and exit
if [ "$CLEANUP_ONLY" = true ]; then
    echo -e "${YELLOW}🧹 Removing test database container...${NC}"
    docker compose -p saldoify-test -f docker-compose.test.yml down -v
    echo -e "${GREEN}✅ Cleanup complete!${NC}"
    exit 0
fi

echo -e "${GREEN}🐳 Starting PostgreSQL test container...${NC}"
docker compose -p saldoify-test -f docker-compose.test.yml up -d

echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
until docker compose -p saldoify-test -f docker-compose.test.yml exec -T postgres-test pg_isready -U postgres > /dev/null 2>&1; do
    sleep 1
done
echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"

# Load test environment variables
export $(cat .env.test | grep -v '^#' | xargs)

echo -e "${GREEN}📦 Installing dependencies...${NC}"
npm install

echo -e "${GREEN}🔧 Pushing database schema...${NC}"
npm run db:push:test

echo -e "${GREEN}🏗️  Building application...${NC}"
npm run build

echo -e "${GREEN}🌐 Starting preview server...${NC}"
npm run preview &
SERVER_PID=$!

echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
npx wait-on http://localhost:4173 -t 30000

echo -e "${GREEN}🧪 Running Cypress tests...${NC}"
if [ "$HEADLESS" = true ]; then
    echo "Running in headless mode..."
    npx cypress run --e2e --config baseUrl=http://localhost:4173
else
    echo "Opening Cypress UI..."
    npx cypress open --e2e --config baseUrl=http://localhost:4173
fi

echo -e "${GREEN}✅ E2E tests completed!${NC}"

# Cleanup is handled by the trap