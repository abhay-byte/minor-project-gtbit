#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🔧 Clinico AI Service - Build Phase"
echo "=========================================="

# Change to the AI service directory
cd /opt/render/project/src/server/ai_service

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