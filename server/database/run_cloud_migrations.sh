#!/bin/bash

# =================================================================
# Clinico PostgreSQL Cloud Migration Script
# =================================================================
# This script runs all migration files in the migrations directory
# against a cloud PostgreSQL database using connection string from .env
# 

set -e # Exit immediately if a command exits with a non-zero status

echo
echo "###############################################################"
echo "#           Clinico Cloud Database Migration Script           #"
echo "###############################################################"
echo

# Check if .env file exists
if [ ! -f "../../documentation/database/.env" ]; then
    echo "ERROR: .env file not found at ../../documentation/database/.env"
    echo "Please create the .env file with your database connection string first."
    exit 1
fi

# Load environment variables
source ../../documentation/database/.env

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL is not set in .env file"
    echo "Please set DATABASE_URL in the .env file in the format:"
    echo "DATABASE_URL=postgresql://username:password@host:port/database_name"
    exit 1
fi

echo "Using database: $DATABASE_URL"
echo

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "ERROR: psql is not installed or not in PATH"
    echo "Please install PostgreSQL client tools first."
    exit 1
fi

echo "--- Testing database connection... ---"
# Test the connection by running a simple query
if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✓ Database connection successful"
else
    echo "ERROR: Failed to connect to the database"
    echo "Please check your DATABASE_URL in the .env file"
    exit 1
fi

echo
echo "--- Running Database Migrations... ---"

# Process migration files in order
for f in migrations/*.sql; do
    if [ -f "$f" ]; then
        echo "Executing $f..."
        if psql "$DATABASE_URL" -f "$f" > /dev/null 2>&1; then
            echo "✓ Successfully executed $f"
        else
            echo "ERROR: Failed to execute $f"
            exit 1
        fi
    fi
done

echo
echo "--- Migration Summary ---"
echo "All migration scripts have been executed successfully!"

# Optional: Show some basic information about the migrated database
echo
echo "--- Database Information ---"
psql "$DATABASE_URL" -c "\dt" | head -20

echo
echo "--- Cloud Migration Complete! ---"
echo "Your cloud database has been successfully set up with all migrations."