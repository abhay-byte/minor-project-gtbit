#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🔧 Clinico AI Service - Build Phase"
echo "=========================================="

# Install Python dependencies
echo "📦 Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt
echo ""

echo "=========================================="
echo "✅ Build completed successfully!"
echo "=========================================="