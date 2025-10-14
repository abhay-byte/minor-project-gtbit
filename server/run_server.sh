#!/bin/bash

# =================================================================
# Clinico Backend Smart Start Script for Linux/macOS
# =================================================================
# This script checks for dependencies, performs a one-time setup for
# npm packages and database seeding, and then starts the services.

# Function to print a formatted header
print_header() {
    echo "====================================="
    echo "$1"
    echo "====================================="
    echo ""
}

clear
echo ""
print_header "Clinico Backend Start Script"

# --- Step 1: Check for Prerequisites ---
print_header "Checking for Node.js and Docker..."

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js is not installed."
    echo "Please install Node.js (v18 or higher is recommended) before continuing."
    exit 1
fi
echo "Node.js is installed."
echo "Version: $(node -v)"
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed."
    echo "Please install Docker Desktop before continuing."
    exit 1
fi
# Also check if the Docker daemon is running
if ! docker info &> /dev/null; then
    echo "[ERROR] Docker is installed, but the Docker daemon is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi
echo "Docker is installed and running."
echo "Version: $(docker -v)"
echo ""

print_header "Check complete."

# --- Check for .env file ---
if [ ! -f "src/.env" ]; then
    echo "[ERROR] 'src/.env' file not found."
    echo "Please create the .env file in the /src directory and continue. Exiting now..."
    echo ""
    exit 1
fi

# --- Step 2: Perform One-Time Setup (if needed) ---
if [ ! -f "src/_setup_complete.flag" ]; then
    print_header "Performing first-time setup..."

    echo "1. Installing npm packages..."
    (cd src && npm install) || { echo "[Warning] npm install failed or returned warnings."; }
    echo ""

    echo "2. Starting database for seeding..."
    # Make sure the script is executable before running
    (cd database && chmod +x db_start.sh && ./db_start.sh) || { echo "[Warning] Could not start database."; }
    echo ""

    echo "3. Seeding the database..."
    (cd src && npm run db:seed) || { echo "[Warning] Database seeding may have failed."; }
    echo ""

    echo "4. Marking setup as complete..."
    echo "Setup completed on $(date)" > "src/_setup_complete.flag"
    echo ""
    print_header "First-time setup finished successfully!"
else
    print_header "Initial setup already completed. Skipping..."
fi

# --- Step 3: Start Services ---
echo ""
print_header "Starting PostgreSQL Database..."
(cd database && ./db_start.sh) || { echo "[Warning] Database may not have started correctly."; }
echo ""

print_header "Starting Node.js API Server..."
echo "Starting server with 'npm run start'. Press CTRL+C to stop."
(cd src && npm run start)

echo ""
echo "--- Script finished. ---"

