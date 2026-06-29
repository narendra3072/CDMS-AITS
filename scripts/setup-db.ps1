$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js is not installed or not available on PATH."
  Write-Host "Install Node.js, then open a new PowerShell window and run this script again."
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm is not installed or not available on PATH."
  Write-Host "Install Node.js with npm, then open a new PowerShell window and run this script again."
  exit 1
}

Write-Host "Installing dependencies..."
npm install

Write-Host "Preparing Prisma database and seed data..."
npm run db:setup

Write-Host ""
Write-Host "Setup complete. Start the app with:"
Write-Host "  .\scripts\run-dev.ps1"
