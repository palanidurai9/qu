#!/bin/bash
# Start QML Development Servers
# Usage: ./start_dev.sh

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_PYTHON="$PROJECT_DIR/venv/bin/python"
VENV_UVICORN="$PROJECT_DIR/venv/bin/uvicorn"

echo "🚀 Starting Quantum ML Backend on http://localhost:8000 ..."
cd "$PROJECT_DIR/backend"
"$VENV_UVICORN" main:app --host 127.0.0.1 --port 8000 --reload &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

sleep 2

echo "⚛️  Starting React Frontend on http://localhost:3000 ..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Both servers are running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait and clean up on exit
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
