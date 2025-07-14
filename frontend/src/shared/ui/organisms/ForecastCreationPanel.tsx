import React, { useState } from "react";
import { Button } from "@/shared/ui/atoms/Button";

interface ForecastCreationPanelProps {
  onCreateForecast: (days: number) => void;
  loading?: boolean;
}

export const ForecastCreationPanel: React.FC<ForecastCreationPanelProps> = ({
  onCreateForecast,
  loading = false,
}) => {
  const [selectedDays, setSelectedDays] = useState(14);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateForecast(selectedDays);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Create New Forecast</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Forecast Period (days)
          </label>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="w-full p-2 border rounded-md"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
        
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Forecast'}
        </Button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>This will generate a new forecast based on historical data and current trends.</p>
      </div>
    </div>
  );
};
