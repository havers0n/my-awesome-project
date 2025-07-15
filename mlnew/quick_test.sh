#!/bin/bash

echo "=== Быстрый тест ML интеграции ==="
echo ""

# Тест 1: Проверка ML сервиса
echo "1. Проверка ML сервиса:"
curl -s http://localhost:8000/health | python -m json.tool

echo ""
echo "2. Тест прогноза (режим CSV):"
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "DaysCount": 7,
    "SalesEvents": [
      {"Date": "2024-01-15T00:00:00", "Quantity": 50}
    ],
    "SupplyEvents": []
  }' | python -m json.tool

echo ""
echo "3. Проверка backend ML endpoints:"
echo "   - Features endpoint:"
curl -s http://localhost:5001/api/ml/features/test-sku-001 | python -m json.tool

echo ""
echo "   - Metrics endpoint:"
curl -s http://localhost:5001/api/ml/metrics | python -m json.tool 