@ECHO OFF
REM =================================================================
REM Clinico PostgreSQL Cloud Migration Script for Windows
REM =================================================================
REM This script runs all migration files in the migrations directory
REM against a cloud PostgreSQL database using connection string from .env

ECHO.
ECHO ###############################################################
ECHO #        Clinico Cloud Database Migration Script (Windows)    #
ECHO ###############################################################
ECHO.

REM Check if .env file exists
IF NOT EXIST "..\..\..\documentation\database\.env" (
    ECHO ERROR: .env file not found at ..\..\documentation\database\.env
    ECHO Please create the .env file with your database connection string first.
    EXIT /B 1
)

REM Load environment variables using a PowerShell command to parse the .env file
FOR /F "usebackq tokens=*" %%i IN (`powershell -Command "Get-Content ..\..\..\documentation\database\.env | Where-Object {$_ -notmatch '^#' -and $_ -ne ''} | ForEach-Object {$_.Trim()}"`) DO (
    FOR /F "tokens=1* delims==" %%a IN ("%%i") DO (
        SET "%%a=%%b"
    )
)

REM Check if required environment variables are set
IF "%DATABASE_URL%"=="" (
    ECHO ERROR: DATABASE_URL is not set in .env file
    ECHO Please set DATABASE_URL in the .env file in the format:
    ECHO DATABASE_URL=postgresql://username:password@host:port/database_name
    EXIT /B 1
)

ECHO Using database: %DATABASE_URL%
ECHO.

REM Check if psql is available
WHERE psql >nul 2>nul
IF ERRORLEVEL 1 (
    ECHO ERROR: psql is not installed or not in PATH
    ECHO Please install PostgreSQL client tools first.
    EXIT /B 1
)

ECHO --- Testing database connection... ---
REM Test the connection by running a simple query
psql "%DATABASE_URL%" -c "SELECT 1;" >nul 2>nul
IF ERRORLEVEL 1 (
    ECHO ERROR: Failed to connect to the database
    ECHO Please check your DATABASE_URL in the .env file
    EXIT /B 1
) ELSE (
    ECHO ✓ Database connection successful
)

ECHO.
ECHO --- Running Database Migrations... ---

REM Process migration files in order
FOR %%F IN (migrations\*.sql) DO (
    IF EXIST "%%F" (
        ECHO Executing %%F...
        psql "%DATABASE_URL%" -f "%%F" >nul 2>nul
        IF ERRORLEVEL 1 (
            ECHO ERROR: Failed to execute %%F
            EXIT /B 1
        ) ELSE (
            ECHO ✓ Successfully executed %%F
        )
    )
)

ECHO.
ECHO --- Migration Summary ---
ECHO All migration scripts have been executed successfully!

ECHO.
ECHO --- Cloud Migration Complete! ---
ECHO Your cloud database has been successfully set up with all migrations.