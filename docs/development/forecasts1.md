<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Model Forecast Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #6b73ff 0%, #000dff 100%);
        }
        .shadow-soft {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .hover-scale {
            transition: transform 0.2s ease;
        }
        .hover-scale:hover {
            transform: scale(1.02);
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    </style>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header -->
        <header class="gradient-bg text-white">
            <div class="container mx-auto px-4 py-6">
                <div class="flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <i class="fas fa-chart-line text-2xl"></i>
                        <h1 class="text-2xl font-bold">Sales Forecast Dashboard</h1>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button class="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition">
                            <i class="fas fa-user mr-2"></i>Account
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="container mx-auto px-4 py-8">
            <!-- Dashboard Controls -->
            <div class="mb-8 bg-white rounded-xl shadow-soft p-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 class="text-xl font-semibold text-gray-800">Model Forecast</h2>
                        <p class="text-gray-600">View and manage your product sales predictions</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div class="relative flex-grow">
                            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
                            <input type="text" placeholder="Search products..." class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <button id="requestForecastBtn" class="gradient-bg text-white px-6 py-2 rounded-lg font-medium hover-scale flex items-center justify-center">
                            <i class="fas fa-sync-alt mr-2"></i> Request Forecast
                        </button>
                    </div>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white rounded-xl shadow-soft p-6 hover-scale">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500">Total Products</p>
                            <h3 class="text-2xl font-bold mt-1">1,248</h3>
                        </div>
                        <div class="bg-blue-100 p-3 rounded-lg">
                            <i class="fas fa-boxes text-blue-600"></i>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <p class="text-sm text-gray-500 flex items-center">
                            <span class="text-green-500 mr-1"><i class="fas fa-arrow-up"></i> 12%</span> from last month
                        </p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-soft p-6 hover-scale">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500">Forecast Accuracy</p>
                            <h3 class="text-2xl font-bold mt-1">89.7%</h3>
                        </div>
                        <div class="bg-green-100 p-3 rounded-lg">
                            <i class="fas fa-bullseye text-green-600"></i>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <p class="text-sm text-gray-500 flex items-center">
                            <span class="text-green-500 mr-1"><i class="fas fa-arrow-up"></i> 2.3%</span> improvement
                        </p>
                    </div>
                </div>
                <div class="bg-white rounded-xl shadow-soft p-6 hover-scale">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="text-gray-500">Next 7 Days</p>
                            <h3 class="text-2xl font-bold mt-1">24,591</h3>
                            <p class="text-sm">units forecasted</p>
                        </div>
                        <div class="bg-purple-100 p-3 rounded-lg">
                            <i class="fas fa-chart-bar text-purple-600"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Forecast Table -->
            <div class="bg-white rounded-xl shadow-soft overflow-hidden fade-in">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center">
                                        Date
                                        <button class="ml-1 text-gray-400 hover:text-gray-600">
                                            <i class="fas fa-sort"></i>
                                        </button>
                                    </div>
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center">
                                        Product Name
                                        <button class="ml-1 text-gray-400 hover:text-gray-600">
                                            <i class="fas fa-sort"></i>
                                        </button>
                                    </div>
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <div class="flex items-center">
                                        Forecasted Sales
                                        <button class="ml-1 text-gray-400 hover:text-gray-600">
                                            <i class="fas fa-sort"></i>
                                        </button>
                                    </div>
                                </th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Confidence
                                </th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200" id="forecastTableBody">
                            <!-- Data will be loaded here -->
                        </tbody>
                    </table>
                </div>
                <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                    <div class="flex-1 flex justify-between sm:hidden">
                        <button class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Previous
                        </button>
                        <button class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Next
                        </button>
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p class="text-sm text-gray-700">
                                Showing <span class="font-medium">1</span> to <span class="font-medium">10</span> of <span class="font-medium">1248</span> results
                            </p>
                        </div>
                        <div>
                            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <span class="sr-only">Previous</span>
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button aria-current="page" class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    1
                                </button>
                                <button class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    2
                                </button>
                                <button class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    3
                                </button>
                                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                    ...
                                </span>
                                <button class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                                    8
                                </button>
                                <button class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                                    <span class="sr-only">Next</span>
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Forecast Details Modal -->
            <div id="forecastModal" class="fixed inset-0 z-50 hidden overflow-y-auto">
                <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>
                    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                    <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                        <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div class="sm:flex sm:items-start">
                                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                    <div class="flex justify-between items-center">
                                        <h3 class="text-lg leading-6 font-medium text-gray-900" id="modalTitle">
                                            Forecast Details
                                        </h3>
                                        <button id="closeModal" class="text-gray-400 hover:text-gray-500">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div class="mt-4">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p class="text-sm text-gray-500">Product Name</p>
                                                <p class="font-medium" id="modalProductName">-</p>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Date</p>
                                                <p class="font-medium" id="modalDate">-</p>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Forecasted Sales</p>
                                                <p class="font-medium" id="modalForecast">-</p>
                                            </div>
                                            <div>
                                                <p class="text-sm text-gray-500">Confidence Level</p>
                                                <p class="font-medium" id="modalConfidence">-</p>
                                            </div>
                                        </div>
                                        <div class="mt-6">
                                            <h4 class="text-md font-medium mb-2">Historical Performance</h4>
                                            <div class="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <p class="text-gray-500">Chart would be displayed here</p>
                                            </div>
                                        </div>
                                        <div class="mt-4">
                                            <h4 class="text-md font-medium mb-2">Notes</h4>
                                            <textarea class="w-full border border-gray-300 rounded-lg p-2" rows="3" placeholder="Add notes about this forecast..."></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                                Save Changes
                            </button>
                            <button type="button" id="cancelModal" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script>
        // Sample data for the forecast table
        const forecastData = [
            { date: '2023-06-01', product: 'Premium Headphones X9', forecast: 124, confidence: 'High' },
            { date: '2023-06-01', product: 'Wireless Earbuds Pro', forecast: 89, confidence: 'Medium' },
            { date: '2023-06-02', product: 'Smart Watch Series 5', forecast: 56, confidence: 'High' },
            { date: '2023-06-02', product: 'Bluetooth Speaker Mini', forecast: 112, confidence: 'High' },
            { date: '2023-06-03', product: 'Premium Headphones X9', forecast: 98, confidence: 'Medium' },
            { date: '2023-06-03', product: 'Fitness Tracker V2', forecast: 76, confidence: 'Low' },
            { date: '2023-06-04', product: 'Wireless Charging Pad', forecast: 145, confidence: 'High' },
            { date: '2023-06-04', product: 'Smartphone Case Ultra', forecast: 203, confidence: 'High' },
            { date: '2023-06-05', product: 'Noise Cancelling Headphones', forecast: 67, confidence: 'Medium' },
            { date: '2023-06-05', product: 'Portable SSD 1TB', forecast: 42, confidence: 'Low' }
        ];

        // Function to populate the table with data
        function populateTable() {
            const tableBody = document.getElementById('forecastTableBody');
            tableBody.innerHTML = '';

            forecastData.forEach(item => {
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 cursor-pointer';
                row.onclick = () => openModal(item);

                // Determine confidence color
                let confidenceColor = '';
                if (item.confidence === 'High') confidenceColor = 'text-green-600 bg-green-50';
                else if (item.confidence === 'Medium') confidenceColor = 'text-yellow-600 bg-yellow-50';
                else confidenceColor = 'text-red-600 bg-red-50';

                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${item.date}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${item.product}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        ${item.forecast} units
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${confidenceColor}">
                            ${item.confidence} confidence
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button class="text-blue-600 hover:text-blue-900 mr-3" onclick="event.stopPropagation(); openModal(${JSON.stringify(item)})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="text-gray-600 hover:text-gray-900" onclick="event.stopPropagation(); downloadForecast(${JSON.stringify(item)})">
                            <i class="fas fa-download"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Function to open modal with forecast details
        function openModal(item) {
            document.getElementById('modalProductName').textContent = item.product;
            document.getElementById('modalDate').textContent = item.date;
            document.getElementById('modalForecast').textContent = `${item.forecast} units`;
            document.getElementById('modalConfidence').textContent = item.confidence;
            
            document.getElementById('forecastModal').classList.remove('hidden');
            document.body.classList.add('overflow-hidden');
        }

        // Function to close modal
        function closeModal() {
            document.getElementById('forecastModal').classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
        }

        // Function to simulate forecast request
        function requestForecast() {
            const btn = document.getElementById('requestForecastBtn');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
            btn.disabled = true;
            
            // Simulate API call delay
            setTimeout(() => {
                // In a real app, you would fetch new data here
                btn.innerHTML = '<i class="fas fa-check mr-2"></i> Forecast Updated';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                    
                    // Show success notification
                    alert('New forecast data has been successfully loaded!');
                    populateTable(); // Refresh table with new data
                }, 1500);
            }, 2000);
        }

        // Function to simulate forecast download
        function downloadForecast(item) {
            alert(`Downloading forecast for ${item.product} (${item.date})`);
            // In a real app, this would generate and download a report
        }

        // Event listeners
        document.getElementById('requestForecastBtn').addEventListener('click', requestForecast);
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('cancelModal').addEventListener('click', closeModal);

        // Initialize the table when page loads
        document.addEventListener('DOMContentLoaded', populateTable);
    </script>
</body>
</html>