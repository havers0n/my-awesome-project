$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyMDk4MjIzLCJpYXQiOjE3NTIwOTQ2MjMsImlzcyI6Imh0dHBzOi8vdXhjc3ppeWxteW9ndmNxeXl1aXcuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjJlNGY0ODY1LTdjMzEtNDU2YS1iZjE0LTc3ZGQ5ZWFmNzhmYyIsImVtYWlsIjoiZGFueXB1dGluMTIzQGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnt9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzUyMDk0NjIzfV0sInNlc3Npb25faWQiOiJhYTJkMGM2Mi1hMjhmLTQ3YzItOTMxNS0xMjk3ZjVjZjBkZjcifQ.IgEpNvQ_tXUHLJz-VmGMNYEUzLHUVSMSjfHo3bJFvIE"
}

$body = '[{"DaysCount": 5}]'

Write-Host "Testing /api/predictions/test-predict-no-auth endpoint (no auth needed)..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/predictions/test-predict-no-auth" -Method POST -Headers @{"Content-Type" = "application/json"} -Body $body
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}

Write-Host "`nTesting /api/predictions/predict endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/predictions/predict" -Method POST -Headers $headers -Body $body
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}

Write-Host "`nTesting /api/predictions/forecast endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/predictions/forecast?days=14" -Method GET -Headers $headers
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}

Write-Host "`nTesting /api/predictions/history endpoint..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/predictions/history?page=1&limit=5" -Method GET -Headers $headers
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}
