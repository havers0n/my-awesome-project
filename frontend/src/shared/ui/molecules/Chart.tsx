import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ChartData, ChartOptions, ChartType } from "chart.js";

interface ChartProps {
  type: ChartType;
  data: ChartData;
  options?: ChartOptions;
  className?: string;
}

export const ChartComponent: React.FC<ChartProps> = ({ type, data, options, className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    // Уничтожаем предыдущий инстанс, если он существует, перед созданием нового
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      return;
    }

    chartInstanceRef.current = new Chart(ctx, {
      type,
      data,
      options,
    });

    // Функция очистки для уничтожения инстанса при размонтировании компонента
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [type, data, options]); // Пересоздаем чарт при изменении этих пропсов

  return (
    <div className={className}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

// Переименовываем экспорт, чтобы избежать конфликта имен с импортом
export { ChartComponent as Chart }; 