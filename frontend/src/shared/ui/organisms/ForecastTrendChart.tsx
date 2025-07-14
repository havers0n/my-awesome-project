import React from "react";

interface TrendPoint {
  date: string;
  value: number;
  predicted?: boolean;
}

interface ForecastTrendChartProps {
  data: TrendPoint[];
  loading?: boolean;
  onDaysChange: (days: number) => void;
  selectedDays: number;
}

const ForecastTrendChart: React.FC<ForecastTrendChartProps> = ({
  data,
  loading = false,
  onDaysChange,
  selectedDays,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Forecast Trend</h3>
        <div className="flex space-x-2">
          {[7, 14, 30, 60].map((days) => (
            <button
              key={days}
              onClick={() => onDaysChange(days)}
              className={`px-3 py-1 text-sm rounded ${
                selectedDays === days
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>
      
      <div className="h-64 flex items-end space-x-2">
        {data.map((point, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500 hover:bg-blue-600 transition-colors relative"
            style={{
              height: `${(point.value / Math.max(...data.map(p => p.value))) * 100}%`,
              opacity: point.predicted ? 0.6 : 1,
            }}
            title={`${point.date}: ${point.value}`}
          >
            {point.predicted && (
              <div className="absolute top-0 left-0 w-full h-full bg-stripe opacity-50"></div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>Past {selectedDays} days</span>
        <span>Current trends</span>
      </div>
    </div>
  );
};

export default ForecastTrendChart;
