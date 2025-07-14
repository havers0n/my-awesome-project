
import React, { useMemo } from 'react';
import { Product, ProductStatus } from '../../types';
import DonutChart from './DonutChart';
import { LightningIcon } from '../shared/icons';

interface QuickActionsProps {
    products: Product[];
    onFilterChange: (status: ProductStatus | null) => void;
    activeFilter: ProductStatus | null;
}

const QuickActions: React.FC<QuickActionsProps> = ({ products, onFilterChange, activeFilter }) => {
    const data = useMemo(() => {
        const counts = {
            [ProductStatus.InStock]: 0,
            [ProductStatus.LowStock]: 0,
            [ProductStatus.OutOfStock]: 0,
        };

        products.forEach(p => {
            counts[p.status]++;
        });

        return [
            { name: ProductStatus.InStock, value: counts[ProductStatus.InStock], color: '#22c55e' }, // green-500
            { name: ProductStatus.LowStock, value: counts[ProductStatus.LowStock], color: '#d97706' }, // amber-600
            { name: ProductStatus.OutOfStock, value: counts[ProductStatus.OutOfStock], color: '#991b1b' }, // red-800
        ].filter(item => item.value > 0);
    }, [products]);

    const totalProducts = useMemo(() => products.length, [products]);

    const handleFilter = (status: ProductStatus) => {
        if (activeFilter === status) {
            onFilterChange(null); // Deselect if clicked again
        } else {
            onFilterChange(status);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                 <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                    <LightningIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Обзор склада</h2>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-48 md:h-full min-h-[160px]">
                    <DonutChart 
                        data={data} 
                        total={totalProducts} 
                        onSliceClick={(payload) => handleFilter(payload.name as ProductStatus)} 
                    />
                </div>
                
                <ul className="space-y-3 self-center">
                    {data.map(item => {
                        const status = item.name as ProductStatus;
                        const isActive = activeFilter === status;
                        return (
                            <li
                                key={item.name}
                                onClick={() => handleFilter(status)}
                                className={`flex items-center gap-4 p-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                            >
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className={`font-semibold text-gray-700 ${isActive ? 'font-bold' : ''}`}>
                                    {item.value} {item.name}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default QuickActions;
