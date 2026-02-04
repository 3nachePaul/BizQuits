#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# BizQuits - ngrok Tunnel Script
# Exposes both frontend and backend to the internet
# ═══════════════════════════════════════════════════════════════════

echo "🌐 Starting BizQuits with ngrok tunnels..."
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Install it with: brew install ngrok"
    exit 1
fi

# First, stop any running services
echo "🛑 Stopping any existing services..."
docker compose down 2>/dev/null
pkill -f "dotnet run" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Start the main application
echo "🚀 Starting BizQuits services..."
cd /Users/pol/Documents/Code/BizQuits

# Start database
echo "Starting database..."
docker compose up -d

echo "⏳ Waiting for SQL Server..."
sleep 15

# Apply migrations
echo "Applying migrations..."
cd BizQuits
dotnet ef database update 2>/dev/null || echo "Migrations applied or no changes"

# Start backend in background
echo "Starting backend..."
dotnet run &
BACKEND_PID=$!
cd ..

sleep 5

# Start frontend in background with host flag for ngrok
echo "Starting frontend..."
cd bizquits.frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

sleep 5

# Determine frontend port
FRONTEND_PORT=5173
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    FRONTEND_PORT=5174
fi

echo ""
echo "✅ Services started!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID (port $FRONTEND_PORT)"
echo ""
echo "🔗 Starting ngrok tunnel for frontend..."
echo ""
echo "⚠️  IMPORTANT: After ngrok starts, note the public URL"
echo "   Share that URL with others to access your app!"
echo ""
echo "   Press Ctrl+C to stop ngrok (services will keep running)"
echo ""

# Start ngrok for frontend only (most important for sharing)
ngrok http $FRONTEND_PORT
