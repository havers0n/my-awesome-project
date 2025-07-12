
import React from 'react';
import StatCard from './StatCard';
import { WarehouseIcon } from './icons';
import { ProductStatus } from '../../types';

interface HeaderProps {
    stats: {
        total: number;
        inStock: number;
        lowStock: number;
        outOfStock: number;
    }
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
    return (
        <header className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <div className="bg-amber-600 p-3 rounded-xl text-white">
                    <WarehouseIcon className="w-8 h-8"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Система управления складом</h1>
                    <p className="text-gray-400">Полный контроль над товарными запасами в режиме реального времени</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Всего SKU" value={stats.total} />
                <StatCard label={ProductStatus.InStock} value={stats.inStock} color="text-green-500" />
                <StatCard label={ProductStatus.LowStock} value={stats.lowStock} color="text-yellow-500" />
                <StatCard label={ProductStatus.OutOfStock} value={stats.outOfStock} color="text-red-500" />
            </div>
        </header>
    );
};

export default Header;
