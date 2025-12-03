#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🚀 Clinico AI Service - Starting"
echo "=========================================="

# Set port
export PORT=${PORT:-10000}
echo "📡 Port: $PORT"
echo ""

# Database download configuration
DB_DIR="./db"
BASE_URL="https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/api/server/ai_service/db"

# Check if database exists
if [ -d "$DB_DIR" ] && [ -f "$DB_DIR/chroma.sqlite3" ]; then
    echo "✅ Database already exists"
    echo "📊 Size: $(du -h $DB_DIR/chroma.sqlite3 | cut -f1)"
else
    echo "=========================================="
    echo "📥 Downloading Database from GitHub"
    echo "=========================================="
    
    mkdir -p "$DB_DIR"
    
    # Download main database file
    echo "⬇️ Downloading chroma.sqlite3..."
    wget --quiet --show-progress \
        -O "$DB_DIR/chroma.sqlite3" \
        "$BASE_URL/chroma.sqlite3"
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to download database"
        exit 1
    fi
    
    echo "✅ Downloaded chroma.sqlite3 ($(du -h $DB_DIR/chroma.sqlite3 | cut -f1))"
    echo ""
    
    # Download collections
    echo "⬇️  Downloading collection directories..."
    
    # Collection IDs from your database
    COLLECTIONS=(
        "20823e44-21ba-4cfe-8759-ed1c350c3d9c"
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

# Start application with Python directly
echo "=========================================="
echo "🎯 Starting Flask Application with Python"
echo "=========================================="
echo "🌐 http://0.0.0:$PORT"
echo ""

python main.py