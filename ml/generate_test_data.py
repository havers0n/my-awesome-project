import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Генерируем данные за 3 месяца для 5 товаров
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 3, 31)
current_date = start_date

products = [
    {"name": "Товар1", "code": "T001", "base_qty": 10, "variation": 3},
    {"name": "Товар2", "code": "T002", "base_qty": 20, "variation": 5},
    {"name": "Товар3", "code": "T003", "base_qty": 15, "variation": 4},
    {"name": "Товар4", "code": "T004", "base_qty": 8, "variation": 2},
    {"name": "Товар5", "code": "T005", "base_qty": 25, "variation": 6}
]

data = []
while current_date <= end_date:
    for product in products:
        # Добавляем сезонность и случайные колебания
        seasonal_factor = 1 + 0.2 * np.sin(2 * np.pi * current_date.timetuple().tm_yday / 365)
        weekday_factor = 1.2 if current_date.weekday() < 5 else 0.8  # больше продаж в будни
        
        quantity = int(product["base_qty"] * seasonal_factor * weekday_factor + 
                      np.random.normal(0, product["variation"]))
        quantity = max(1, quantity)  # минимум 1
        
        data.append({
            "Type": "Продажа",
            "Период": current_date.strftime("%d.%m.%Y"),
            "Номенклатура": product["name"],
            "Количество": quantity,
            "Код": product["code"],
            "ВидНоменклатуры": "Продукты"
        })
    
    current_date += timedelta(days=1)

# Сохраняем в JSON
with open("extended_test_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Сгенерировано {len(data)} записей продаж")
print(f"Период: {start_date.strftime('%d.%m.%Y')} - {end_date.strftime('%d.%m.%Y')}")
print(f"Товаров: {len(products)}")
