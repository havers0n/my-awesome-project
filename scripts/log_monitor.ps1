# log_monitor.ps1 - Автоматический мониторинг логов ML-системы для Windows
# Использование: .\log_monitor.ps1 [-Watch] [-Report]

param(
    [switch]$Watch,
    [switch]$Report
)

# Функции для цветного вывода
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

# Проверка backend логов
function Check-BackendLogs {
    Write-Host "=== 1. Backend логи ===" -ForegroundColor Cyan
    
    # Поиск файлов логов
    $backendLogs = @()
    $patterns = @("backend.log", "backend*.log", "logs\backend*.log", "dist\backend*.log")
    
    foreach ($pattern in $patterns) {
        $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
        if ($files) {
            $backendLogs += $files
        }
    }
    
    if ($backendLogs.Count -eq 0) {
        Write-Warn "Backend логи не найдены. Проверьте, что сервер запущен."
        return $false
    }
    
    $logFile = $backendLogs[0].FullName
    Write-Info "Используется файл: $logFile"
    
    # Проверка запросов прогнозирования
    Write-Host "📊 Последние запросы прогнозирования:" -ForegroundColor Blue
    
    if (Select-String -Path $logFile -Pattern "=== ML REQUEST DATA" -ErrorAction SilentlyContinue) {
        Get-Content $logFile | Select-String -Pattern "(=== ML REQUEST DATA|--- FINAL PAYLOAD)" | Select-Object -Last 5
    } else {
        Write-Warn "Запросы прогнозирования не найдены"
    }
    
    Write-Host
    
    # Проверка ошибок валидации
    Write-Host "🔍 Проверка ошибок валидации:" -ForegroundColor Blue
    
    if (Select-String -Path $logFile -Pattern "VALIDATION ERROR" -ErrorAction SilentlyContinue) {
        Write-Error "Найдены ошибки валидации!"
        Get-Content $logFile | Select-String -Pattern "VALIDATION ERROR" | Select-Object -Last 3
        Get-Content $logFile | Select-String -Pattern "422" | Select-Object -Last 3
    } else {
        Write-Info "Ошибки валидации не найдены"
    }
    
    Write-Host
    
    # Проверка формата данных
    Write-Host "📋 Проверка формата данных:" -ForegroundColor Blue
    
    $mlRequestData = Get-Content $logFile | Select-String -Pattern "=== ML REQUEST DATA" -Context 0,5 -ErrorAction SilentlyContinue
    if ($mlRequestData -and ($mlRequestData | Select-String -Pattern "DaysCount")) {
        Write-Info "Формат заголовка корректен (DaysCount найден)"
    } else {
        Write-Warn "Возможные проблемы с форматом заголовка"
    }
    
    # Проверка дат
    $datePattern = '"Период":"\\d{4}-\\d{2}-\\d{2}"'
    if ($mlRequestData -and ($mlRequestData | Select-String -Pattern $datePattern)) {
        Write-Info "Формат дат корректен (YYYY-MM-DD)"
    } else {
        Write-Warn "Возможные проблемы с форматом дат"
    }
    
    Write-Host
    return $true
}

# Проверка ML-сервиса
function Check-MLService {
    Write-Host "=== 2. ML-сервис ===" -ForegroundColor Cyan
    
    $mlUrl = "http://localhost:5678"
    
    # Проверка доступности
    try {
        $response = Invoke-RestMethod -Uri "$mlUrl/health" -Method Get -TimeoutSec 5
        Write-Info "ML-сервис доступен"
        
        # Получение статуса
        if ($response.status -eq "ok") {
            Write-Info "Статус: OK"
        } else {
            Write-Warn "Статус: $($response.status)"
        }
        
        # Проверка модели
        if ($response.model_loaded -eq $true) {
            Write-Info "Модель загружена"
        } else {
            Write-Error "Модель не загружена!"
        }
        
    } catch {
        Write-Error "ML-сервис недоступен (порт 5678)"
        Write-Info "Попробуйте запустить: cd ml; python -m uvicorn api_main:app --host 0.0.0.0 --port 5678"
    }
    
    Write-Host
    
    # Проверка логов ML-сервиса
    Write-Host "📋 ML-сервис логи:" -ForegroundColor Blue
    
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
        Write-Info "Используется файл: $mlLog"
        
        # Последние ошибки
        if (Select-String -Path $mlLog -Pattern "ERROR" -ErrorAction SilentlyContinue) {
            Write-Warn "Найдены ошибки в ML-сервисе:"
            Get-Content $mlLog | Select-String -Pattern "ERROR" | Select-Object -Last 3
        } else {
            Write-Info "Ошибки в логах ML-сервиса не найдены"
        }
        
        # Проверка на unseen labels
        if (Select-String -Path $mlLog -Pattern "y contains previously unseen labels" -ErrorAction SilentlyContinue) {
            Write-Error "Найдены неизвестные товары в данных!"
            Get-Content $mlLog | Select-String -Pattern "unseen labels" -Context 2,2 | Select-Object -Last 5
        } else {
            Write-Info "Проблемы с неизвестными товарами не найдены"
        }
        
    } else {
        Write-Warn "Логи ML-сервиса не найдены"
    }
    
    Write-Host
}

# Проверка frontend
function Check-Frontend {
    Write-Host "=== 3. Frontend ===" -ForegroundColor Cyan
    
    # Проверка доступности frontend
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
        Write-Info "Frontend доступен (порт 3000)"
    } catch {
        Write-Warn "Frontend недоступен (порт 3000)"
        Write-Info "Попробуйте запустить: cd frontend; npm run dev"
    }
    
    Write-Host "📱 Для проверки frontend логов:" -ForegroundColor Blue
    Write-Host "   1. Откройте браузер → DevTools (F12)"
    Write-Host "   2. Перейдите на вкладку Console"
    Write-Host "   3. Запустите прогнозирование"
    Write-Host "   4. Проверьте наличие:"
    Write-Host "      ✓ 'Forecast prediction initiated successfully'" -ForegroundColor Green
    Write-Host "      ✗ 'Failed to start forecast prediction'" -ForegroundColor Red
    Write-Host "      ✗ 'API недоступен, используем моки'" -ForegroundColor Red
    
    Write-Host
}

# Проверка общего состояния системы
function Check-SystemHealth {
    Write-Host "=== 4. Общее состояние системы ===" -ForegroundColor Cyan
    
    # Проверка процессов
    Write-Host "🔄 Запущенные процессы:" -ForegroundColor Blue
    
    if (Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*backend*" }) {
        Write-Info "Backend процесс запущен"
    } else {
        Write-Warn "Backend процесс не найден"
    }
    
    if (Get-Process | Where-Object { $_.ProcessName -eq "python" -and $_.CommandLine -like "*uvicorn*api_main*" }) {
        Write-Info "ML-сервис процесс запущен"
    } else {
        Write-Warn "ML-сервис процесс не найден"
    }
    
    if (Get-Process | Where-Object { $_.ProcessName -eq "node" -and $_.CommandLine -like "*vite*" }) {
        Write-Info "Frontend процесс запущен"
    } else {
        Write-Warn "Frontend процесс не найден"
    }
    
    Write-Host
    
    # Проверка портов
    Write-Host "🔌 Проверка портов:" -ForegroundColor Blue
    
    if (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) {
        Write-Info "Порт 3000 (backend) открыт"
    } else {
        Write-Warn "Порт 3000 (backend) закрыт"
    }
    
    if (Get-NetTCPConnection -LocalPort 5678 -ErrorAction SilentlyContinue) {
        Write-Info "Порт 5678 (ML-сервис) открыт"
    } else {
        Write-Warn "Порт 5678 (ML-сервис) закрыт"
    }
    
    Write-Host
}

# Генерация отчета
function Generate-Report {
    Write-Host "=== 5. Отчет ===" -ForegroundColor Cyan
    
    $reportFile = "log_monitor_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
    
    Write-Host "📄 Генерация отчета: $reportFile" -ForegroundColor Blue
    
    $report = @"
Отчет мониторинга ML-системы
Дата: $(Get-Date)
==========================

Backend логи:
$(Check-BackendLogs *>&1)

ML-сервис:
$(Check-MLService *>&1)

Frontend:
$(Check-Frontend *>&1)

Система:
$(Check-SystemHealth *>&1)
"@
    
    $report | Out-File -FilePath $reportFile -Encoding UTF8
    Write-Info "Отчет сохранен в: $reportFile"
}

# Режим наблюдения
function Watch-Mode {
    Write-Host "🔍 Режим наблюдения (обновление каждые 30 секунд)" -ForegroundColor Yellow
    Write-Host "Для выхода нажмите Ctrl+C" -ForegroundColor Yellow
    Write-Host
    
    while ($true) {
        Clear-Host
        Write-Host "=== Мониторинг логов ML-системы ===" -ForegroundColor Magenta
        Write-Host "Время: $(Get-Date)" -ForegroundColor Gray
        Write-Host
        
        Check-BackendLogs | Out-Null
        Check-MLService
        Check-Frontend
        
        Start-Sleep -Seconds 30
    }
}

# Основная функция
function Main {
    Write-Host "🚀 Мониторинг логов ML-системы" -ForegroundColor Magenta
    Write-Host "Дата: $(Get-Date)" -ForegroundColor Gray
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
    
    Write-Host "✅ Мониторинг завершен" -ForegroundColor Green
}

# Запуск
Main
