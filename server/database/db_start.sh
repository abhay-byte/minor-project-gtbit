#!/bin/bash

# =================================================================
# Clinico PostgreSQL Smart Setup Script for Linux/macOS
# =================================================================
# This script starts the database container if it's not running.
# It then checks if the database has been initialized.
# If NOT initialized, it runs all migration and seed scripts.
# If ALREADY initialized, it skips the scripts to preserve data.

clear

echo
echo "--- Starting PostgreSQL container in the background... ---"
docker-compose up -d

echo
echo "--- Waiting for PostgreSQL to become available (5 seconds)... ---"
sleep 5

echo
echo "--- Checking if database is already initialized... ---"
# We check for the existence of the 'users' table.
# The psql command will return 'users' if it exists, or be empty if it doesn't.
# We pipe to tr to remove any leading/trailing whitespace for a reliable check.
TABLE_EXISTS=$(docker exec clinico_postgres_db psql -U clinico_user -d clinico_db -t -c "SELECT to_regclass('public.users');" | tr -d '[:space:]')

# Check if the result string is empty.
if [ -z "$TABLE_EXISTS" ]; then
    echo
    echo "--- Database appears to be uninitialized. Running migrations and seeding... ---"

    echo
    echo "--- Running Database Migrations... ---"
    # Note the forward slashes for the path, which is standard on Linux/macOS.
    for f in database/migrations/*.sql; do
        echo "Executing $f..."
        docker exec -i clinico_postgres_db psql -U clinico_user -d clinico_db < "$f"
    done

    echo
    echo "--- Seeding Database... ---"
    echo "Executing database/seeds/seed.sql..."
    docker exec -i clinico_postgres_db psql -U clinico_user -d clinico_db < "database/seeds/seed.sql"

else
    echo
    echo "--- Database table 'users' found. Skipping migrations and seeding. ---"
fi

echo
echo "--- Checking final container status: ---"
docker-compose ps

echo
echo "--- Setup complete! ---"
echo "Database 'clinico_db' is running."
echo "Connect at: postgresql://clinico_user:clinico_password@localhost:5432/clinico_db"
