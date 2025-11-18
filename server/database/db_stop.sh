#!/bin/bash
clear
# =================================================================
# Stop PostgreSQL Container
# =================================================================
# This script stops the container safely without deleting data.

echo
echo "--- Stopping PostgreSQL Container... ---"
docker-compose down

echo
echo "--- Container stopped. Data is preserved. ---"

