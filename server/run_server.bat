@ECHO OFF
CLS
ECHO.
ECHO --- Starting Clinico Backend Server ---
ECHO.

ECHO.
ECHO Step 1: Starting PostgreSQL Database...
ECHO =======================================
REM Navigate to the database directory, call the start script, and then return.
cd database
CALL ./db_start.bat

ECHO.
ECHO Step 2: Starting Node.js API Server...
ECHO =======================================
REM Navigate to the src directory and start the application.
cd ..
cd src
npm run start

cd ..
