<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Система ввода данных о продажах</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .slide-up {
            animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
        <!-- Header -->
        <header class="mb-8 slide-up">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-indigo-700">Система учета продаж</h1>
                    <p class="text-gray-600">Ввод данных о проданных товарах</p>
                </div>
                <div class="flex items-center space-x-4">
                    <span id="current-date" class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium"></span>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Input Form -->
            <div class="lg:col-span-1 bg-white rounded-xl shadow-md overflow-hidden slide-up">
                <div class="p-6">
                    <h2 class="text-xl font-semibold text-gray-800 mb-4">Добавление товара</h2>
                    
                    <div class="space-y-4">
                        <div>
                            <label for="product-name" class="block text-sm font-medium text-gray-700 mb-1">Название товара</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <i class="fas fa-box text-gray-400"></i>
                                </div>
                                <input type="text" id="product-name" 
                                       class="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                                       placeholder="Например: Торт Малинка">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <i class="fas fa-layer-group text-gray-400"></i>
                                    </div>
                                    <input type="number" id="quantity" 
                                           class="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                                           placeholder="0" min="1">
                                </div>
                            </div>
                            <div>
                                <label for="revenue" class="block text-sm font-medium text-gray-700 mb-1">Выручка (₽)</label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <i class="fas fa-ruble-sign text-gray-400"></i>
                                    </div>
                                    <input type="number" id="revenue" 
                                           class="pl-10 w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                                           placeholder="0" min="0" step="0.01">
                                </div>
                            </div>
                        </div>
                        
                        <button id="add-btn" 
                                class="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                            <i class="fas fa-plus-circle mr-2"></i> Добавить в список
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Products Table -->
            <div class="lg:col-span-2 fade-in">
                <div class="bg-white rounded-xl shadow-md overflow-hidden">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h2 class="text-xl font-semibold text-gray-800">Список добавленных товаров</h2>
                            <button id="submit-btn" 
                                    class="flex items-center space-x-1 py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled>
                                <i class="fas fa-paper-plane mr-1"></i> Отправить данные
                            </button>
                        </div>
                        
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">№</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кол-во</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Выручка (₽)</th>
                                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                                    </tr>
                                </thead>
                                <tbody id="products-table-body" class="bg-white divide-y divide-gray-200">
                                    <tr id="empty-message" class="text-center">
                                        <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Товары не добавлены. Начните вводить данные выше.
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot id="products-table-footer" class="bg-gray-50 hidden">
                                    <tr>
                                        <td colspan="2" class="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Итого:</td>
                                        <td id="total-quantity" class="px-6 py-3 whitespace-nowrap text-sm text-gray-500"></td>
                                        <td id="total-revenue" class="px-6 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold"></td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Success Modal -->
    <div id="success-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 mx-4 slide-up">
            <div class="flex flex-col items-center">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <i class="fas fa-check text-green-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Данные успешно отправлены!</h3>
                <p class="text-sm text-gray-500 text-center mb-6">Ваши данные о продажах были успешно переданы на сервер для обработки.</p>
                <button id="close-modal" class="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    Закрыть
                </button>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Set current date
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            document.getElementById('current-date').textContent = now.toLocaleDateString('ru-RU', options);
            
            let products = [];
            
            // DOM Elements
            const productNameInput = document.getElementById('product-name');
            const quantityInput = document.getElementById('quantity');
            const revenueInput = document.getElementById('revenue');
            const addBtn = document.getElementById('add-btn');
            const submitBtn = document.getElementById('submit-btn');
            const tableBody = document.getElementById('products-table-body');
            const emptyMessage = document.getElementById('empty-message');
            const tableFooter = document.getElementById('products-table-footer');
            const totalQuantityCell = document.getElementById('total-quantity');
            const totalRevenueCell = document.getElementById('total-revenue');
            const successModal = document.getElementById('success-modal');
            const closeModalBtn = document.getElementById('close-modal');
            
            // Add product to list
            addBtn.addEventListener('click', function() {
                const name = productNameInput.value.trim();
                const quantity = parseInt(quantityInput.value);
                const revenue = parseFloat(revenueInput.value);
                
                if (!name || isNaN(quantity) || quantity <= 0 || isNaN(revenue) || revenue <= 0) {
                    alert('Пожалуйста, заполните все поля корректными значениями!');
                    return;
                }
                
                const product = {
                    id: Date.now(),
                    name,
                    quantity,
                    revenue
                };
                
                products.push(product);
                renderProductsList();
                
                // Reset form
                productNameInput.value = '';
                quantityInput.value = '';
                revenueInput.value = '';
                productNameInput.focus();
            });
            
            // Remove product
            function removeProduct(id) {
                products = products.filter(product => product.id !== id);
                renderProductsList();
            }
            
            // Render products list
            function renderProductsList() {
                if (products.length === 0) {
                    emptyMessage.classList.remove('hidden');
                    tableFooter.classList.add('hidden');
                    submitBtn.disabled = true;
                    return;
                }
                
                emptyMessage.classList.add('hidden');
                tableFooter.classList.remove('hidden');
                submitBtn.disabled = false;
                
                // Calculate totals
                const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
                const totalRevenue = products.reduce((sum, product) => sum + product.revenue, 0);
                
                totalQuantityCell.textContent = totalQuantity;
                totalRevenueCell.textContent = totalRevenue.toFixed(2);
                
                // Render rows
                tableBody.innerHTML = '';
                products.forEach((product, index) => {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50 transition-colors';
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${index + 1}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.quantity}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.revenue.toFixed(2)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onclick="removeProduct(${product.id})" class="text-red-600 hover:text-red-900 transition-colors">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
            }
            
            // Submit data
            submitBtn.addEventListener('click', function() {
                // Here you would typically send the data to a server
                // For demonstration, we'll just show a success message
                successModal.classList.remove('hidden');
                
                // In a real app, you might do something like:
                // fetch('/api/sales', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify(products)
                // })
                // .then(response => response.json())
                // .then(data => {
                //     successModal.classList.remove('hidden');
                //     products = [];
                //     renderProductsList();
                // })
                // .catch(error => {
                //     alert('Ошибка при отправке данных: ' + error.message);
                // });
                
                // Clear the list after submission
                products = [];
                renderProductsList();
            });
            
            // Close modal
            closeModalBtn.addEventListener('click', function() {
                successModal.classList.add('hidden');
            });
            
            // Make removeProduct function available globally for the buttons
            window.removeProduct = removeProduct;
            
            // Enable form submission on Enter key
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' && productNameInput.value && quantityInput.value && revenueInput.value) {
                    addBtn.click();
                }
            });
        });
    </script>
</body>
</html>