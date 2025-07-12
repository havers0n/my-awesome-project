import unittest
from fastapi.testclient import TestClient
from ..microservice import app

class TestPreprocessing(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_preprocessing_valid(self):
        # Payload with valid data
        payload = [{
            "DaysCount": 10,
            "Type": "Продажа",
            "Период": "2025-07-07",
            "Номенклатура": "Test Item",
            "Цена_на_полке": 100.0
        }]

        response = self.client.post("/forecast", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("MAPE", response.json()[0])

    def test_preprocessing_invalid(self):
        # Payload with missing fields
        payload = [{
            "DaysCount": 10,
            "Type": "Продажа"
        }]

        response = self.client.post("/forecast", json=payload)
        self.assertEqual(response.status_code, 400)
