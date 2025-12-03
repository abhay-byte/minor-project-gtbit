#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting Clinico AI Service Build Process..."

# Verify Python version
echo "🔍 Checking Python version..."
python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
echo "   Python version: $python_version"

# Check if Python version is compatible
if [[ $(printf '%s\n' "3.1" "$python_version" | sort -V | head -n1) == "3.11" ]] && [[ $(printf '%s\n' "$python_version" "3.12.9" | sort -V | head -n1) == "$python_version" ]]; then
    echo "✅ Python version is compatible (3.1.x - 3.12.x)"
else
    echo "❌ Python version $python_version is not compatible. Required: 3.11.x - 3.12.x"
    exit 1
fi

# Install Poetry if not available
if ! command -v poetry &> /dev/null; then
    echo "📦 Installing Poetry..."
    curl -sSL https://install.python-poetry.org | python3 -
    export PATH="$HOME/.local/bin:$PATH"
else
    echo "✅ Poetry is already installed"
fi

# Verify Poetry installation
poetry_version=$(poetry --version)
echo "   Poetry version: $poetry_version"

# Configure Poetry to not create virtual environments in a separate directory
echo "⚙️  Configuring Poetry..."
poetry config virtualenvs.create false

# Install Python dependencies using Poetry
echo "📦 Installing Python dependencies..."
poetry install --no-root --only=main

# Check if knowledge_base directory exists
if [ ! -d "knowledge_base" ]; then
    echo "⚠️  Warning: knowledge_base directory not found. Please ensure your knowledge base files are present."
else
    echo "📚 Knowledge base directory found."
fi

# Check if ChromaDB directory already exists
if [ -d "db" ]; then
    echo "🔍 Existing ChromaDB directory found. Removing it to ensure clean ingestion..."
    rm -rf db
fi

# Run the ingestion script to populate the knowledge base
echo "🧠 Running knowledge base ingestion script..."
if [ -f "ingest.py" ]; then
    poetry run python3 ingest.py
    echo "✅ Knowledge base ingestion completed."
else
    echo "⚠️  Warning: ingest.py not found. Skipping knowledge base ingestion."
fi

# Verify that the application can start without errors
echo "🧪 Testing application import..."
if poetry run python3 -c "import main; print('Application imports successfully')" &> /dev/null; then
    echo "✅ Application imports successfully"
else
    echo "❌ Application import failed. Please check dependencies."
    exit 1
fi

echo "✅ Build process completed successfully!"
echo "✨ The Clinico AI Service is ready for deployment."