#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🔧 Clinico AI Service - Build Phase"
echo "=========================================="

# Check current directory
echo "📂 Current directory: $(pwd)"
echo "📄 Files in current directory:"
ls -la

# Change to the AI service directory
# Try different possible paths where pyproject.toml might be located
if [ -f "./server/ai_service/pyproject.toml" ]; then
    cd ./server/ai_service
    echo "📂 Changed to $(pwd)"
elif [ -f "/opt/render/project/src/server/ai_service/pyproject.toml" ]; then
    cd /opt/render/project/src/server/ai_service
    echo "📂 Changed to $(pwd)"
elif [ -f "server/ai_service/pyproject.toml" ]; then
    cd server/ai_service
    echo "📂 Changed to $(pwd)"
elif [ -f "./pyproject.toml" ]; then
    echo "📂 pyproject.toml found in current directory: $(pwd)"
else
    echo "❌ pyproject.toml not found in any expected location"
    echo "❌ Available files in current directory:"
    find . -name "pyproject.toml" -type f
    exit 1
fi

# Check Python version
echo "📋 Checking Python version..."
python --version

# Install Poetry
echo "📦 Installing Poetry..."
pip install poetry

# Install dependencies
echo "📚 Installing dependencies..."
poetry install --no-root

# Test application import
echo ""
echo "🧪 Testing application import..."
poetry run python -c "import flask; print(f'✅ Flask version: {flask.__version__}')"

echo ""
echo "=========================================="
echo "✅ Build completed successfully!"
echo "📝 Database will be downloaded at runtime from GitHub"
echo "=========================================="