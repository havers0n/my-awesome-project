#!/bin/bash
set -e

echo "🚀 Starting build and deployment process..."

# Остановить и удалить старые контейнеры
echo "🛑 Stopping and removing old containers..."
docker compose down --remove-orphans

# Удалить старые образы (опционально, для экономии места)
echo "🧹 Cleaning up old images..."
docker system prune -f

# Собрать контейнеры
echo "🔨 Building Docker containers..."
docker compose build --no-cache

# Запустить контейнеры
echo "🚀 Starting containers..."
docker compose up -d

# Проверить статус контейнеров
echo "📊 Checking container status..."
docker compose ps

# Показать логи для отладки
echo "📋 Container logs:"
docker compose logs --tail=50

echo "✅ Deployment completed successfully!"
echo "🌐 Application should be running now" 