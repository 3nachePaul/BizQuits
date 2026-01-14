#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting BizQuits...${NC}"

# Start Docker
echo -e "${YELLOW}Starting database...${NC}"
docker-compose up -d

echo -e "${YELLOW}Waiting for SQL Server to be ready...${NC}"
sleep 30

# Apply migrations
echo -e "${YELLOW}Applying database migrations...${NC}"
cd BizQuits
dotnet ef database update 2>/dev/null || echo "Migrations already applied or no changes"

# Start backend
echo -e "${YELLOW}Starting backend...${NC}"
dotnet run &
BACKEND_PID=$!
cd ..

sleep 5

# Start frontend
echo -e "${YELLOW}Starting frontend...${NC}"
cd bizquits.frontend
npm install --silent 2>/dev/null
npm run dev &
FRONTEND_PID=$!
cd ..

sleep 3

echo ""
echo -e "${GREEN} BizQuits is running!${NC}"
echo ""
echo -e "  ${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "  ${BLUE}Backend:${NC}  http://localhost:5204"
echo -e "  ${BLUE}Swagger:${NC}  http://localhost:5204/swagger"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    docker-compose down
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

wait
