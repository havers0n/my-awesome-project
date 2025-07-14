<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Прогноз продаж</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8fafc;
        }
        .sidebar {
            transition: all 0.3s;
        }
        .table-row:hover {
            background-color: #f1f5f9;
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .pulse {
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
            }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen overflow-hidden">
        <!-- Сайдбар -->
        <div class="sidebar bg-indigo-700 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <div class="flex items-center space-x-2 px-4">
                <i class="fas fa-chart-line text-2xl text-indigo-300"></i>
                <span class="text-xl font-bold">Аналитика продаж</span>
            </div>
            <nav>
                <a href="#" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-600 hover:text-white">
                    <i class="fas fa-home mr-3"></i>Главная
                </a>
                <a href="#" class="block py-2.5 px-4 rounded transition duration-200 bg-indigo-800 text-white">
                    <i class="fas fa-chart-bar mr-3"></i>Прогноз модели
                </a>
                <a href="#" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-600 hover:text-white">
                    <i class="fas fa-history mr-3"></i>История продаж
                </a>
                <a href="#" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-600 hover:text-white">
                    <i class="fas fa-cog mr-3"></i>Настройки
                </a>
                <a href="#" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-indigo-600 hover:text-white">
                    <i class="fas fa-question-circle mr-3"></i>Помощь
                </a>
            </nav>
        </div>

        <!-- Основное содержимое -->
        <div class="flex-1 overflow-auto">
            <!-- Шапка -->
            <header class="bg-white shadow-sm">
                <div class="flex items-center justify-between px-6 py-4">
                    <div class="flex items-center">
                        <button class="md:hidden mr-4 text-gray-500 focus:outline-none">
                            <i class="fas fa-bars text-xl"></i>
                        </button>
                        <h1 class="text-2xl font-semibold text-gray-800">Прогноз продаж</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="relative">
                            <i class="fas fa-bell text-gray-500 text-xl"></i>
                            <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
                        </div>
                        <div class="flex items-center">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" class="h-8 w-8 rounded-full">
                            <span class="ml-2 text-gray-700">Иван Петров</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Контент -->
            <main class="p-6">
                <div class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    <div class="p-5 border-b border-gray-200 flex justify-between items-center">
                        <h2 class="text-xl font-semibold text-gray-800">Прогноз продаж на следующую неделю</h2>
                        <button id="requestForecast" class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center pulse">
                            <i class="fas fa-sync-alt mr-2"></i>Запросить прогноз
                        </button>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Название товара</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Проданное количество (прогноз)</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Точность прогноза</th>
                                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                </tr>
                            </thead>
                            <tbody id="forecastTable" class="bg-white divide-y divide-gray-200">
                                <!-- Данные будут загружены через JavaScript -->
                                <tr>
                                    <td colspan="5" class="px-6 py-4 text-center text-gray-500">Загрузка данных...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div class="text-sm text-gray-500">
                            Показано <span id="startItem">1</span> - <span id="endItem">5</span> из <span id="totalItems">25</span> записей
                        </div>
                        <div class="flex space-x-2">
                            <button class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Назад
                            </button>
                            <button class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                Вперед
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-800 mb-4">Статистика точности прогноза</h3>
                        <div class="h-64 flex items-center justify-center">
                            <canvas id="accuracyChart"></canvas>
                        </div>
                    </div>
                    <div class="bg-white p-5 rounded-lg shadow-md">
                        <h3 class="text-lg font-medium text-gray-800 mb-4">Топ товаров по прогнозу</h3>
                        <div class="space-y-4">
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-box-open text-indigo-600"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between">
                                        <span class="text-sm font-medium text-gray-800">Смартфон X200</span>
                                        <span class="text-sm font-bold text-indigo-600">124 шт</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div class="bg-indigo-600 h-1.5 rounded-full" style="width: 85%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-laptop text-blue-600"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between">
                                        <span class="text-sm font-medium text-gray-800">Ноутбук Pro 15</span>
                                        <span class="text-sm font-bold text-blue-600">98 шт</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div class="bg-blue-600 h-1.5 rounded-full" style="width: 70%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-headphones text-green-600"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between">
                                        <span class="text-sm font-medium text-gray-800">Наушники Elite</span>
                                        <span class="text-sm font-bold text-green-600">76 шт</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div class="bg-green-600 h-1.5 rounded-full" style="width: 60%"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center">
                                <div class="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                    <i class="fas fa-tablet-alt text-yellow-600"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="flex justify-between">
                                        <span class="text-sm font-medium text-gray-800">Планшет Mini</span>
                                        <span class="text-sm font-bold text-yellow-600">65 шт</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div class="bg-yellow-600 h-1.5 rounded-full" style="width: 50%"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Мобильное меню
        document.querySelector('.md\\:hidden').addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('-translate-x-full');
        });

        // Загрузка данных прогноза
        function loadForecastData() {
            const forecastData = [
                { date: '2023-06-01', product: 'Смартфон X200', forecast: 124, accuracy: 92 },
                { date: '2023-06-01', product: 'Ноутбук Pro 15', forecast: 98, accuracy: 88 },
                { date: '2023-06-02', product: 'Наушники Elite', forecast: 76, accuracy: 85 },
                { date: '2023-06-02', product: 'Планшет Mini', forecast: 65, accuracy: 82 },
                { date: '2023-06-03', product: 'Смартфон X200', forecast: 112, accuracy: 90 },
                { date: '2023-06-03', product: 'Умные часы V2', forecast: 54, accuracy: 78 },
                { date: '2023-06-04', product: 'Ноутбук Pro 15', forecast: 87, accuracy: 86 },
                { date: '2023-06-04', product: 'Фитнес-браслет', forecast: 43, accuracy: 75 }
            ];

            const tableBody = document.getElementById('forecastTable');
            tableBody.innerHTML = '';

            forecastData.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'table-row transition duration-150 ease-in-out';
                
                // Определяем цвет точности
                let accuracyColor = 'text-red-500';
                if (item.accuracy >= 85) accuracyColor = 'text-green-500';
                else if (item.accuracy >= 75) accuracyColor = 'text-yellow-500';
                
                // Определяем иконку для точности
                let accuracyIcon = 'fa-exclamation-circle';
                if (item.accuracy >= 85) accuracyIcon = 'fa-check-circle';
                else if (item.accuracy >= 75) accuracyIcon = 'fa-info-circle';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${item.date}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.product}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">${item.forecast} шт</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm ${accuracyColor}">
                        <i class="fas ${accuracyIcon} mr-1"></i>${item.accuracy}%
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-indigo-600 hover:text-indigo-900 mr-3">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button class="text-gray-600 hover:text-gray-900">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });

            // Обновляем информацию о пагинации
            document.getElementById('startItem').textContent = '1';
            document.getElementById('endItem').textContent = forecastData.length;
            document.getElementById('totalItems').textContent = forecastData.length;
        }

        // Инициализация графика
        function initChart() {
            const ctx = document.getElementById('accuracyChart').getContext('2d');
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Высокая (>85%)', 'Средняя (75-85%)', 'Низкая (<75%)'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: [
                            '#10B981',
                            '#F59E0B',
                            '#EF4444'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                usePointStyle: true,
                                padding: 20
                            }
                        }
                    }
                }
            });
        }

        // Запрос прогноза
        document.getElementById('requestForecast').addEventListener('click', function() {
            const button = this;
            const originalText = button.innerHTML;
            
            // Показываем индикатор загрузки
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Загрузка...';
            button.classList.remove('pulse');
            
            // Имитируем запрос к серверу
            setTimeout(function() {
                loadForecastData();
                button.innerHTML = originalText;
                button.classList.add('pulse');
                
                // Показываем уведомление
                const notification = document.createElement('div');
                notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center';
                notification.innerHTML = `
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>Прогноз успешно обновлен</span>
                `;
                document.body.appendChild(notification);
                
                // Удаляем уведомление через 3 секунды
                setTimeout(() => {
                    notification.classList.add('opacity-0', 'transition', 'duration-500');
                    setTimeout(() => notification.remove(), 500);
                }, 3000);
            }, 1500);
        });

        // Инициализация страницы
        document.addEventListener('DOMContentLoaded', function() {
            loadForecastData();
            initChart();
        });
    </script>
</body>
</html>