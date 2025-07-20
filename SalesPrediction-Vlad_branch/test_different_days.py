import requests
import json

url = "http://192.168.1.9:8002/predict"

# Тестируем с разными количествами дней
test_cases = [3, 5, 7, 10, 14]

for days in test_cases:
    payload = {
        "DaysCount": days,
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
    
    if len(result) > 1:
        quantity = result[1]['Количество']
        print(f"Дней: {days}, Количество: {quantity}, Соотношение: {quantity/days:.2f}")
    else:
        print(f"Дней: {days}, Ошибка в ответе")
