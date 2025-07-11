# log_monitor.ps1 - Monitoring ML System Logs for Windows
# Usage: .\log_monitor.ps1 [-Watch] [-Report]

param(
    [switch]$Watch,
    [switch]$Report
)

# Color output functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check backend logs
function Check-BackendLogs {
    Write-Host "=== 1. Backend Logs ===" -ForegroundColor Cyan
    
    # Search for log files
    $backendLogs = @()
    $patterns = @("backend.log", "backend*.log", "logs\backend*.log", "dist\backend*.log")
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        if ($files) {
            $backendLogs += $files
        }
    }
    
    if ($backendLogs.Count -eq 0) {
        Write-Warn "Backend logs not found. Check if server is running."
        return $false
    }
    
    $logFile = $backendLogs[0].FullName
    Write-Info "Using file: $logFile"
    
    # Check prediction requests
    Write-Host "📊 Recent prediction requests:" -ForegroundColor Blue
    
    if (Select-String -Path $logFile -Pattern "=== ML REQUEST DATA" -ErrorAction SilentlyContinue) {
        Get-Content $logFile | Select-String -Pattern "=== ML REQUEST DATA" | Select-Object -Last 5
        Get-Content $logFile | Select-String -Pattern "--- FINAL PAYLOAD" | Select-Object -Last 5
    } else {
        Write-Warn "No prediction requests found"
    }
    
    Write-Host
    
    # Check validation errors
    Write-Host "🔍 Validation errors check:" -ForegroundColor Blue
    
    if (Select-String -Path $logFile -Pattern "VALIDATION ERROR" -ErrorAction SilentlyContinue) {
        Write-Error "Validation errors found!"
        Get-Content $logFile | Select-String -Pattern "VALIDATION ERROR" | Select-Object -Last 3
        Get-Content $logFile | Select-String -Pattern "422" | Select-Object -Last 3
    } else {
        Write-Info "No validation errors found"
    }
    
    Write-Host
    
    # Check data format
    Write-Host "📋 Data format check:" -ForegroundColor Blue
    
    $mlRequestData = Get-Content $logFile | Select-String -Pattern "=== ML REQUEST DATA" -Context 0,5 -ErrorAction SilentlyContinue
    if ($mlRequestData -and ($mlRequestData | Select-String -Pattern "DaysCount")) {
        Write-Info "Header format correct (DaysCount found)"
    } else {
        Write-Warn "Possible header format issues"
    }
    
    # Check dates
    $datePattern = '"Период":"\\d{4}-\\d{2}-\\d{2}"'
    if ($mlRequestData -and ($mlRequestData | Select-String -Pattern $datePattern)) {
        Write-Info "Date format correct (YYYY-MM-DD)"
    } else {
        Write-Warn "Possible date format issues"
    }
    
    Write-Host
    return $true
}

# Check ML service
function Check-MLService {
    Write-Host "=== 2. ML Service ===" -ForegroundColor Cyan
    
    $mlUrl = "http://localhost:5678"
    
    # Check availability
    try {
        $response = Invoke-RestMethod -Uri "$mlUrl/health" -Method Get -TimeoutSec 5
        Write-Info "ML service available"
        
        # Get status
        if ($response.status -eq "ok") {
            Write-Info "Status: OK"
        } else {
            Write-Warn "Status: $($response.status)"
        }
        
        # Check model
        if ($response.model_loaded -eq $true) {
            Write-Info "Model loaded"
        } else {
            Write-Error "Model not loaded!"
        }
        
    } catch {
        Write-Error "ML service unavailable (port 5678)"
        Write-Info "Try running: cd ml; python -m uvicorn api_main:app --host 0.0.0.0 --port 5678"
    }
    
    Write-Host
    
    # Check ML service logs
    Write-Host "📋 ML service logs:" -ForegroundColor Blue
    
    $mlLogs = @()
    $patterns = @("ml_service.log", "ml\*.log", "logs\ml*.log")
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        if ($files) {
            $mlLogs += $files
        }
    }
    
    if ($mlLogs.Count -gt 0) {
        $mlLog = $mlLogs[0].FullName
        Write-Info "Using file: $mlLog"
        
        # Recent errors
        if (Select-String -Path $mlLog -Pattern "ERROR" -ErrorAction SilentlyContinue) {
            Write-Warn "Errors found in ML service:"
            Get-Content $mlLog | Select-String -Pattern "ERROR" | Select-Object -Last 3
        } else {
            Write-Info "No errors found in ML service logs"
        }
        
        # Check for unseen labels
        if (Select-String -Path $mlLog -Pattern "y contains previously unseen labels" -ErrorAction SilentlyContinue) {
            Write-Error "Unknown products found in data!"
            Get-Content $mlLog | Select-String -Pattern "unseen labels" -Context 2,2 | Select-Object -Last 5
        } else {
            Write-Info "No unknown products issues found"
        }
        
    } else {
        Write-Warn "ML service logs not found"
    }
    
    Write-Host
}

# Check frontend
function Check-Frontend {
    Write-Host "=== 3. Frontend ===" -ForegroundColor Cyan
    
    # Check frontend availability
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Info "Frontend available (port 3000)"
    } catch {
        Write-Warn "Frontend unavailable (port 3000)"
        Write-Info "Try running: cd frontend; npm run dev"
    }
    
    Write-Host "📱 To check frontend logs:" -ForegroundColor Blue
    Write-Host "   1. Open browser → DevTools (F12)"
    Write-Host "   2. Go to Console tab"
    Write-Host "   3. Run forecasting"
    Write-Host "   4. Check for:"
    Write-Host "      ✓ 'Forecast prediction initiated successfully'" -ForegroundColor Green
    Write-Host "      ✗ 'Failed to start forecast prediction'" -ForegroundColor Red
    Write-Host "      ✗ 'API unavailable, using mocks'" -ForegroundColor Red
    
    Write-Host
}

# Check system health
function Check-SystemHealth {
    Write-Host "=== 4. System Health ===" -ForegroundColor Cyan
    
    # Check processes
    Write-Host "🔄 Running processes:" -ForegroundColor Blue
    
    if (Get-Process | Where-Object { $_.ProcessName -eq "node" }) {
        Write-Info "Node processes found"
    } else {
        Write-Warn "No node processes found"
    }
    
    if (Get-Process | Where-Object { $_.ProcessName -eq "python" }) {
        Write-Info "Python processes found"
    } else {
        Write-Warn "No python processes found"
    }
    
    Write-Host
    
    # Check ports
    Write-Host "🔌 Port check:" -ForegroundColor Blue
    
    if (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) {
        Write-Info "Port 3000 (backend) open"
    } else {
        Write-Warn "Port 3000 (backend) closed"
    }
    
    if (Get-NetTCPConnection -LocalPort 5678 -ErrorAction SilentlyContinue) {
        Write-Info "Port 5678 (ML service) open"
    } else {
        Write-Warn "Port 5678 (ML service) closed"
    }
    
    Write-Host
}

# Generate report
function Generate-Report {
    Write-Host "=== 5. Report ===" -ForegroundColor Cyan
    
    $reportFile = "log_monitor_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    Write-Host "📄 Generating report: $reportFile" -ForegroundColor Blue
    
    $report = @"
ML System Monitoring Report
Date: $(Get-Date)
==========================

Backend logs:
$(Check-BackendLogs *>&1)

ML service:
$(Check-MLService *>&1)

Frontend:
$(Check-Frontend *>&1)

System:
$(Check-SystemHealth *>&1)
"@
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Info "Report saved to: $reportFile"
}

# Watch mode
function Watch-Mode {
    Write-Host "🔍 Watch mode (updates every 30 seconds)" -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to exit" -ForegroundColor Yellow
    Write-Host
    
    while ($true) {
        Clear-Host
        Write-Host "=== ML System Log Monitoring ===" -ForegroundColor Magenta
        Write-Host "Time: $(Get-Date)" -ForegroundColor Gray
        Write-Host
        
        Check-BackendLogs | Out-Null
        Check-MLService
        Check-Frontend
        
        Start-Sleep -Seconds 30
    }
}

# Main function
function Main {
    Write-Host "🚀 ML System Log Monitoring" -ForegroundColor Magenta
    Write-Host "Date: $(Get-Date)" -ForegroundColor Gray
    Write-Host
    
    if ($Watch) {
        Watch-Mode
    } else {
        Check-BackendLogs | Out-Null
        Check-MLService
        Check-Frontend
        Check-SystemHealth
        
        if ($Report) {
            Generate-Report
        }
    }
    
    Write-Host "✅ Monitoring completed" -ForegroundColor Green
}

# Run
Main
