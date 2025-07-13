import React from 'react';

interface StatisticsChartProps {
  data?: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string[];
    }>;
  };
  height?: number;
  className?: string;
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  data,
  height = 200,
  className = '',
}) => {
  const defaultData = {
    labels: ['Product A', 'Product B', 'Product C', 'Product D'],
    datasets: [
      {
        label: 'Revenue',
        data: [300, 50, 100, 200],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const chartData = data || defaultData;

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Statistics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Revenue breakdown by product</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {chartData.labels.map((label, index) => (
              <div key={label} className="text-center">
                <div
                  className="w-4 h-4 mx-auto mb-1 rounded-full"
                  style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  ${chartData.datasets[0].data[index]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsChart;
