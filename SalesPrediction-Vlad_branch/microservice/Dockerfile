# Используем минимальный Python образ
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем все файлы в контейнер
COPY . .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get install -y curl

# Открываем порт (по желанию, по умолчанию FastAPI использует 8000)
EXPOSE 8002

# Команда запуска
CMD ["uvicorn", "microservice:app", "--host", "0.0.0.0", "--port", "8002"]
