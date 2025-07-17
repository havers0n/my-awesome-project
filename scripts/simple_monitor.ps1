# Simple ML System Log Monitor for Windows
# Usage: .\simple_monitor.ps1

Write-Host "ML System Log Monitor" -ForegroundColor Magenta
Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
Write-Host

# Check backend logs
Write-Host "=== Backend Logs ===" -ForegroundColor Cyan

$backendLogs = Get-ChildItem -Path "backend*.log", "*.log" -ErrorAction SilentlyContinue
if ($backendLogs) {
    Write-Host "[INFO] Found backend logs: $($backendLogs.Name)" -ForegroundColor Green
    
    # Check for ML requests
    $mlRequests = Select-String -Path $backendLogs[0] -Pattern "=== ML REQUEST DATA" -ErrorAction SilentlyContinue
    if ($mlRequests) {
        Write-Host "[INFO] ML requests found: $($mlRequests.Count)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] No ML requests found" -ForegroundColor Yellow
    }
    
    # Check for validation errors
    $validationErrors = Select-String -Path $backendLogs[0] -Pattern "VALIDATION ERROR" -ErrorAction SilentlyContinue
    if ($validationErrors) {
        Write-Host "[ERROR] Validation errors found: $($validationErrors.Count)" -ForegroundColor Red
    } else {
        Write-Host "[INFO] No validation errors" -ForegroundColor Green
    }
} else {
    Write-Host "[WARN] No backend logs found" -ForegroundColor Yellow
}

Write-Host

# Check ML service
Write-Host "=== ML Service ===" -ForegroundColor Cyan

try {
    $mlHealth = Invoke-RestMethod -Uri "http://localhost:5678/health" -Method Get -TimeoutSec 5
    Write-Host "[INFO] ML service is available" -ForegroundColor Green
    Write-Host "[INFO] Status: $($mlHealth.status)" -ForegroundColor Green
    Write-Host "[INFO] Model loaded: $($mlHealth.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] ML service unavailable on port 5678" -ForegroundColor Red
    Write-Host "[INFO] Try: cd ml; python -m uvicorn api_main:app --host 0.0.0.0 --port 5678" -ForegroundColor Yellow
}

Write-Host

# Check frontend
Write-Host "=== Frontend ===" -ForegroundColor Cyan

try {
    $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[INFO] Frontend is available on port 3000" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Frontend unavailable on port 3000" -ForegroundColor Yellow
    Write-Host "[INFO] Try: cd frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host

# Check processes
Write-Host "=== System Health ===" -ForegroundColor Cyan

$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "[INFO] Node.js processes: $($nodeProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "[WARN] No Node.js processes found" -ForegroundColor Yellow
}

$pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "[INFO] Python processes: $($pythonProcesses.Count)" -ForegroundColor Green
} else {
    Write-Host "[WARN] No Python processes found" -ForegroundColor Yellow
}

Write-Host

# Check ports
Write-Host "=== Port Status ===" -ForegroundColor Cyan

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "[INFO] Port 3000 (backend) is open" -ForegroundColor Green
} else {
    Write-Host "[WARN] Port 3000 (backend) is closed" -ForegroundColor Yellow
}

$port5678 = Get-NetTCPConnection -LocalPort 5678 -ErrorAction SilentlyContinue
if ($port5678) {
    Write-Host "[INFO] Port 5678 (ML service) is open" -ForegroundColor Green
} else {
    Write-Host "[WARN] Port 5678 (ML service) is closed" -ForegroundColor Yellow
}

Write-Host

# Frontend log check instructions
Write-Host "=== Frontend Log Check ===" -ForegroundColor Cyan
Write-Host "To check frontend logs:" -ForegroundColor Blue
Write-Host "1. Open browser DevTools (F12)"
Write-Host "2. Go to Console tab"
Write-Host "3. Run forecasting"
Write-Host "4. Look for:"
Write-Host "   - 'Forecast prediction initiated successfully' (good)" -ForegroundColor Green
Write-Host "   - 'Failed to start forecast prediction' (bad)" -ForegroundColor Red
Write-Host "   - 'API unavailable, using mocks' (bad)" -ForegroundColor Red

Write-Host
Write-Host "Monitoring completed" -ForegroundColor Green
