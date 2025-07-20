#!/bin/bash
set -e

# Проверка, какой docker compose доступен
if docker compose version &> /dev/null; then
    DC="docker compose"
elif docker-compose version &> /dev/null; then
    DC="docker-compose"
else
    echo "❌ Не найден docker compose или docker-compose"
    exit 1
fi

# Получаем имя текущей ветки
BRANCH_NAME=${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")}
echo "🚀 Деплой микросервиса для ветки: $BRANCH_NAME"

# Останавливаем и удаляем старые контейнеры
echo "🛑 Останавливаем контейнеры..."
docker ps -a --filter "label=branch=$BRANCH_NAME" -q | xargs -r docker stop
docker ps -a --filter "label=branch=$BRANCH_NAME" -q | xargs -r docker rm

# Удаляем старые образы микросервиса
echo "Очищаем старые образы..."
docker rmi -f salesprediction_sales-forecast-service:latest || true
docker system prune -f

# Сборка
echo "🔧 Собираем..."
$DC build

# Остановка предыдущих (на всякий случай)
echo "⬇️ Остановка запущенных контейнеров..."
$DC down

# Запуск
echo "⬆️ Запускаем контейнеры..."
export BRANCH_NAME=$BRANCH_NAME
$DC up -d

# Подождать
echo "⏳ Ждём запуск..."
sleep 10

echo "✅ Деплой завершён для ветки: $BRANCH_NAME"
$DC ps
echo "🌐 Сервис доступен по адресу: http://localhost:8002"



