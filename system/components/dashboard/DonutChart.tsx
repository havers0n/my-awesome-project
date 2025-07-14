
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
  total: number;
  onSliceClick?: (payload: any) => void;
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 rounded-md shadow-lg">
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
  };

const DonutChart: React.FC<DonutChartProps> = ({ data, total, onSliceClick }) => {
  return (
    <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="65%"
              outerRadius="85%"
              fill="#8884d8"
              paddingAngle={data.length > 1 ? 5 : 0}
              dataKey="value"
              onClick={(data) => onSliceClick && onSliceClick(data)}
              className="cursor-pointer"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-4xl font-bold text-gray-800">{total}</span>
            <span className="text-sm text-gray-400">товаров</span>
        </div>
    </div>
  );
};

export default DonutChart;
