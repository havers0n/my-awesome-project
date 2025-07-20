# PowerShell скрипт для установки переменной окружения ML_SERVICE_URL
# Запускайте этот скрипт перед запуском backend

Write-Host "🔧 Установка переменной окружения ML_SERVICE_URL..." -ForegroundColor Green

# Устанавливаем переменную окружения
$env:ML_SERVICE_URL = "http://127.0.0.1:8000/predict"

# Проверяем установку
Write-Host "✅ ML_SERVICE_URL установлен: $env:ML_SERVICE_URL" -ForegroundColor Green

# Завершаем все Node.js процессы
Write-Host "🔄 Завершение Node.js процессов..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null

Write-Host "✅ Готово! Теперь запустите backend командой:" -ForegroundColor Green
Write-Host "   cd backend" -ForegroundColor Cyan
Write-Host "   npm run dev" -ForegroundColor Cyan

Write-Host "📝 Примечание: Эта переменная действует только в текущей сессии PowerShell" -ForegroundColor Yellow
Write-Host "   Для постоянного решения создайте файл .env в backend директории" -ForegroundColor Yellow 