# --- ШАГ 1: ПОДГОТОВКА ---
Write-Host "Подготовка к тесту..." -ForegroundColor Cyan

# Вставьте ваш самый свежий токен из браузера сюда
$token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjZqeGVNTzVvSnpuV3VOdkMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3V4Y3N6aXlsbXlvZ3ZjcXl5dWl3LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5NzIwMDdmNS0zMDVmLTQ5Y2EtYTM1MS1lYTU1MjBhMDk4MmMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUyMjA0MzYzLCJpYXQiOjE3NTIyMDA3NjMsImVtYWlsIjoiZGFueXBldHJvdjIwMDJAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiZGFuaWVsIGhhdmVyc29uIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTE1NjQyODN9XSwic2Vzc2lvbl9pZCI6IjJkMDk5ZDQ1LWJjZTQtNGYwZS1hOTNmLTliN2VhOTc5ZTAxNiIsImlzX2Fub255bW91cyI6ZmFsc2V9._gd7je_8OJrY3TQH4btqjzW6JZNmcyMwY0a-f5WdYzA"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json; charset=utf-8"
}

# --- ШАГ 2: ФОРМИРОВАНИЕ ПРАВИЛЬНОГО ТЕЛА ЗАПРОСА ---
# Мы отправляем МАССИВ, как того требует валидация на бэкенде.
# Второй объект - "пустышка" для прохождения более строгой валидации.
$body = @"
[
    {
        "DaysCount": 7
    },
    {
        "Type": "Продажа",
        "Период": "2024-01-01",
        "Номенклатура": "Тестовый товар",
        "Количество": 1
    }
]
"@

$uri = "http://localhost:3000/api/predictions/predict"

# --- ШАГ 3: ВЫПОЛНЕНИЕ ТЕСТА ---
Write-Host "Запускаю тест API прогнозирования..." -ForegroundColor Cyan
Write-Host "URL: $uri" -ForegroundColor Yellow
Write-Host "Body: $body" -ForegroundColor Yellow

try {
    # Используем Invoke-RestMethod, он лучше работает с JSON
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    
    Write-Host "`n--- УСПЕХ! ---" -ForegroundColor Green
    Write-Host "Статус код: 200 (OK)" -ForegroundColor Green
    Write-Host "Ответ от сервера:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "`n--- ОШИБКА! ---" -ForegroundColor Red
    
    $exception = $_.Exception
    if ($exception -and $exception.Response) {
        $statusCode = [int]$exception.Response.StatusCode
        Write-Host "Статус код: $statusCode" -ForegroundColor Yellow
        
        $stream = $exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()

        Write-Host "Тело ответа с ошибкой:" -ForegroundColor Yellow
        $responseBody
    }
    else {
        Write-Host "Детали исключения: $($_.Exception.Message)" -ForegroundColor Red
    }
}

