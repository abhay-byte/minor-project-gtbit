#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting Clinico AI Service..."

# Set default port if not provided
PORT=${PORT:-5001}
echo "📡 Application will run on port: $PORT"

# Verify required environment variables are set
if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET environment variable not set!"
    exit 1
fi

if [ -z "$AI_SERVICE_AUTH_TOKEN" ]; then
    echo "❌ Error: AI_SERVICE_AUTH_TOKEN environment variable not set!"
    exit 1
fi

# Check if GOOGLE_API_KEY is set (optional, but warn if missing)
if [ -z "$GOOGLE_API_KEY" ]; then
    echo "⚠️  Warning: GOOGLE_API_KEY environment variable not set. Gemini features will be disabled."
    echo "   The service will use local Ollama models instead."
fi

# Set Flask environment
export FLASK_ENV=production

# Install Gunicorn if not available
if ! command -v gunicorn &> /dev/null; then
    echo "📦 Installing Gunicorn..."
    pip install gunicorn
fi

# Verify that the database directory exists
if [ ! -d "db" ]; then
    echo "❌ Error: ChromaDB directory 'db' not found!"
    echo "   Please ensure the build process completed successfully."
    exit 1
fi

echo "📚 ChromaDB directory found."

# Verify that the knowledge base directory exists
if [ ! -d "knowledge_base" ]; then
    echo "⚠️  Warning: knowledge_base directory not found."
fi

# Start the Flask application using Gunicorn
echo "🏃 Starting Gunicorn server..."
exec gunicorn \
    --bind "0.0.0.0:$PORT" \
    --workers 3 \
    --worker-class sync \
    --worker-connections 1000 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 120 \
    --keep-alive 5 \
    --preload \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    --name clinico-ai-service \
    main:app

echo "✅ Clinico AI Service started successfully!"