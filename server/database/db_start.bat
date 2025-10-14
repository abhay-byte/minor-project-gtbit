@ECHO OFF
REM =================================================================
REM Clinico PostgreSQL Smart Setup Script for Windows
REM =================================================================
REM This script starts the database container if it's not running.
REM It then checks if the database has been initialized.
REM If NOT initialized, it runs all migration and seed scripts.
REM If ALREADY initialized, it skips the scripts to preserve data.

ECHO.
ECHO --- Starting PostgreSQL container in the background... ---
docker-compose up -d

ECHO.
ECHO --- Waiting for PostgreSQL to become available (5 seconds)... ---
timeout /t 5 /nobreak > NUL

ECHO.
ECHO --- Checking if database is already initialized... ---
REM We check for the existence of the 'users' table.
REM The -t flag in psql suppresses headers for clean output.
docker exec clinico_postgres_db psql -U clinico_user -d clinico_db -t -c "SELECT to_regclass('public.users');" > table_check.tmp

REM Read the first line of the file. If the table doesn't exist, the file will be empty or contain null.
SET /p TABLE_EXISTS=<table_check.tmp
DEL table_check.tmp

REM Clean up any whitespace from the variable
FOR /F "tokens=* delims= " %%A IN ("%TABLE_EXISTS%") DO SET TABLE_EXISTS=%%A


REM Check if the variable is empty. If so, the table doesn't exist.
IF "%TABLE_EXISTS%"=="" (
    ECHO.
    ECHO --- Database appears to be uninitialized. Running migrations... ---

    ECHO.
    ECHO --- Running Database Migrations... ---
    FOR %%F IN (database\migrations\*.sql) DO (
        ECHO Executing %%F...
        docker exec -i clinico_postgres_db psql -U clinico_user -d clinico_db < "%%F"
    )


) ELSE (
    ECHO.
    ECHO --- Database table 'users' found. Skipping migrations. ---
)

ECHO.
ECHO --- Checking final container status: ---
docker-compose ps

ECHO.
ECHO --- Setup complete! ---
ECHO Database 'clinico_db' is running.
ECHO Connect at: postgresql://clinico_user:clinico_password@localhost:5432/clinico_db

