@ECHO OFF
CLS
REM =================================================================
REM Clinico PostgreSQL Full Reset Script for Windows
REM =================================================================
REM WARNING: This script deletes all existing database data.
REM It starts the container and runs all migration/seed scripts.

ECHO.
ECHO ###############################################################
ECHO #  WARNING: This will permanently delete all database data!   #
ECHO ###############################################################
ECHO.
SET /P AREYOUSURE=Are you sure you want to continue? (Y/[N]):
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END

ECHO.
ECHO --- Stopping and REMOVING existing container and volume... ---
docker-compose down -v > NUL

ECHO.
ECHO --- Starting new PostgreSQL container... ---
docker-compose up -d

ECHO.
ECHO --- Waiting for PostgreSQL to become available (10 seconds)... ---
timeout /t 10 /nobreak > NUL

ECHO.
ECHO --- Running Database Migrations... ---
FOR %%F IN (migrations\*.sql) DO (
    ECHO Executing %%F...
    docker exec -i clinico_postgres_db psql -U clinico_user -d clinico_db < "%%F"
)

ECHO.
ECHO --- Seeding Database... ---
ECHO Executing seeds\seed.sql...
docker exec -i clinico_postgres_db psql -U clinico_user -d clinico_db < "seeds\seed.sql"

ECHO.
ECHO --- Checking container status: ---
docker-compose ps

ECHO.
ECHO --- FULL RESET COMPLETE! ---
ECHO Database is running and has been freshly seeded.
ECHO Connect at: postgresql://clinico_user:clinico_password@localhost:5432/clinico_db

:END

