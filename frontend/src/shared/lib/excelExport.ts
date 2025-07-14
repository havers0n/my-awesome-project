import { ExcelExportData } from "@/shared/lib/types/forecast";

// Функция для экспорта данных в Excel
export const exportToExcel = (data: ExcelExportData): void => {
  // Создаем CSV контент
  const csvContent = generateCSVContent(data);
  
  // Создаем Blob с CSV данными
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Создаем URL для скачивания
  const url = URL.createObjectURL(blob);
  
  // Создаем ссылку для скачивания
  const link = document.createElement('a');
  link.href = url;
  link.download = `forecast-report-${data.timestamp}.csv`;
  link.style.display = 'none';
  
  // Добавляем ссылку в DOM, кликаем по ней и удаляем
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Освобождаем память
  URL.revokeObjectURL(url);
};

// Функция для генерации CSV контента
const generateCSVContent = (data: ExcelExportData): string => {
  const lines: string[] = [];
  
  // Заголовок отчета
  lines.push(`"Отчет по прогнозу продаж"`);
  lines.push(`"Дата создания:","${new Date(data.timestamp).toLocaleString('ru-RU')}"`);
  lines.push(`"Период:","${data.period}"`);
  lines.push('');
  
  // Метрики качества
  lines.push(`"Метрики качества прогноза"`);
  lines.push(`"MAPE (%)","${data.qualityMetrics.mape.toFixed(2)}"`);
  lines.push(`"MAE","${data.qualityMetrics.mae.toFixed(2)}"`);
  lines.push(`"RMSE","${data.qualityMetrics.rmse.toFixed(2)}"`);
  lines.push(`"R²","${data.qualityMetrics.r2.toFixed(3)}"`);
  lines.push(`"Уровень достоверности (%)","${data.qualityMetrics.confidence}"`);
  lines.push(`"Качество данных","${getDataQualityLabel(data.qualityMetrics.dataQuality)}"`);
  lines.push('');
  
  // Рекомендации
  lines.push(`"Рекомендации"`);
  data.qualityMetrics.recommendations.forEach((rec, index) => {
    lines.push(`"${index + 1}","${rec}"`);
  });
  lines.push('');
  
  // Данные тренда
  lines.push(`"Прогноз по датам"`);
  lines.push(`"Дата","Количество (шт.)"`);
  data.trendData.forEach(point => {
    lines.push(`"${point.date}","${point.value}"`);
  });
  lines.push('');
  
  // Топ продукты
  lines.push(`"Топ продукты"`);
  lines.push(`"Наименование","Прогноз (шт.)","Доля (%)"`);
  data.topProducts.forEach(product => {
    const percentage = product.barWidth.replace('%', '');
    lines.push(`"${product.name}","${product.amount}","${percentage}"`);
  });
  
  return lines.join('\n');
};

// Функция для получения локализованного названия качества данных
const getDataQualityLabel = (quality: string): string => {
  const labels = {
    'excellent': 'Отличное',
    'good': 'Хорошее',
    'fair': 'Удовлетворительное',
    'poor': 'Плохое'
  };
  return labels[quality as keyof typeof labels] || quality;
};

// Функция для форматирования данных для экспорта
export const prepareExportData = (
  trendData: any[], 
  topProducts: any[], 
  qualityMetrics: any,
  period: string
): ExcelExportData => {
  return {
    trendData,
    topProducts,
    qualityMetrics,
    timestamp: new Date().toISOString(),
    period
  };
};
