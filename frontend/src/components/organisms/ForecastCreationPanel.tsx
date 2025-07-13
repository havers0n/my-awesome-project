import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../atoms/Card/Card'; // <-- ПРАВИЛЬНЫЙ ПУТЬ
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { RefreshCw } from 'lucide-react';

interface ForecastCreationPanelProps {
  isLoading: boolean;
  onStartForecast: (days: number) => void;
  initialDays?: number;
}

export const ForecastCreationPanel: React.FC<ForecastCreationPanelProps> = ({
  isLoading,
  onStartForecast,
  initialDays = 7,
}) => {
  const [days, setDays] = useState(initialDays.toString());
  const [error, setError] = useState<string | null>(null);

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      const numValue = Number(value);
      if (numValue > 90) {
        setError('Период не может превышать 90 дней.');
      } else {
        setError(null);
      }
      setDays(value);
    }
  };

  const handleCreateClick = () => {
    if (!days || Number(days) <= 0) {
      setError('Укажите количество дней.');
      return;
    }
    onStartForecast(Number(days));
  };

  const isButtonDisabled = isLoading || !!error || !days;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Создать новый прогноз</CardTitle>
        <CardDescription>
          Укажите период в днях, на который вы хотите построить прогноз.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-2">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Например, 14"
              value={days}
              onChange={handleDaysChange}
              disabled={isLoading}
              variant={error ? 'error' : 'default'}
            />
            {error && <p className="text-sm text-destructive mt-1">{error}</p>}
          </div>
          <Button onClick={handleCreateClick} disabled={isButtonDisabled}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Создать'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 