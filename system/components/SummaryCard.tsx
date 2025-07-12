
import React from 'react';
import { ProductStatus } from '../types';

interface SummaryCardProps {
    status: ProductStatus;
    count: number;
    color: string;
    isActive: boolean;
    onClick: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ status, count, color, isActive, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all duration-200 ${isActive ? 'border-amber-700 bg-amber-700/10' : 'border-transparent bg-gray-50 hover:bg-gray-100'}`}
        >
            <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                <span className="font-semibold text-gray-700">{status}</span>
                {isActive && <span className="text-xs font-bold text-amber-700">[Фильтр]</span>}
            </div>
            <span className="font-bold text-gray-800">{count}</span>
        </button>
    )
}
