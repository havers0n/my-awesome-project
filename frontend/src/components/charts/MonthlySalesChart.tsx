import React from 'react';

interface MonthlySalesChartProps {
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }>;
  };
  height?: number;
  className?: string;
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({
  data,
  height = 200,
  className = '',
}) => {
  const defaultData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  const chartData = data || defaultData;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Monthly Sales
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chart showing monthly sales data
          </p>
          <div className="mt-4 flex justify-center space-x-4">
            {chartData.labels.map((label, index) => (
              <div key={label} className="text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {chartData.datasets[0].data[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
