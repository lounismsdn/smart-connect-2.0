# Developer Dev Server Orchestrator
# Automatically opens separate terminal windows in the correct folder directories to run client and server.

Write-Host '==========================================' -ForegroundColor Blue
Write-Host '   NFC and QR Analytics Platform Manager   ' -ForegroundColor Blue
Write-Host '==========================================' -ForegroundColor Blue

# Resolve absolute paths
$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
if ([string]::IsNullOrEmpty($PSScriptRoot)) {
    $PSScriptRoot = Get-Location
}

$ServerDir = Join-Path $PSScriptRoot "server"
$ClientDir = Join-Path $PSScriptRoot "client"

# Start the Express backend server
Write-Host "Launching Express Backend Server in $ServerDir..." -ForegroundColor Cyan
Start-Process cmd.exe -WorkingDirectory $ServerDir -ArgumentList '/k', 'npm run dev'

# Start the Vite React client
Write-Host "Launching React Frontend Dev Server in $ClientDir..." -ForegroundColor Cyan
Start-Process cmd.exe -WorkingDirectory $ClientDir -ArgumentList '/k', 'npm run dev'

Write-Host ''
Write-Host 'App Services initiated successfully!' -ForegroundColor Green
Write-Host 'Backend API:      http://localhost:5000' -ForegroundColor Yellow
Write-Host 'Dashboard Portal: http://localhost:5173' -ForegroundColor Yellow
Write-Host '==========================================' -ForegroundColor Blue
