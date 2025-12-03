#!/usr/bin/env bash
set -e # Exit on error

echo "=========================================="
echo "🚀 Clinico AI Service - Starting"
echo "=========================================="

# Navigate to AI service directory
AI_SERVICE_DIR="/opt/render/project/src/server/ai_service"
echo "📂 Navigating to: $AI_SERVICE_DIR"
cd "$AI_SERVICE_DIR" || exit 1
echo "✅ Working directory: $(pwd)"
echo ""

# Set port
export PORT=${PORT:-1000}
echo "📡 Port: $PORT"
echo ""

# Database download/verification
DB_DIR="./db"
BASE_URL="https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/api/server/ai_service/db"

if [ -d "$DB_DIR" ] && [ -f "$DB_DIR/chroma.sqlite3" ]; then
    echo "✅ Database already exists"
    echo "📊 Size: $(du -h $DB_DIR/chroma.sqlite3 | cut -f1)"
else
    echo "=========================================="
    echo "📥 Downloading Database from GitHub"
    echo "=========================================="
    
    mkdir -p "$DB_DIR"
    
    # Download main database file
    echo "⬇️  Downloading chroma.sqlite3..."
    wget --quiet --show-progress \
        -O "$DB_DIR/chroma.sqlite3" \
        "$BASE_URL/chroma.sqlite3" || {
        echo "❌ Failed to download database"
        exit 1
    }
    
    echo "✅ Downloaded chroma.sqlite3 ($(du -h $DB_DIR/chroma.sqlite3 | cut -f1))"
    echo ""
    
    # Download collections
    echo "⬇️  Downloading collection directories..."
    
    COLLECTIONS=(
        "20823e4-21ba-4cfe-8759-ed1c350c3d9c"
        "8b019dfb-cfcd-4efb-ae12-6d955de7eac7"
        "8e368b58-c8b4-4f61-8ce1-38588e425389"
    )
    
    for collection_id in "${COLLECTIONS[@]}"; do
        echo "   📁 $collection_id"
        mkdir -p "$DB_DIR/$collection_id"
        
        for file in data_level0.bin header.bin index_metadata.pickle length.bin link_lists.bin; do
            wget -q -O "$DB_DIR/$collection_id/$file" \
                "$BASE_URL/$collection_id/$file" 2>/dev/null || true
        done
    done
    
    echo ""
    echo "✅ Database download completed!"
fi

echo ""
echo "=========================================="

# Verify database
if [ ! -f "$DB_DIR/chroma.sqlite3" ]; then
    echo "❌ ERROR: Database verification failed"
    exit 1
fi

echo "✅ Database verified"
echo ""

# Verify Flask app exists
echo "🔍 Verifying Flask application..."
if [ ! -f "main.py" ]; then
    echo "❌ ERROR: main.py not found in $(pwd)"
    ls -la
    exit 1
fi
echo "✅ Found main.py"
echo ""

# Test import before starting server
echo "🧪 Testing Flask app import..."
poetry run python -c "from main import app; print('✅ Flask app imports successfully')" || {
    echo "❌ ERROR: Failed to import Flask app"
    echo "Check your main.py for errors"
    exit 1
}
echo ""

# Install Gunicorn in Poetry environment
echo "📦 Installing Gunicorn..."
poetry add gunicorn --group dev || pip install gunicorn
echo ""

# Start application with detailed logging
echo "=========================================="
echo "🎯 Starting Flask Application with Gunicorn"
echo "=========================================="
echo "🌐 Binding to: 0.0.0.0:$PORT"
echo "👷 Workers: 2"
echo "⏱️  Timeout: 120 seconds"
echo "📂 Working Directory: $(pwd)"
echo "📝 Command: poetry run gunicorn --bind 0.0.0.0:$PORT main:app"
echo "=========================================="
echo ""

# Use exec to replace shell with gunicorn (important for signal handling)
exec poetry run gunicorn \
    --bind "0.0.0.0:$PORT" \
    --workers 2 \
    --threads 4 \
    --timeout 120 \
    --worker-class sync \
    --access-logfile - \
    --error-logfile - \
    --log-level debug \
    --capture-output \
    --enable-stdio-inheritance \
    "main:app"