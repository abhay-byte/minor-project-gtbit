#!/usr/bin/env bash
set -e

echo "🚀 Starting Clinico AI Service..."
export PORT=${PORT:-5001}

DB_DIR="./db"
BASE_URL="https://raw.githubusercontent.com/abhay-byte/minor-project-gtbit/api/server/ai_service/db"

if [ -d "$DB_DIR" ] && [ -f "$DB_DIR/chroma.sqlite3" ]; then
    echo "✅ Database exists"
else
    echo "📥 Downloading database from GitHub..."
    mkdir -p "$DB_DIR"
    
    # Download main database file
    echo "⬇️  Downloading chroma.sqlite3..."
    wget --quiet --show-progress -O "$DB_DIR/chroma.sqlite3" \
        "$BASE_URL/chroma.sqlite3" || {
        echo "❌ Failed to download database"
        exit 1
    }
    
    # Download collection directories
    echo "⬇️  Downloading collections..."
    
    # Collection 1: 20823e44-21ba-4cfe-8759-ed1c350c3d9c
    mkdir -p "$DB_DIR/20823e44-21ba-4cfe-8759-ed1c350c3d9c"
    for file in data_level0.bin header.bin index_metadata.pickle length.bin link_lists.bin; do
        wget -q -O "$DB_DIR/20823e44-21ba-4cfe-8759-ed1c350c3d9c/$file" \
            "$BASE_URL/20823e44-21ba-4cfe-8759-ed1c350c3d9c/$file" 2>/dev/null || true
    done
    
    # Collection 2: 8b019dfb-cfcd-4efb-ae12-6d955de7eac7
    mkdir -p "$DB_DIR/8b019dfb-cfcd-4efb-ae12-6d955de7eac7"
    for file in data_level0.bin header.bin index_metadata.pickle length.bin link_lists.bin; do
        wget -q -O "$DB_DIR/8b019dfb-cfcd-4efb-ae12-6d955de7eac7/$file" \
            "$BASE_URL/8b019dfb-cfcd-4efb-ae12-6d955de7eac7/$file" 2>/dev/null || true
    done
    
    # Collection 3: 8e368b58-c8b4-4f61-8ce1-38588e425389
    mkdir -p "$DB_DIR/8e368b58-c8b4-4f61-8ce1-38588e425389"
    for file in data_level0.bin header.bin index_metadata.pickle length.bin link_lists.bin; do
        wget -q -O "$DB_DIR/8e368b58-c8b4-4f61-8ce1-38588e425389/$file" \
            "$BASE_URL/8e368b58-c8b4-4f61-8ce1-38588e425389/$file" 2>/dev/null || true
    done
    
    echo "✅ Database downloaded"
fi

# Verify
if [ ! -f "$DB_DIR/chroma.sqlite3" ]; then
    echo "❌ Database not found!"
    exit 1
fi

echo "✅ Database ready ($(du -h $DB_DIR/chroma.sqlite3 | cut -f1))"

# Start app
pip install gunicorn
exec gunicorn --bind "0.0.0.0:$PORT" --workers 2 --timeout 120 \
    --access-logfile - --error-logfile - "main:app"