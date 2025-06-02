import requests
import json

# Адрес твоего FastAPI сервера
url = "http://localhost:5550/parse"
print("Type url for parse ")
urlForParse = input()
# Данные запроса
payload = {
    "url": urlForParse
}

try:
    response = requests.post(url, json=payload, timeout=600)  # timeout до 10 минут
    response.raise_for_status()
    result = response.json()
    print("Результат парсинга:")
    print(json.dumps(result, indent=4, ensure_ascii=False))
except requests.exceptions.RequestException as e:
    print(f"Ошибка запроса: {e}")
except json.JSONDecodeError:
    print("Ошибка разбора JSON-ответа")

