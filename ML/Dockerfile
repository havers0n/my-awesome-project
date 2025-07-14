FROM python:3.9-slim

WORKDIR /app

COPY tests/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY microservice.py .
COPY models /app/models

EXPOSE 5678

CMD ["python", "microservice.py"] 