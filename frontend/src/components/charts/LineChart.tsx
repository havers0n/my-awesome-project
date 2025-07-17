import React from 'react';
import { TimeMetric, MetricType } from '../../types.admin';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface LineChartProps {
  data: TimeMetric[];
  metric: MetricType;
}

export const LineChart: React.FC<LineChartProps> = ({ data, metric }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded shadow p-4 mb-4 min-h-[300px] flex items-center justify-center">
        <span className="text-gray-500">Нет данных для отображения</span>
      </div>
    );
  }

  const chartData = {
    series: [
      {
        name: metric === 'r2' ? 'R²' : 'MAPE',
        data: data.map(item => ({
          x: item.date,
          y: item[metric]
        }))
      }
    ]
  };

  const options: ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      zoom: {
        enabled: true
      },
      toolbar: {
        show: true
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    colors: ['#3B82F6'],
    dataLabels: {
      enabled: false
    },
    title: {
      text: `График ${metric === 'r2' ? 'R²' : 'MAPE'} по времени`,
      align: 'left',
      style: {
        fontSize: '16px',
        fontWeight: '600'
      }
    },
    grid: {
      borderColor: '#e0e6ed',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    markers: {
      size: 4,
      colors: ['#3B82F6'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    xaxis: {
      type: 'datetime',
      title: {
        text: 'Дата'
      }
    },
    yaxis: {
      title: {
        text: metric === 'r2' ? 'R²' : 'MAPE'
      },
      labels: {
        formatter: (value) => {
          if (metric === 'r2') {
            return value.toFixed(2);
          } else {
            return value.toFixed(1) + '%';
          }
        }
      }
    },
    tooltip: {
      theme: 'light',
      x: {
        format: 'dd MMM yyyy'
      },
      y: {
        formatter: (value) => {
          if (metric === 'r2') {
            return value.toFixed(3);
          } else {
            return value.toFixed(1) + '%';
          }
        }
      }
    },
    responsive: [{
      breakpoint: 600,
      options: {
        chart: {
          height: 250
        }
      }
    }]
  };

  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <ReactApexChart 
        options={options} 
        series={chartData.series} 
        type="line" 
        height={300} 
      />
    </div>
  );
};
