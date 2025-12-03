#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🔧 Clinico AI Service - Build Phase"
echo "=========================================="

# Navigate to AI service directory
AI_SERVICE_DIR="/opt/render/project/src/server/ai_service"

echo "📂 Navigating to: $AI_SERVICE_DIR"

if [ -d "$AI_SERVICE_DIR" ]; then
    cd "$AI_SERVICE_DIR"
else
    echo "❌ ERROR: Directory not found: $AI_SERVICE_DIR"
    echo "Available in /opt/render/project/src:"
    ls -la /opt/render/project/src 2>/dev/null || echo "Path doesn't exist"
    exit 1
fi

echo "✅ Current directory: $(pwd)"
echo ""

# Verify pyproject.toml
if [ ! -f "pyproject.toml" ]; then
    echo "❌ ERROR: pyproject.toml not found!"
    echo "Files in $(pwd):"
    ls -la
    exit 1
fi

echo "✅ Found pyproject.toml"
echo ""

# Python version
echo "📋 Python version:"
python --version
echo ""

# Install Poetry
echo "📦 Installing Poetry..."
pip install poetry
echo ""

# Install dependencies
echo "📚 Installing dependencies..."
poetry install --no-root
echo ""

# Verify installation
echo "🧪 Verifying installation..."
poetry run python -c "import flask, chromadb; print('✅ Dependencies installed')"
echo ""

echo "=========================================="
echo "✅ Build completed successfully!"
echo "=========================================="