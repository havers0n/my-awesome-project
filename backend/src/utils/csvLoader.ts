import fs from 'fs';
import path from 'path';

export interface CSVProduct {
  Номенклатура: string;
  Код: string;
  RMSE: number;
  MAE: number;
  MAPE: number;
  wMAPE?: number;
  R2?: number;
}

export const loadCSVProducts = async (): Promise<CSVProduct[]> => {
  try {
    // Путь к CSV файлу в ML модели
    const csvPath = path.join(__dirname, '../../../SalesPrediction-Vlad_branch/microservice/all_sku_metrics_1.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error(`CSV файл не найден: ${csvPath}`);
      throw new Error('CSV файл с товарами не найден');
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // Парсим CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const products: CSVProduct[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      
      if (values.length >= 5) {
        const product: CSVProduct = {
          Номенклатура: values[0] || '',
          Код: values[1] || '',
          RMSE: parseFloat(values[2]) || 0,
          MAE: parseFloat(values[3]) || 0,
          MAPE: parseFloat(values[4]) || 0,
          wMAPE: parseFloat(values[5]) || 0,
          R2: parseFloat(values[6]) || 0
        };
        
        // Фильтруем только товары с названием
        if (product.Номенклатура && product.Номенклатура !== 'Номенклатура') {
          products.push(product);
        }
      }
    }
    
    console.log(`Загружено ${products.length} товаров из CSV`);
    return products;
    
  } catch (error) {
    console.error('Ошибка загрузки CSV файла:', error);
    throw new Error('Не удалось загрузить данные товаров из CSV');
  }
};

// Функция для получения товара по названию
export const findProductByName = (products: CSVProduct[], name: string): CSVProduct | null => {
  return products.find(product => 
    product.Номенклатура.toLowerCase() === name.toLowerCase()
  ) || null;
};

// Функция для получения товара по коду
export const findProductByCode = (products: CSVProduct[], code: string): CSVProduct | null => {
  return products.find(product => 
    product.Код.toLowerCase() === code.toLowerCase()
  ) || null;
}; 