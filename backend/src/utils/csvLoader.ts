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

// Функция для очистки названия товара от служебных префиксов
const cleanProductName = (name: string): string => {
  // Удаляем префиксы типа "(Х5)", "(не_исп)", "(не_исп.)" и другие
  let cleanedName = name
    .replace(/^\([^)]+\)\s*/, '') // Удаляем префиксы в скобках в начале
    .replace(/^[^а-яё]*/, '') // Удаляем не-кириллические символы в начале
    .trim();
  
  // Если после очистки название пустое, возвращаем оригинальное
  if (!cleanedName) {
    return name;
  }
  
  return cleanedName;
};

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
        const originalName = values[0] || '';
        const cleanedName = cleanProductName(originalName);
        
        const product: CSVProduct = {
          Номенклатура: cleanedName,
          Код: values[1] || '',
          RMSE: parseFloat(values[2]) || 0,
          MAE: parseFloat(values[3]) || 0,
          MAPE: parseFloat(values[4]) || 0,
          wMAPE: parseFloat(values[5]) || 0,
          R2: parseFloat(values[6]) || 0
        };
        
        // Фильтруем только товары с названием и разумными метриками
        if (product.Номенклатура && 
            product.Номенклатура !== 'Номенклатура' && 
            product.MAPE > 0 && 
            product.MAPE < 100) {
          products.push(product);
        }
      }
    }
    
    console.log(`Загружено ${products.length} товаров из CSV (после очистки)`);
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