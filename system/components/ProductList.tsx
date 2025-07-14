import React from 'react';
import { Product, ProductStatus } from '../types';
import ProductItem from './ProductItem';
import { SearchIcon, PlusIcon, ChevronUpIcon, ChevronDownIcon } from './icons';

type SortableKeys = 'name' | 'shelf' | 'quantity';

interface SortConfig {
    key: SortableKeys;
    direction: 'ascending' | 'descending';
}

interface ProductListProps {
    products: Product[];
    onSelectProduct: (product: Product) => void;
    filter: ProductStatus | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddProductClick: () => void;
    sortConfig: SortConfig | null;
    onSort: (key: SortableKeys) => void;
}

const SortableHeader: React.FC<{
    title: string;
    sortKey: SortableKeys;
    sortConfig: SortConfig | null;
    onSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ title, sortKey, sortConfig, onSort, className }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    return (
        <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
            <button onClick={() => onSort(sortKey)} className="flex items-center gap-1 group">
                {title}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {isSorted ? (
                        direction === 'ascending' ? <ChevronUpIcon /> : <ChevronDownIcon />
                    ) : (
                        <ChevronUpIcon className="text-gray-300" />
                    )}
                </span>
            </button>
        </th>
    );
};


const ProductList: React.FC<ProductListProps> = ({ products, onSelectProduct, filter, searchQuery, onSearchChange, onAddProductClick, sortConfig, onSort }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Состояние склада</h2>
                        {filter && (
                             <p className="mt-1 text-sm text-amber-700 font-semibold">
                                Показаны товары со статусом: &quot;{filter}&quot;
                            </p>
                        )}
                    </div>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                         <div className="relative flex-grow">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Поиск по названию или полке..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition"
                            />
                        </div>
                        <button 
                            onClick={onAddProductClick}
                            className="flex items-center gap-2 bg-amber-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-amber-600 transition-colors duration-300"
                        >
                            <PlusIcon />
                            <span className="hidden sm:inline">Добавить</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader title="Название" sortKey="name" sortConfig={sortConfig} onSort={onSort} className="text-left" />
                            <SortableHeader title="Полка" sortKey="shelf" sortConfig={sortConfig} onSort={onSort} className="text-left" />
                            <SortableHeader title="Кол-во" sortKey="quantity" sortConfig={sortConfig} onSort={onSort} className="text-center" />
                            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Edit</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => (
                            <ProductItem key={product.id} product={product} onSelect={onSelectProduct} />
                        ))}
                         {products.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-500">
                                    <h4 className="font-semibold text-lg text-gray-600">Товары не найдены</h4>
                                    <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductList;