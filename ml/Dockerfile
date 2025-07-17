# Multistage build for ML FastAPI service
FROM python:3.11-slim as base

WORKDIR /app

# Install runtime dependencies (populated further below)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY models ./models

EXPOSE 5678

# Healthcheck endpoint (requires curl) and libgomp for ML libraries
RUN apt-get update && apt-get install -y curl libgomp1 && rm -rf /var/lib/apt/lists/*
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD curl -f http://localhost:5678/health || exit 1

CMD ["python", "api_main.py"]

