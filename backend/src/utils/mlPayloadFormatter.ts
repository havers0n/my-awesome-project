// backend/src/utils/mlPayloadFormatter.ts

interface DbOperation {
  productId: string;
  type: string;
  quantity: number;
  date: string | Date;
  price?: number;
  [key: string]: any;
}

interface MLOperation {
  "Номенклатура": string; // БЫЛО: "Товар"
  Type: string;
  Количество: number;
  Дата: string;
  Цена?: number;
}

/**
 * Форматировать массив операций для ML-модуля
 * @param operations Массив операций из базы данных
 * @returns Отформатированный массив операций для ML
 */
export function formatPayloadForML(operations: DbOperation[]): MLOperation[] {
  return operations.map(op => {
    const formatted: MLOperation = {
      "Номенклатура": op.productId, // БЫЛО: "Товар"
      Type: op.type,
      Количество: Math.round(op.quantity),
      Дата: formatDateToYMD(op.date)
    };
    if (op.type === 'Поставка' && op.price !== undefined) {
      formatted.Цена = op.price;
    }
    return formatted;
  });
}

/**
 * Форматирует дату в YYYY-MM-DD
 */
function formatDateToYMD(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

