<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sweet Oven | Прогноз продаж</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .chart-container {
            height: 300px;
            position: relative;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <header class="bg-amber-700 text-white shadow-md">
        <div class="container mx-auto px-4 py-4 flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <i class="fas fa-bread-slice text-2xl"></i>
                <h1 class="text-2xl font-bold">Sweet Oven</h1>
            </div>
            <nav class="hidden md:block">
                <ul class="flex space-x-6">
                    <li><a href="#" class="hover:text-amber-200 transition">Панель</a></li>
                    <li><a href="#" class="hover:text-amber-200 transition">Склад</a></li>
                    <li><a href="#" class="font-semibold underline">Прогноз</a></li>
                    <li><a href="#" class="hover:text-amber-200 transition">Магазины</a></li>
                </ul>
            </nav>
            <button class="md:hidden text-xl">
                <i class="fas fa-bars"></i>
            </button>
        </div>
    </header>

    <main class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Прогноз продаж</h2>
                <p class="text-gray-600">Прогнозирование продаж вашей выпечки</p>
            </div>
            <button id="requestForecast" class="mt-4 md:mt-0 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg shadow-md transition-all flex items-center">
                <i class="fas fa-bolt mr-2"></i> Запросить прогноз
            </button>
        </div>

        <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8 fade-in">
            <div class="p-4 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-gray-700">Recent Forecasts</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Прогноз (шт.)</th>
                            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Точность</th>
                        </tr>
                    </thead>
                    <tbody id="forecastTable" class="bg-white divide-y divide-gray-200">
                        <!-- Forecast data will be loaded here -->
                    </tbody>
                </table>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white rounded-xl shadow-md overflow-hidden fade-in">
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-700">Forecast Trend</h3>
                </div>
                <div class="p-4">
                    <div class="chart-container">
                        <canvas id="forecastChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-md overflow-hidden fade-in">
                <div class="p-4 border-b border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-700"> Топ Продуктов</h3>
                </div>
                <div class="p-4">
                    <div class="space-y-4">
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="font-medium">Круассан с шоколадом</span>
                                <span class="font-bold text-amber-700">245</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-amber-600 h-2.5 rounded-full" style="width: 80%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="font-medium">Торт Красный бархат</span>
                                <span class="font-bold text-amber-700">198</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-amber-600 h-2.5 rounded-full" style="width: 65%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="font-medium">Хлеб на закваске</span>
                                <span class="font-bold text-amber-700">176</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-amber-600 h-2.5 rounded-full" style="width: 58%"></div>
                            </div>
                        </div>
                        <div>
                            <div class="flex justify-between mb-1">
                                <span class="font-medium">Коричная булочка</span>
                                <span class="font-bold text-amber-700">152</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2.5">
                                <div class="bg-amber-600 h-2.5 rounded-full" style="width: 50%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-gray-800 text-white py-8">
        <div class="container mx-auto px-4">
            <div class="flex flex-col md:flex-row justify-between">
                <div class="mb-6 md:mb-0">
                    <div class="flex items-center space-x-2 mb-4">
                        <i class="fas fa-bread-slice text-2xl text-amber-400"></i>
                        <h2 class="text-xl font-bold">Sweet Oven</h2>
                    </div>
                    <p class="text-gray-400 max-w-md">Delicious baked goods with the perfect amount of sweetness in every bite.</p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Home</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Menu</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Locations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Resources</h3>
                        <ul class="space-y-2">
                            <li><a href="#" class="text-gray-400 hover:text-white transition">FAQ</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Contact</a></li>
                            <li><a href="#" class="text-gray-400 hover:text-white transition">Privacy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold mb-4">Social</h3>
                        <div class="flex space-x-4">
                            <a href="#" class="text-gray-400 hover:text-white transition text-xl"><i class="fab fa-facebook"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition text-xl"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="text-gray-400 hover:text-white transition text-xl"><i class="fab fa-twitter"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
                <p>&copy; 2023 Sweet Oven Bakery Network. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <!-- Modal for request confirmation -->
    <div id="requestModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl p-6 w-full max-w-md">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-gray-800">Request New Forecast</h3>
                <button onclick="closeModal()" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="mb-6 text-gray-600">This will generate a new sales prediction for the upcoming week. It may take a few minutes to complete.</p>
            <div class="flex justify-end space-x-4">
                <button onclick="closeModal()" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button onclick="requestNewForecast()" id="confirmRequest" class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition flex items-center">
                    <span>Confirm</span>
                </button>
            </div>
        </div>
    </div>

    <script>
        // Sample forecast data
        const forecastData = [
            { date: '2023-11-15', product: 'Круассан с шоколадом', category: 'Выпечка', forecast: 245, confidence: 'Высокая' },
            { date: '2023-11-15', product: 'Торт Красный бархат', category: 'Торты', forecast: 198, confidence: 'Высокая' },
            { date: '2023-11-16', product: 'Хлеб на закваске', category: 'Хлеб', forecast: 176, confidence: 'Средняя' },
            { date: '2023-11-16', product: 'Коричная булочка', category: 'Выпечка', forecast: 152, confidence: 'Средняя' },
            { date: '2023-11-17', product: 'Миндальный круассан', category: 'Выпечка', forecast: 128, confidence: 'Средняя' },
            { date: '2023-11-17', product: 'Чизкейк', category: 'Торты', forecast: 115, confidence: 'Низкая' },
            { date: '2023-11-18', product: 'Багет', category: 'Хлеб', forecast: 210, confidence: 'Высокая' },
        ];

        // Load the forecast data into the table
        const forecastTable = document.getElementById('forecastTable');
        
        function loadForecastData() {
            forecastTable.innerHTML = '';
            
            forecastData.forEach(item => {
                const row = document.createElement('tr');
                
                // Format the date
                const date = new Date(item.date);
                const formattedDate = date.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                });
                
                // Set confidence color
                let confidenceColor = 'bg-green-100 text-green-800';
                if (item.confidence === 'Средняя') confidenceColor = 'bg-yellow-100 text-yellow-800';
                if (item.confidence === 'Низкая') confidenceColor = 'bg-red-100 text-red-800';
                
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${formattedDate}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">${item.product}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm text-gray-600">${item.category}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-semibold text-amber-700">${item.forecast}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${confidenceColor}">
                            ${item.confidence}
                        </span>
                    </td>
                `;
                
                forecastTable.appendChild(row);
            });
            
            initializeChart();
        }
        
        // Modal functions
        function openModal() {
            document.getElementById('requestModal').classList.remove('hidden');
        }
        
        function closeModal() {
            document.getElementById('requestModal').classList.add('hidden');
        }
        
        // Request new forecast
        function requestNewForecast() {
            const btn = document.getElementById('confirmRequest');
            const originalText = btn.innerHTML;
            
            btn.disabled = true;
            btn.innerHTML = '<span class="loading mr-2"></span><span>Обработка...</span>';
            
            // Simulate API call
            setTimeout(() => {
                // In a real app, we would fetch new data here
                showSuccessNotification();
                btn.innerHTML = originalText;
                btn.disabled = false;
                closeModal();
            }, 2000);
        }
        
        // Show success notification
        function showSuccessNotification() {
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center fade-in';
            notification.innerHTML = `
                <i class="fas fa-check-circle mr-2"></i>
                <span>Новый прогноз успешно создан!</span>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }
        
        // Initialize chart
        function initializeChart() {
            const ctx = document.getElementById('forecastChart').getContext('2d');
            
            // Group data by date
            const groupedData = {};
            forecastData.forEach(item => {
                if (!groupedData[item.date]) {
                    groupedData[item.date] = 0;
                }
                groupedData[item.date] += item.forecast;
            });
            
            const dates = Object.keys(groupedData);
            const totals = Object.values(groupedData);
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates.map(date => {
                        const d = new Date(date);
                        return d.toLocaleDateString('en-US', { weekday: 'short' });
                    }),
                    datasets: [{
                        label: 'Общий дневной прогноз',
                        data: totals,
                        backgroundColor: 'rgba(217, 119, 6, 0.2)',
                        borderColor: 'rgba(217, 119, 6, 1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                display: true,
                                color: 'rgba(0, 0, 0, 0.05)'
                            },
                            ticks: {
                                stepSize: 100
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleFont: { weight: 'bold' },
                            bodyFont: { size: 14 }
                        }
                    }
                }
            });
        }
        
        // Event listeners
        document.getElementById('requestForecast').addEventListener('click', openModal);
        
        // Initialize the page
        document.addEventListener('DOMContentLoaded', loadForecastData);
    </script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</body>
</html>