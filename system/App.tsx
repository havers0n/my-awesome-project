
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/shared/Header';
import QuickActions from './components/dashboard/QuickActions';
import ReportForm from './components/dashboard/ReportForm';
import ProductList from './components/dashboard/ProductList';
import ProductDetailModal from './components/shared/ProductDetailModal';
import AddProductModal from './components/shared/AddProductModal';
import ReportsPage from './components/reports/ReportsPage';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import SalesForecastPage from './components/sales-forecast/SalesForecastPage';
import DashboardSkeleton from './components/dashboard/DashboardSkeleton';
import { Product, ProductStatus, HistoryEntry } from './types';
import { BoxIcon, FileTextIcon, TrendingUpIcon, BarChartIcon } from './components/shared/icons';
import * as api from './api';
import { useToast } from './contexts/ToastProvider';


type View = 'dashboard' | 'reports' | 'analytics' | 'sales-forecast';
type SortableKeys = 'name' | 'shelf' | 'quantity';

interface SortConfig {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
}

const App: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<ProductStatus | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const fetchedProducts = await api.fetchProducts();
                setProducts(fetchedProducts);
            } catch (error) {
                addToast(error instanceof Error ? error.message : 'Не удалось загрузить данные', 'error');
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadProducts();
    }, [addToast]);


    const stats = useMemo(() => {
        return products.reduce((acc, product) => {
            acc.total++;
            if (product.status === ProductStatus.InStock) acc.inStock++;
            else if (product.status === ProductStatus.LowStock) acc.lowStock++;
            else if (product.status === ProductStatus.OutOfStock) acc.outOfStock++;
            return acc;
        }, { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
    }, [products]);

    const handleProductQuantityChange = async (productId: string, newQuantity: number, type: HistoryEntry['type']) => {
        const updatedProduct = await api.updateProductQuantity(productId, newQuantity, type);
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
        if (selectedProduct?.id === productId) {
           setSelectedProduct(updatedProduct);
        }
    };
    
    const handleAddNewProduct = async (newProductData: Omit<Product, 'id' | 'status' | 'history'>) => {
        const newProduct = await api.addProduct(newProductData);
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        setIsAddModalOpen(false);
    };

    const handleReportSubmit = async (productId: string) => {
        const updatedProduct = await api.updateProductQuantity(productId, products.find(p => p.id === productId)!.quantity, 'Отчет о нехватке');
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
         if (selectedProduct?.id === productId) {
           setSelectedProduct(updatedProduct);
        }
    };

    const handleProductUpdate = async (productId: string, updates: Partial<Pick<Product, 'name' | 'shelf' | 'price'>>) => {
        const updatedProduct = await api.updateProductDetails(productId, updates);
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
        if (selectedProduct?.id === productId) {
           setSelectedProduct(updatedProduct);
        }
    };

    const handleProductDelete = async (productId: string) => {
        await api.deleteProduct(productId);
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        setSelectedProduct(null);
    };


    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleCloseModal = () => {
        setSelectedProduct(null);
    };
    
    const handleSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (activeFilter) {
            result = result.filter(p => p.status === activeFilter);
        }

        if (searchQuery) {
            const lowerCaseQuery = searchQuery.toLowerCase().trim();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerCaseQuery) ||
                p.shelf.toLowerCase().includes(lowerCaseQuery)
            );
        }
        
        if (sortConfig !== null) {
            result.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return result;
    }, [products, activeFilter, searchQuery, sortConfig]);

    const GlobalStyles = () => (
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fadeIn {
                animation: fadeIn 0.5s ease-in-out;
            }
            
            @keyframes slideInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0px); opacity: 1; }
            }
            .animate-slideInUp {
                animation: slideInUp 0.4s ease-out;
            }

            .modal-backdrop {
                animation: fadeIn 0.3s ease-out;
            }
        `}</style>
    );

    const NavButton: React.FC<{
        targetView: View;
        currentView: View;
        setCurrentView: (view: View) => void;
        children: React.ReactNode;
    }> = ({ targetView, currentView, setCurrentView, children }) => (
        <button
            onClick={() => setCurrentView(targetView)}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors duration-200 focus:outline-none ${currentView === targetView ? 'border-b-2 border-amber-700 text-amber-700' : 'text-gray-500 hover:text-amber-600'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
            <GlobalStyles />
            <div className="container mx-auto p-4 md:p-8">
                {isInitialLoading ? <DashboardSkeleton /> : (
                    <>
                        <Header stats={stats} />
                        <div className="mb-8 flex justify-center flex-wrap border-b border-gray-200">
                            <NavButton targetView="dashboard" currentView={currentView} setCurrentView={setCurrentView}>
                                <BoxIcon className="w-5 h-5" /> Дашборд
                            </NavButton>
                            <NavButton targetView="reports" currentView={currentView} setCurrentView={setCurrentView}>
                                <FileTextIcon className="w-5 h-5" /> Отчёты и История
                            </NavButton>
                             <NavButton targetView="analytics" currentView={currentView} setCurrentView={setCurrentView}>
                                <BarChartIcon className="w-5 h-5" /> Аналитика
                            </NavButton>
                             <NavButton targetView="sales-forecast" currentView={currentView} setCurrentView={setCurrentView}>
                                <TrendingUpIcon className="w-5 h-5" /> Прогноз продаж
                            </NavButton>
                        </div>
                        
                        {currentView === 'dashboard' && (
                            <div className="animate-fadeIn">
                                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                    <div className="lg:col-span-1">
                                        <QuickActions products={products} onFilterChange={setActiveFilter} activeFilter={activeFilter} />
                                    </div>
                                    <div className="lg:col-span-2">
                                        <ReportForm products={products} onReportSubmit={handleReportSubmit} />
                                    </div>
                                </main>
                                <ProductList 
                                    products={filteredProducts} 
                                    onSelectProduct={handleSelectProduct} 
                                    filter={activeFilter} 
                                    searchQuery={searchQuery}
                                    onSearchChange={setSearchQuery}
                                    onAddProductClick={() => setIsAddModalOpen(true)}
                                    sortConfig={sortConfig}
                                    onSort={handleSort}
                                />
                            </div>
                        )}
                        
                        {currentView === 'reports' && (
                             <ReportsPage products={products} />
                        )}

                        {currentView === 'analytics' && (
                            <AnalyticsPage products={products} />
                        )}

                        {currentView === 'sales-forecast' && (
                            <SalesForecastPage products={products} />
                        )}
                    </>
                )}


                {selectedProduct && (
                    <ProductDetailModal
                        product={selectedProduct}
                        onClose={handleCloseModal}
                        onQuantityChange={handleProductQuantityChange}
                        onUpdate={handleProductUpdate}
                        onDelete={handleProductDelete}
                    />
                )}
                
                {isAddModalOpen && (
                    <AddProductModal
                        onClose={() => setIsAddModalOpen(false)}
                        onAddProduct={handleAddNewProduct}
                        allCategories={Array.from(new Set(products.map(p => p.category)))}
                    />
                )}
            </div>
        </div>
    );
};

export default App;
