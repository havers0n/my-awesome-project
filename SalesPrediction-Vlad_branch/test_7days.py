import requests
import json
import datetime as dt

url = "http://192.168.1.9:8002/predict"

# Используем реальные данные из val_predictions.csv
payload = {
    "DaysCount": 7,
    "events": [
        {
            "Type": "Продажа",
            "Период": "2025-06-07",
            "Номенклатура": 'Домашний медовик 0,5',
            "Код": "00000010568",
            "Цена_на_полке": 699.9
        },
        {
            "Type": "Продажа",
            "Период": "2025-06-15",
            "Номенклатура": 'Десерт творожный с вишней 180г',
            "Код": "УП-00002714",
            "Цена_на_полке": 89.9
        }
    ]
}

headers = {"Content-Type": "application/json"}
print("Отправляем запрос...")

# Попробуем использовать json параметр вместо data
resp = requests.post(url, headers=headers, json=payload)
print(f"Status: {resp.status_code}")
print(f"Response: {resp.json()}")
