import requests
import json

url = "http://192.168.1.9:8002/predict"

payload = {
    "DaysCount": 3,
    "events": [
        {
            "Type": "Продажа",
            "Период": "2025-06-07",
            "Номенклатура": 'Абрикосовый аромат 0,4кг',
            "Код": "00000010568",
            "Цена_на_полке": 699.9
        }
    ]
}

resp = requests.post(url, json=payload)
result = resp.json()
print(f"Status: {resp.status_code}")
print(f"Response: {result}")

if len(result) > 1:
    quantity = result[1]['Количество']
    print(f"Дней: 3, Количество: {quantity}")
