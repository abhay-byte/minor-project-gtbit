#!/bin/bash
clear
# =================================================================
# Clinico PostgreSQL Full Reset Script for Linux/macOS
# =================================================================
# WARNING: This script deletes all existing database data.
# It starts the container and runs all migration/seed scripts.

echo
echo "###############################################################"
echo "#  WARNING: This will permanently delete all database data!   #"
echo "###############################################################"
echo
read -p "Are you sure you want to continue? (y/N) " -n 1 -r
echo    # move to a new line
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo
echo "--- Stopping and REMOVING existing container and volume... ---"
docker-compose down -v > /dev/null

echo
echo "--- Starting new PostgreSQL container... ---"
docker-compose up -d

echo
echo "--- Waiting for PostgreSQL to become available (10 seconds)... ---"
sleep 10

echo
echo "--- Running Database Migrations... ---"
for f in migrations/*.sql; do
    echo "Executing $f..."
    docker exec -i clinico_postgres_db psql -U clinico_user -d clinico_db < "$f"
done

echo
echo "--- Checking container status: ---"
docker-compose ps

echo
echo "--- FULL RESET COMPLETE! ---"
echo "Database is running and has been freshly seeded."
echo "Connect at: postgresql://clinico_user:clinico_password@localhost:5432/clinico_db"

