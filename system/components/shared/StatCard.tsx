
import React from 'react';

interface StatCardProps {
    label: string;
    value: number;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, color = 'text-gray-800' }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-amber-400 transition-colors">
            <p className="text-sm text-gray-400 font-medium">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
    );
};

export default StatCard;
