@ECHO OFF
CLS
REM =================================================================
REM Stop PostgreSQL Container
REM =================================================================
REM This script stops the container safely without deleting data.

ECHO.
ECHO --- Stopping PostgreSQL Container... ---
docker-compose down

ECHO.
ECHO --- Container stopped. Data is preserved. ---

