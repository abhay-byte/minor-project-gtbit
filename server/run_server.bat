@ECHO OFF
setlocal enabledelayedexpansion

ECHO.
ECHO --- Clinico Backend Start Script ---
ECHO.

echo =====================================
echo Checking for Node.js and Docker...
echo =====================================
echo.

:: Check Node.js
node -v >nul 2>&1
if %errorlevel%==0 (
    echo Node.js is installed.
    for /f "delims=" %%v in ('node -v') do echo Version: %%v
) else (
    echo Node.js is NOT installed.
    echo Please install Node.js v18 or higher before continuing.
    pause
    exit /b
)

echo.

:: Check Docker
docker -v >nul 2>&1
if %errorlevel%==0 (
    echo Docker is installed.
    for /f "delims=" %%v in ('docker -v') do echo Version: %%v
) else (
    echo Docker is NOT installed.
    echo Please install Docker Desktop before continuing.
    pause
    exit /b
)

echo.
echo =====================================
echo Check complete.
echo =====================================


REM Check if .env file exists
if not exist "src\.env" (
    
    echo Create .env file in /src and continue. Exiting now...
    echo.
    pause
    exit /b 0
   
)


REM =================================================================
REM Step 2: Perform One-Time Setup (if needed)
REM =================================================================

IF NOT EXIST "src\_setup_complete.flag" (
    ECHO --- Performing first-time setup... ---
    ECHO.

    ECHO 1. Installing npm packages...
    pushd src
    CALL npm install || ECHO [Warning] npm install failed or returned warnings.
    popd
    ECHO.

    ECHO 2. Starting database for seeding...
    pushd database
    CALL db_start.bat || ECHO [Warning] Could not start database.
    popd
    ECHO.

    ECHO 3. Seeding the database...
    pushd src
    CALL npm run db:seed || ECHO [Warning] Database seeding may have failed.
    popd
    ECHO.

    ECHO 4. Marking setup as complete...
    ECHO Setup completed on %DATE% %TIME% > "src\_setup_complete.flag"
    ECHO.
    ECHO --- First-time setup finished successfully! ---
    ECHO.
) ELSE (
    ECHO --- Initial setup already completed. Skipping... ---
    ECHO.
)


REM =================================================================
REM Step 3: Start Services
REM =================================================================
ECHO.
ECHO Step 1: Starting PostgreSQL Database...
ECHO =======================================
pushd database
CALL db_start.bat || ECHO [Warning] Database may not have started correctly.
popd
ECHO.

ECHO Step 2: Starting Node.js API Server...
ECHO =======================================
pushd src
ECHO Starting server with "npm run start". Press CTRL+C to stop.
CALL npm run start
popd

ECHO.
ECHO --- Script finished. ---
pause
