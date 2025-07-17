#!/usr/bin/env python3
"""
Скрипт для мониторинга логов всех сервисов и анализа ошибок
"""

import subprocess
import threading
import time
import json
import re
from datetime import datetime
import os

class LogMonitor:
    def __init__(self):
        self.services = ['backend', 'frontend', 'ml-service', 'db', 'worker']
        self.log_patterns = {
            'error': re.compile(r'(ERROR|Error|error|FAIL|Failed|failed|Exception|exception)', re.IGNORECASE),
            'warning': re.compile(r'(WARN|Warning|warning)', re.IGNORECASE),
            'info': re.compile(r'(INFO|Info|info|SUCCESS|Success|success)', re.IGNORECASE),
            'debug': re.compile(r'(DEBUG|Debug|debug)', re.IGNORECASE)
        }
        self.error_count = {service: 0 for service in self.services}
        self.warning_count = {service: 0 for service in self.services}
        self.log_entries = []
        self.monitoring = False
        
    def analyze_log_line(self, service, line):
        """Анализ строки лога"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        log_entry = {
            'timestamp': timestamp,
            'service': service,
            'line': line.strip(),
            'level': 'info'
        }
        
        # Определение уровня лога
        if self.log_patterns['error'].search(line):
            log_entry['level'] = 'error'
            self.error_count[service] += 1
        elif self.log_patterns['warning'].search(line):
            log_entry['level'] = 'warning'
            self.warning_count[service] += 1
        elif self.log_patterns['debug'].search(line):
            log_entry['level'] = 'debug'
            
        self.log_entries.append(log_entry)
        
        # Вывод критических ошибок
        if log_entry['level'] == 'error':
            print(f"🔴 [{timestamp}] {service}: {line.strip()}")
        elif log_entry['level'] == 'warning':
            print(f"🟡 [{timestamp}] {service}: {line.strip()}")
            
    def monitor_service_logs(self, service):
        """Мониторинг логов конкретного сервиса"""
        try:
            cmd = ['docker-compose', 'logs', '-f', service]
            process = subprocess.Popen(
                cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                universal_newlines=True,
                bufsize=1
            )
            
            print(f"📊 Начал мониторинг сервиса: {service}")
            
            while self.monitoring:
                line = process.stdout.readline()
                if line:
                    self.analyze_log_line(service, line)
                elif process.poll() is not None:
                    break
                    
        except Exception as e:
            print(f"❌ Ошибка мониторинга {service}: {str(e)}")
            
    def check_docker_compose_status(self):
        """Проверка статуса docker-compose"""
        try:
            result = subprocess.run(
                ['docker-compose', 'ps'],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                print("❌ Docker-compose не запущен или есть проблемы")
                return False
                
            lines = result.stdout.strip().split('\n')
            if len(lines) < 2:
                print("❌ Сервисы не найдены")
                return False
                
            print("📋 Статус сервисов:")
            for line in lines[1:]:  # Пропускаем заголовок
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 2:
                        service_name = parts[0]
                        status = ' '.join(parts[1:])
                        if 'Up' in status:
                            print(f"✅ {service_name}: {status}")
                        else:
                            print(f"❌ {service_name}: {status}")
                            
            return True
            
        except subprocess.TimeoutExpired:
            print("⏱️ Timeout при проверке статуса docker-compose")
            return False
        except Exception as e:
            print(f"❌ Ошибка при проверке статуса: {str(e)}")
            return False
            
    def generate_report(self):
        """Генерация отчета о мониторинге"""
        report = {
            'monitoring_duration': time.time() - self.start_time,
            'total_log_entries': len(self.log_entries),
            'error_counts': self.error_count,
            'warning_counts': self.warning_count,
            'critical_errors': [],
            'services_status': {}
        }
        
        # Поиск критических ошибок
        for entry in self.log_entries:
            if entry['level'] == 'error':
                report['critical_errors'].append(entry)
                
        # Анализ состояния сервисов
        for service in self.services:
            total_errors = self.error_count[service]
            total_warnings = self.warning_count[service]
            
            if total_errors > 10:
                status = 'critical'
            elif total_errors > 5:
                status = 'warning'
            elif total_warnings > 20:
                status = 'warning'
            else:
                status = 'healthy'
                
            report['services_status'][service] = {
                'status': status,
                'errors': total_errors,
                'warnings': total_warnings
            }
            
        return report
        
    def save_logs(self):
        """Сохранение логов в файл"""
        os.makedirs('test_results', exist_ok=True)
        
        # Сохранение детальных логов
        with open('test_results/detailed_logs.json', 'w', encoding='utf-8') as f:
            json.dump(self.log_entries, f, indent=2, ensure_ascii=False)
            
        # Сохранение отчета
        report = self.generate_report()
        with open('test_results/monitoring_report.json', 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        print(f"📄 Логи сохранены в test_results/")
        
    def print_summary(self):
        """Вывод краткого отчета"""
        print("\n" + "="*60)
        print("📊 СВОДКА МОНИТОРИНГА")
        print("="*60)
        
        total_errors = sum(self.error_count.values())
        total_warnings = sum(self.warning_count.values())
        
        print(f"📈 Всего записей в логах: {len(self.log_entries)}")
        print(f"🔴 Всего ошибок: {total_errors}")
        print(f"🟡 Всего предупреждений: {total_warnings}")
        print(f"⏱️ Время мониторинга: {time.time() - self.start_time:.1f}s")
        
        print("\n📋 Ошибки по сервисам:")
        for service in self.services:
            errors = self.error_count[service]
            warnings = self.warning_count[service]
            print(f"  {service}: {errors} ошибок, {warnings} предупреждений")
            
        # Топ-5 критических ошибок
        error_entries = [e for e in self.log_entries if e['level'] == 'error']
        if error_entries:
            print("\n🔥 Последние критические ошибки:")
            for entry in error_entries[-5:]:
                print(f"  [{entry['timestamp']}] {entry['service']}: {entry['line'][:100]}...")
                
    def start_monitoring(self, duration=60):
        """Запуск мониторинга на указанное время"""
        print("🚀 Запуск мониторинга логов...")
        
        # Проверка docker-compose
        if not self.check_docker_compose_status():
            print("❌ Невозможно запустить мониторинг")
            return
            
        self.monitoring = True
        self.start_time = time.time()
        
        # Запуск потоков для каждого сервиса
        threads = []
        for service in self.services:
            thread = threading.Thread(
                target=self.monitor_service_logs,
                args=(service,),
                daemon=True
            )
            thread.start()
            threads.append(thread)
            
        try:
            print(f"⏱️ Мониторинг запущен на {duration} секунд...")
            print("🔍 Отслеживание ошибок и предупреждений...")
            time.sleep(duration)
            
        except KeyboardInterrupt:
            print("\n⏹️ Мониторинг остановлен пользователем")
            
        finally:
            self.monitoring = False
            print("🛑 Останавливаю мониторинг...")
            
            # Ждем завершения потоков
            for thread in threads:
                thread.join(timeout=2)
                
            self.save_logs()
            self.print_summary()
            
    def quick_health_check(self):
        """Быстрая проверка состояния сервисов"""
        print("🏥 Быстрая проверка состояния сервисов...")
        
        if not self.check_docker_compose_status():
            return False
            
        # Проверка логов за последние 30 секунд
        self.monitoring = True
        self.start_time = time.time()
        
        threads = []
        for service in self.services:
            thread = threading.Thread(
                target=self.monitor_service_logs,
                args=(service,),
                daemon=True
            )
            thread.start()
            threads.append(thread)
            
        time.sleep(10)  # Мониторинг 10 секунд
        self.monitoring = False
        
        # Анализ результатов
        total_errors = sum(self.error_count.values())
        
        if total_errors > 5:
            print("❌ Обнаружены критические проблемы в логах")
            return False
        elif total_errors > 0:
            print("⚠️ Обнаружены незначительные ошибки")
            return True
        else:
            print("✅ Все сервисы работают нормально")
            return True

if __name__ == "__main__":
    monitor = LogMonitor()
    
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == "quick":
            monitor.quick_health_check()
        elif sys.argv[1] == "long":
            monitor.start_monitoring(300)  # 5 минут
        else:
            try:
                duration = int(sys.argv[1])
                monitor.start_monitoring(duration)
            except ValueError:
                print("❌ Неверный параметр времени")
    else:
        monitor.start_monitoring()  # По умолчанию 60 секунд
