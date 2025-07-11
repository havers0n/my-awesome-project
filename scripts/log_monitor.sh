#!/bin/bash

# log_monitor.sh - Автоматический мониторинг логов ML-системы
# Использование: ./log_monitor.sh [--watch]

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для логирования
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка backend логов
check_backend_logs() {
    echo "=== 1. Backend логи ==="
    
    # Поиск файлов логов
    local backend_logs=()
    for pattern in "backend.log" "backend*.log" "logs/backend*.log" "dist/backend*.log"; do
        if ls $pattern 2>/dev/null; then
            backend_logs+=($pattern)
        fi
    done
    
    if [ ${#backend_logs[@]} -eq 0 ]; then
        log_warn "Backend логи не найдены. Проверьте, что сервер запущен."
        return 1
    fi
    
    local log_file=${backend_logs[0]}
    log_info "Используется файл: $log_file"
    
    # Проверка запросов прогнозирования
    echo "📊 Последние запросы прогнозирования:"
    if grep -q "=== ML REQUEST DATA" "$log_file" 2>/dev/null; then
        tail -n 100 "$log_file" | grep -E "(=== ML REQUEST DATA|--- FINAL PAYLOAD)" | tail -5
    else
        log_warn "Запросы прогнозирования не найдены"
    fi
    
    echo
    
    # Проверка ошибок валидации
    echo "🔍 Проверка ошибок валидации:"
    if grep -q "VALIDATION ERROR" "$log_file" 2>/dev/null; then
        log_error "Найдены ошибки валидации!"
        tail -n 100 "$log_file" | grep -E "(VALIDATION ERROR|422)" | tail -3
    else
        log_info "Ошибки валидации не найдены"
    fi
    
    echo
    
    # Проверка формата данных
    echo "📋 Проверка формата данных:"
    if grep -A 5 "=== ML REQUEST DATA" "$log_file" 2>/dev/null | grep -q "DaysCount"; then
        log_info "Формат заголовка корректен (DaysCount найден)"
    else
        log_warn "Возможные проблемы с форматом заголовка"
    fi
    
    # Проверка дат
    if grep -A 20 "=== ML REQUEST DATA" "$log_file" 2>/dev/null | grep -q '"Период":"[0-9]{4}-[0-9]{2}-[0-9]{2}"'; then
        log_info "Формат дат корректен (YYYY-MM-DD)"
    else
        log_warn "Возможные проблемы с форматом дат"
    fi
    
    echo
}

# Проверка ML-сервиса
check_ml_service() {
    echo "=== 2. ML-сервис ==="
    
    local ml_url="http://localhost:5678"
    
    # Проверка доступности
    if curl -s -f "$ml_url/health" > /dev/null 2>&1; then
        log_info "ML-сервис доступен"
        
        # Получение статуса
        local status=$(curl -s "$ml_url/health" | python3 -c "import sys, json; print(json.load(sys.stdin)['status'])" 2>/dev/null || echo "unknown")
        if [ "$status" = "ok" ]; then
            log_info "Статус: OK"
        else
            log_warn "Статус: $status"
        fi
        
        # Проверка модели
        local model_loaded=$(curl -s "$ml_url/health" | python3 -c "import sys, json; print(json.load(sys.stdin)['model_loaded'])" 2>/dev/null || echo "unknown")
        if [ "$model_loaded" = "True" ]; then
            log_info "Модель загружена"
        else
            log_error "Модель не загружена!"
        fi
        
    else
        log_error "ML-сервис недоступен (порт 5678)"
        log_info "Попробуйте запустить: cd ml && python -m uvicorn api_main:app --host 0.0.0.0 --port 5678"
    fi
    
    echo
    
    # Проверка логов ML-сервиса
    echo "📋 ML-сервис логи:"
    local ml_logs=()
    for pattern in "ml_service.log" "ml/*.log" "logs/ml*.log"; do
        if ls $pattern 2>/dev/null; then
            ml_logs+=($pattern)
        fi
    done
    
    if [ ${#ml_logs[@]} -gt 0 ]; then
        local ml_log=${ml_logs[0]}
        log_info "Используется файл: $ml_log"
        
        # Последние ошибки
        if grep -q "ERROR" "$ml_log" 2>/dev/null; then
            log_warn "Найдены ошибки в ML-сервисе:"
            tail -n 50 "$ml_log" | grep "ERROR" | tail -3
        else
            log_info "Ошибки в логах ML-сервиса не найдены"
        fi
        
        # Проверка на unseen labels
        if grep -q "y contains previously unseen labels" "$ml_log" 2>/dev/null; then
            log_error "Найдены неизвестные товары в данных!"
            tail -n 50 "$ml_log" | grep -B 2 -A 2 "unseen labels" | tail -5
        else
            log_info "Проблемы с неизвестными товарами не найдены"
        fi
        
    else
        log_warn "Логи ML-сервиса не найдены"
    fi
    
    echo
}

# Проверка frontend
check_frontend() {
    echo "=== 3. Frontend ==="
    
    # Проверка доступности frontend
    if curl -s -f "http://localhost:3000" > /dev/null 2>&1; then
        log_info "Frontend доступен (порт 3000)"
    else
        log_warn "Frontend недоступен (порт 3000)"
        log_info "Попробуйте запустить: cd frontend && npm run dev"
    fi
    
    echo "📱 Для проверки frontend логов:"
    echo "   1. Откройте браузер → DevTools (F12)"
    echo "   2. Перейдите на вкладку Console"
    echo "   3. Запустите прогнозирование"
    echo "   4. Проверьте наличие:"
    echo "      ✓ 'Forecast prediction initiated successfully'"
    echo "      ✗ 'Failed to start forecast prediction'"
    echo "      ✗ 'API недоступен, используем моки'"
    
    echo
}

# Проверка общего состояния системы
check_system_health() {
    echo "=== 4. Общее состояние системы ==="
    
    # Проверка процессов
    echo "🔄 Запущенные процессы:"
    
    if pgrep -f "node.*backend" > /dev/null; then
        log_info "Backend процесс запущен"
    else
        log_warn "Backend процесс не найден"
    fi
    
    if pgrep -f "python.*uvicorn.*api_main" > /dev/null; then
        log_info "ML-сервис процесс запущен"
    else
        log_warn "ML-сервис процесс не найден"
    fi
    
    if pgrep -f "node.*vite" > /dev/null; then
        log_info "Frontend процесс запущен"
    else
        log_warn "Frontend процесс не найден"
    fi
    
    echo
    
    # Проверка портов
    echo "🔌 Проверка портов:"
    
    if netstat -tuln 2>/dev/null | grep -q ":3000"; then
        log_info "Порт 3000 (backend) открыт"
    else
        log_warn "Порт 3000 (backend) закрыт"
    fi
    
    if netstat -tuln 2>/dev/null | grep -q ":5678"; then
        log_info "Порт 5678 (ML-сервис) открыт"
    else
        log_warn "Порт 5678 (ML-сервис) закрыт"
    fi
    
    echo
}

# Генерация отчета
generate_report() {
    echo "=== 5. Отчет ==="
    
    local report_file="log_monitor_report_$(date +%Y%m%d_%H%M%S).txt"
    
    echo "📄 Генерация отчета: $report_file"
    
    {
        echo "Отчет мониторинга ML-системы"
        echo "Дата: $(date)"
        echo "=========================="
        echo
        
        echo "Backend логи:"
        check_backend_logs 2>&1
        echo
        
        echo "ML-сервис:"
        check_ml_service 2>&1
        echo
        
        echo "Frontend:"
        check_frontend 2>&1
        echo
        
        echo "Система:"
        check_system_health 2>&1
        
    } > "$report_file"
    
    log_info "Отчет сохранен в: $report_file"
}

# Режим наблюдения
watch_mode() {
    echo "🔍 Режим наблюдения (обновление каждые 30 секунд)"
    echo "Для выхода нажмите Ctrl+C"
    echo
    
    while true; do
        clear
        echo "=== Мониторинг логов ML-системы ==="
        echo "Время: $(date)"
        echo
        
        check_backend_logs
        check_ml_service
        check_frontend
        
        sleep 30
    done
}

# Основная функция
main() {
    echo "🚀 Мониторинг логов ML-системы"
    echo "Дата: $(date)"
    echo
    
    if [ "$1" = "--watch" ]; then
        watch_mode
    else
        check_backend_logs
        check_ml_service
        check_frontend
        check_system_health
        
        if [ "$1" = "--report" ]; then
            generate_report
        fi
    fi
    
    echo "✅ Мониторинг завершен"
}

# Запуск
main "$@"
