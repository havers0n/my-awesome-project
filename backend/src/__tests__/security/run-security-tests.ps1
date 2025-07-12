# Security Testing Script for Windows
# This script runs all security tests including OWASP ZAP scanning

Write-Host "================================" -ForegroundColor Yellow
Write-Host "Starting Security Test Suite" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Change to backend root directory
Set-Location -Path "..\..\..\"

# Run npm audit
Write-Host "`nRunning npm audit to check dependencies..." -ForegroundColor Yellow
npm audit --production

# Save audit report
npm audit --json | Out-File -FilePath "src\__tests__\security\npm-audit-report.json"

# Run Jest security tests
Write-Host "`nRunning Jest security tests..." -ForegroundColor Yellow
npm test -- src/__tests__/security/ --coverage --coverageDirectory=./src/__tests__/security/coverage

# Check if OWASP ZAP is installed
$zapPath = "C:\Program Files\OWASP\Zed Attack Proxy\zap.bat"
$zapPathAlt = "C:\Program Files (x86)\OWASP\Zed Attack Proxy\zap.bat"

if (Test-Path $zapPath) {
    $zap = $zapPath
} elseif (Test-Path $zapPathAlt) {
    $zap = $zapPathAlt
} else {
    $zap = Get-Command zap.bat -ErrorAction SilentlyContinue
}

if ($zap) {
    Write-Host "`nStarting OWASP ZAP scan..." -ForegroundColor Yellow
    
    # Check if application is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -ErrorAction Stop
        $appRunning = $true
    } catch {
        $appRunning = $false
    }
    
    # Start application if not running
    if (-not $appRunning) {
        Write-Host "Starting application for security scanning..."
        $app = Start-Process npm -ArgumentList "start" -PassThru -NoNewWindow
        Start-Sleep -Seconds 10
    }
    
    # Run ZAP scan
    & $zap -cmd -autorun "src\__tests__\security\zap-config.yaml"
    
    # Stop application if we started it
    if ($app) {
        Stop-Process -Id $app.Id -Force
    }
} else {
    Write-Host "OWASP ZAP not found. Please install it for automated security scanning." -ForegroundColor Red
    Write-Host "Download from: https://www.zaproxy.org/download/" -ForegroundColor Red
}

# Generate summary report
Write-Host "`nGenerating security test summary..." -ForegroundColor Yellow

$date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$auditResults = npm audit --production 2>&1 | Select-String -Pattern "found|vulnerabilities"

$summaryContent = @"
# Security Test Summary

Generated on: $date

## NPM Audit Results
$auditResults

## Jest Security Tests
- SQL Injection Tests: src\__tests__\security\sql-injection.test.ts
- XSS Tests: src\__tests__\security\xss.test.ts
- CSRF Tests: src\__tests__\security\csrf.test.ts
- Rate Limiting Tests: src\__tests__\security\rate-limiting.test.ts
- JWT/Auth Tests: src\__tests__\security\jwt-refresh.test.ts
- Access Control Tests: src\__tests__\security\protected-resources.test.ts

## OWASP ZAP Scan
Check security-reports\ZAP-Report.html for detailed results

## Recommendations
1. Fix all high and critical vulnerabilities found by npm audit
2. Review and fix any failing security tests
3. Address issues found by OWASP ZAP scan
4. Regularly update dependencies
5. Implement security headers
6. Enable HTTPS in production
7. Use environment variables for sensitive data
8. Implement proper logging and monitoring
"@

$summaryContent | Out-File -FilePath "src\__tests__\security\security-test-summary.md" -Encoding UTF8

Write-Host "`nSecurity testing completed!" -ForegroundColor Green
Write-Host "Check the following files for results:" -ForegroundColor Green
Write-Host "- npm-audit-report.json" -ForegroundColor White
Write-Host "- coverage\lcov-report\index.html" -ForegroundColor White
Write-Host "- security-reports\ZAP-Report.html" -ForegroundColor White
Write-Host "- security-test-summary.md" -ForegroundColor White
