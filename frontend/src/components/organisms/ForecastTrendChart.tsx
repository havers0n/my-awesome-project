import React, { useRef } from 'react';
import type { ChartData, ChartOptions, TooltipModel } from 'chart.js';
import { TrendPoint } from '../../pages/types';
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/Card/Card';
import { Button } from '../atoms/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../molecules/Select';
import { Chart } from '../molecules/Chart';
import { Skeleton } from '../atoms/Skeleton';
import { RefreshCw } from 'lucide-react';

interface ForecastTrendChartProps {
  trendData: TrendPoint[];
  trendLabels: string[];
  isLoading: boolean;
  days: number;
  onDaysChange: (days: number) => void;
  onRefresh: () => void;
}

export const ForecastTrendChart: React.FC<ForecastTrendChartProps> = ({
  trendData,
  trendLabels,
  isLoading,
  days,
  onDaysChange,
  onRefresh,
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const chartData: ChartData<'line'> = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Прогноз продаж',
        data: trendData.map((p) => p.value),
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        borderColor: 'rgba(79, 70, 229, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgba(79, 70, 229, 1)',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: (context: { chart: any; tooltip: TooltipModel<'line'> }) => {
            if (!tooltipRef.current) return;
            const tooltipEl = tooltipRef.current;
            const tooltipModel = context.tooltip;
  
            if (tooltipModel.opacity === 0) {
              tooltipEl.style.opacity = '0';
              tooltipEl.style.pointerEvents = 'none';
              return;
            }
  
            const value = tooltipModel.dataPoints[0].formattedValue;
            const label = tooltipModel.dataPoints[0].label;
  
            tooltipEl.innerHTML = `
              <div class="font-bold">${value} шт</div>
              <div>${label}</div>
            `;
  
            const { offsetLeft: chartLeft, offsetTop: chartTop } = context.chart.canvas;
            
            tooltipEl.style.opacity = '1';
            tooltipEl.style.pointerEvents = 'auto';
            tooltipEl.style.position = 'absolute';
            tooltipEl.style.left = chartLeft + tooltipModel.caretX + 'px';
            tooltipEl.style.top = chartTop + tooltipModel.caretY + 'px';
            tooltipEl.style.transform = 'translate(-50%, -100%)';
            tooltipEl.style.padding = '8px';
            tooltipEl.style.background = 'rgba(0,0,0,0.8)';
            tooltipEl.style.color = 'white';
            tooltipEl.style.borderRadius = '4px';
            tooltipEl.style.fontSize = '12px';
            tooltipEl.style.zIndex = '100';
          },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          callback: (value: string | number) => value + ' шт',
        },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Тренд продаж</CardTitle>
        <div className="flex space-x-2">
          <Select value={days.toString()} onValueChange={(val: string) => onDaysChange(Number(val))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 дней</SelectItem>
              <SelectItem value="14">14 дней</SelectItem>
              <SelectItem value="30">30 дней</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Запросить
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-72">
          {isLoading && (
             <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="w-full h-full" />
             </div>
          )}
          <Chart type="line" data={chartData} options={chartOptions} />
          <div ref={tooltipRef} className="tooltip" style={{ opacity: 0, transition: 'opacity 0.2s' }} />
        </div>
      </CardContent>
    </Card>
  );
}; 