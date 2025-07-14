import React from "react";

interface ForecastHistoryItem {
  id: string;
  date: string;
  accuracy: string;
  period: string;
  status: string;
}

interface ForecastHistoryTableProps {
  history: ForecastHistoryItem[];
  loading?: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onCategoryChange: (category: string) => void;
}

export const ForecastHistoryTable: React.FC<ForecastHistoryTableProps> = ({
  history,
  loading = false,
  page,
  limit,
  total,
  onPageChange,
  onSearch,
  onCategoryChange,
}) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Forecast History</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Date</th>
              <th className="pb-2">Period</th>
              <th className="pb-2">Accuracy</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2">{item.date}</td>
                <td className="py-2">{item.period}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 text-xs rounded ${{
                    'Высокая': 'bg-green-100 text-green-800',
                    'Средняя': 'bg-yellow-100 text-yellow-800',
                    'Низкая': 'bg-red-100 text-red-800',
                  }[item.accuracy] || 'bg-gray-100 text-gray-800'}`}>
                    {item.accuracy}
                  </span>
                </td>
                <td className="py-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Simple pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} results
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page * limit >= total}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};
