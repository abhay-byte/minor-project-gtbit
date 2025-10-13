#!/bin/bash
clear
echo "--- Starting Clinico Backend Server ---"
echo ""

echo "Step 1: Starting PostgreSQL Database..."
echo "======================================="
# Execute the start script from within the database directory
./database/db_start.sh

echo ""
echo "Step 2: Starting Node.js API Server..."
echo "======================================="
# Navigate to the src directory and start the application
cd src
npm run start

cd ..
