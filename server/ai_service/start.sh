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

# Verify database exists
echo ""
echo "🔍 Verifying database..."
if [ ! -f "./db/chroma.sqlite3" ]; then
    echo "❌ ERROR: Database file not found!"
    echo "   Expected: ./db/chroma.sqlite3"
    echo "   This should have been provided by Git repository"
    exit 1
fi

echo "✅ Database verified: db/chroma.sqlite3"
echo "📊 Database size: $(du -h db/chroma.sqlite3 | cut -f1)"

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