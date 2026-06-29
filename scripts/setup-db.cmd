@echo off
setlocal
cd /d "%~dp0\.."

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not available on PATH.
  echo Install Node.js, then open a new CMD window and run this script again.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm is not installed or not available on PATH.
  echo Install Node.js with npm, then open a new CMD window and run this script again.
  exit /b 1
)

echo Installing dependencies...
call npm install
if errorlevel 1 exit /b 1

echo Preparing Prisma database and seed data...
call npm run db:setup
if errorlevel 1 exit /b 1

echo.
echo Setup complete. Start the app with:
echo   scripts\run-dev.cmd
