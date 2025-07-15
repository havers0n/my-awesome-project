#!/usr/bin/env python3
"""
Скрипт для переключения между различными ML сервисами
"""

import os
import sys
import subprocess

ML_SERVICES = {
    "local": "http://localhost:8000/predict",
    "mock": "http://localhost:8000/predict", 
    "docker": "http://ml-service:5678/forecast",
    "external": None  # Будет установлен пользователем
}

def set_ml_service(service_type, custom_url=None):
    """Устанавливает ML сервис для использования"""
    
    if service_type == "external" and custom_url:
        url = custom_url
    elif service_type in ML_SERVICES:
        url = ML_SERVICES[service_type]
    else:
        print(f"❌ Неизвестный тип сервиса: {service_type}")
        return False
    
    print(f"🔄 Настройка ML сервиса: {service_type}")
    print(f"   URL: {url}")
    
    # Устанавливаем переменную окружения
    try:
        if os.name == 'nt':  # Windows
            cmd = f'setx ML_SERVICE_URL "{url}"'
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Переменная окружения установлена (потребуется перезапуск консоли)")
            else:
                print(f"❌ Ошибка установки переменной: {result.stderr}")
        else:  # Linux/Mac
            print("   Добавьте в ~/.bashrc или ~/.zshrc:")
            print(f"   export ML_SERVICE_URL=\"{url}\"")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return False
    
    # Создаем/обновляем .env файл
    env_path = os.path.join("backend", ".env")
    
    try:
        # Читаем существующий .env файл
        env_lines = []
        if os.path.exists(env_path):
            with open(env_path, 'r', encoding='utf-8') as f:
                env_lines = f.readlines()
        
        # Обновляем или добавляем ML_SERVICE_URL
        ml_service_updated = False
        for i, line in enumerate(env_lines):
            if line.startswith('ML_SERVICE_URL='):
                env_lines[i] = f'ML_SERVICE_URL={url}\n'
                ml_service_updated = True
                break
        
        if not ml_service_updated:
            env_lines.append(f'ML_SERVICE_URL={url}\n')
        
        # Записываем обновленный .env файл
        with open(env_path, 'w', encoding='utf-8') as f:
            f.writelines(env_lines)
        
        print(f"✅ Обновлен файл {env_path}")
        
    except Exception as e:
        print(f"⚠️  Не удалось обновить .env файл: {e}")
    
    return True

def show_current_config():
    """Показывает текущую конфигурацию ML сервиса"""
    print("📋 Текущая конфигурация ML сервиса:")
    
    # Проверяем переменную окружения
    env_url = os.getenv('ML_SERVICE_URL')
    if env_url:
        print(f"   Переменная окружения: {env_url}")
    else:
        print("   Переменная окружения не установлена")
    
    # Проверяем .env файл
    env_path = os.path.join("backend", ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.startswith('ML_SERVICE_URL='):
                        print(f"   .env файл: {line.strip()}")
                        break
                else:
                    print("   .env файл: не найден ML_SERVICE_URL")
        except Exception as e:
            print(f"   .env файл: ошибка чтения - {e}")
    else:
        print("   .env файл не найден")

def test_ml_service(url):
    """Тестирует доступность ML сервиса"""
    try:
        import requests
        response = requests.get(url.replace('/predict', '/health').replace('/forecast', '/health'), timeout=5)
        if response.status_code == 200:
            print(f"✅ Сервис доступен: {url}")
            return True
        else:
            print(f"⚠️  Сервис вернул код {response.status_code}: {url}")
            return False
    except Exception as e:
        print(f"❌ Сервис недоступен: {url} - {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Использование: python switch_ml_service.py <тип_сервиса> [URL]")
        print()
        print("Доступные типы сервисов:")
        print("  local    - Локальный сервис (http://localhost:8000/predict)")
        print("  mock     - Mock сервис (http://localhost:8000/predict)")
        print("  docker   - Docker Compose сервис (http://ml-service:5678/forecast)")
        print("  external - Внешний сервис (требуется указать URL)")
        print()
        print("Примеры:")
        print("  python switch_ml_service.py local")
        print("  python switch_ml_service.py external http://192.168.1.100:8000/predict")
        print("  python switch_ml_service.py external https://ml-api.company.com/predict")
        print()
        print("Для просмотра текущей конфигурации:")
        print("  python switch_ml_service.py status")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "status":
        show_current_config()
        return
    
    if command == "external":
        if len(sys.argv) < 3:
            print("❌ Для external сервиса нужно указать URL")
            print("   Пример: python switch_ml_service.py external http://192.168.1.100:8000/predict")
            sys.exit(1)
        
        custom_url = sys.argv[2]
        if set_ml_service("external", custom_url):
            print("\n🧪 Тестирование сервиса...")
            test_ml_service(custom_url)
    
    elif command in ML_SERVICES:
        if set_ml_service(command):
            print("\n🧪 Тестирование сервиса...")
            test_ml_service(ML_SERVICES[command])
    
    else:
        print(f"❌ Неизвестный тип сервиса: {command}")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("🎯 Следующие шаги:")
    print("1. Перезапустите backend:")
    print("   cd backend && npm run dev")
    print("2. Убедитесь, что ML сервис доступен")
    print("3. Протестируйте интеграцию:")
    print("   python test_integration.py")

if __name__ == "__main__":
    main() 