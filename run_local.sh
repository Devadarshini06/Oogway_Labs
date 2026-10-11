#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    Launching The Lenny Growth Assistant         "
echo "=================================================="

# 1. Environment file check
if [ ! -f .env ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

# 2. Check Python Virtual Environment
if [ ! -d .venv ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
    .venv/bin/pip install --upgrade pip
    .venv/bin/pip install -r backend/requirements.txt
fi

# 3. Check and start Ollama if installed
if command -v ollama >/dev/null 2>&1; then
    echo "Verifying local Ollama service..."
    if ! curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
        echo "Starting Ollama daemon in background..."
        ollama serve >/dev/null 2>&1 &
        sleep 2
    fi
    echo "Ollama is ready."
else
    echo "Notice: Ollama not found in PATH. Ensure Ollama is installed or configure cloud API keys in .env."
fi

# 4. Check Frontend node_modules
if [ ! -d frontend/node_modules ]; then
    echo "Installing frontend dependencies..."
    (cd frontend && npm install)
fi

echo "Starting Backend API on http://localhost:8000..."
PYTHONPATH=. .venv/bin/python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting Frontend on http://localhost:5173..."
(cd frontend && npm run dev) &
FRONTEND_PID=$!

cleanup() {
    echo ""
    echo "Stopping Lenny Growth Assistant servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup INT TERM

echo ""
echo "=================================================="
echo " Lenny Growth Assistant is LIVE:                  "
echo " Web UI:     http://localhost:5173                "
echo " Backend API: http://localhost:8000/docs           "
echo " Health:     http://localhost:8000/api/v1/health  "
echo " Press Ctrl+C to stop all servers.                "
echo "=================================================="

wait
