# --- STEP 1: PREPARATION ---
Write-Host "Preparing test..." -ForegroundColor Cyan

# Insert your latest token here
$token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjZqeGVNTzVvSnpuV3VOdkMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3V4Y3N6aXlsbXlvZ3ZjcXl5dWl3LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5NzIwMDdmNS0zMDVmLTQ5Y2EtYTM1MS1lYTU1MjBhMDk4MmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyMjA0MzYzLCJpYXQiOjE3NTIyMDA3NjMsImVtYWlsIjoiZGFueXBldHJvdjIwMDJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiZGFuaWVsIGhhdmVyc29uIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTE1NjQyODN9XSwic2Vzc2lvbl9pZCI6IjJkMDk5ZDQ1LWJjZTQtNGYwZS1hOTNmLTliN2VhOTc5ZTAxNiIsImlzX2Fub255bW91cyI6ZmFsc2V9._gd7je_8OJrY3TQH4btqjzW6JZNmcyMwY0a-f5WdYzA"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

# --- STEP 2: FORM CORRECT REQUEST BODY ---
# We send an ARRAY as required by backend validation.
# Second object is a 'dummy' for strict validation.
$body = @"
[
    {
        "DaysCount": 7
    },
    {
        "Type": "Sale",
        "Period": "2024-01-01",
        "Item": "Test product",
        "Quantity": 1
    }
]
"@

$uri = "http://localhost:3000/api/predictions/predict"

# --- STEP 3: RUN THE TEST ---
Write-Host "Starting API forecast test..." -ForegroundColor Cyan
Write-Host "URL: $uri" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    Write-Host "`n--- SUCCESS! ---" -ForegroundColor Green
    Write-Host "Status code: 200 (OK)" -ForegroundColor Green
    Write-Host "Server response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "`n--- ERROR! ---" -ForegroundColor Red
    $exception = $_.Exception
    if ($exception -and $exception.Response) {
        $statusCode = [int]$exception.Response.StatusCode
        Write-Host "Status code: $statusCode" -ForegroundColor Yellow
        $stream = $exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        Write-Host "Error response body:" -ForegroundColor Yellow
        $responseBody
    }
    else {
        Write-Host "Exception details: $($_.Exception.Message)" -ForegroundColor Red
    }
}

