#!/usr/bin/env bash
set -e

echo "=========================================="
echo "🔧 Clinico AI Service - Build Phase"
echo "=========================================="

# Change to the AI service directory
cd /opt/render/project/src/server/ai_service

# Install Python dependencies
echo "📦 Installing dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt
echo ""

echo "=========================================="
echo "✅ Build completed successfully!"
echo "=========================================="