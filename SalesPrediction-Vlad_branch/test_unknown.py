import requests
import json

url = "http://192.168.1.9:8002/predict"

payload = {
    "DaysCount": 5,
    "events": [
        {
            "Type": "Продажа",
            "Период": "2025-06-07",
            "Номенклатура": 'Неизвестный товар который точно не в данных',
            "Код": "UNKNOWN123",
            "Цена_на_полке": 100.0
        }
    ]
}

resp = requests.post(url, json=payload)
result = resp.json()
print(f"Status: {resp.status_code}")
print(f"Response: {result}")

if len(result) > 1:
    quantity = result[1]['Количество']
    print(f"Дней: 5, Количество: {quantity}, Соотношение: {quantity/5:.2f}")
