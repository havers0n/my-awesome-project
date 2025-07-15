#!/usr/bin/env python3
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
from datetime import datetime, timedelta
import urllib.parse

class MockMLHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                "status": "healthy",
                "model_loaded": True,
                "timestamp": datetime.now().isoformat()
            }
            self.wfile.write(json.dumps(response).encode())
        elif self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"message": "ML Microservice Mock is running"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)
    
    def do_POST(self):
        if self.path == '/predict':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode())
                days_count = data.get('DaysCount', 30)
                events = data.get('events', [])
                
                results = []
                
                # Общие метрики
                results.append({
                    "MAPE": 42.1,
                    "MAE": 0.8,
                    "DaysPredict": days_count
                })
                
                # Для каждого события
                for event in events:
                    target_date = datetime.fromisoformat(event['Период'].replace('Z', '+00:00'))
                    end_date = target_date + timedelta(days=days_count - 1)
                    period_str = f"{target_date.strftime('%Y-%m-%d')} - {end_date.strftime('%Y-%m-%d')}"
                    
                    # Базовое предсказание
                    base_quantity = max(1, days_count * 5)
                    
                    # Настраиваем количество в зависимости от товара
                    if 'Молоко' in event['Номенклатура']:
                        quantity = int(base_quantity * 1.2)
                    elif 'Йогурт' in event['Номенклатура']:
                        quantity = int(base_quantity * 0.8)
                    elif 'Хлеб' in event['Номенклатура']:
                        quantity = int(base_quantity * 1.5)
                    else:
                        quantity = base_quantity
                    
                    results.append({
                        "Период": period_str,
                        "Номенклатура": event['Номенклатура'],
                        "Код": event['Код'],
                        "MAPE": f"{35.0 + (hash(event['Код']) % 20)}%",
                        "MAE": 0.6,
                        "Количество": quantity
                    })
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(results, ensure_ascii=False).encode('utf-8'))
                
            except Exception as e:
                self.send_error(500, f"Error processing request: {str(e)}")
        else:
            self.send_error(404)

def run_mock_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, MockMLHandler)
    print(f"Mock ML Microservice running on port {port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"Predict endpoint: http://localhost:{port}/predict")
    httpd.serve_forever()

if __name__ == "__main__":
    run_mock_server(8000) 