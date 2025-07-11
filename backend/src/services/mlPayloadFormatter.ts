// backend/src/services/mlPayloadFormatter.ts
import { getSupabaseUserClient } from '../supabaseUserClient';

/**
 * Создает payload для ML-сервиса из данных операций организации
 * @param organizationId - ID организации
 * @param daysCount - количество дней для прогноза
 * @param userToken - токен пользователя для доступа к Supabase
 * @param salesData - данные о продажах от клиента
 * @returns Promise<any[]> - массив данных для ML-сервиса
 */
export async function createMlPayload(organizationId: string, daysCount: number, userToken: string, salesData?: any[]): Promise<any[]> {
  const supabase = getSupabaseUserClient(userToken);

  // Если переданы данные от клиента, используем их напрямую
  if (salesData && salesData.length > 0) {
    // Добавляем DaysCount в начало массива, если его там нет
    const hasHeaderWithDaysCount = salesData[0].hasOwnProperty('DaysCount');
    if (!hasHeaderWithDaysCount) {
      return [{ DaysCount: daysCount }, ...salesData];
    }
    return salesData;
  }

  // Иначе получаем исторические данные из таблицы operations
  const { data: operationsData, error: operationsError } = await supabase
    .from('operations')
    .select(`
      id,
      operation_date,
      operation_type,
      quantity,
      total_amount,
      cost_price,
      product_id,
      location_id
    `)
    .eq('organization_id', organizationId)
    .order('operation_date', { ascending: false });

  if (operationsError) {
    throw new Error(`Ошибка получения исторических данных: ${operationsError.message}`);
  }

  // Получаем продукты организации
  const { data: products } = await supabase
    .from('products')
    .select('id, name, code')
    .eq('organization_id', organizationId);

  const productMap = new Map(products?.map(p => [p.id, p]) || []);

  // Подготавливаем данные для отправки в ML-микросервис
  const mlRequestData = operationsData.map(op => {
      const operationType = op.operation_type === 'sale' ? 'Продажа' : 'Поставка';
      
      // Базовые данные для всех операций
      const baseData = {
        Период: op.operation_date ? new Date(op.operation_date).toISOString().slice(0, 10) : null, // YYYY-MM-DD формат
        Номенклатура: productMap.get(op.product_id)?.name || `Product ${op.product_id}`,
        Количество: Math.round(op.quantity || 0), // Округление до целого числа
        Код: productMap.get(op.product_id)?.code || `CODE-${op.product_id}`,
        ВидНоменклатуры: productMap.get(op.product_id)?.name || `Product ${op.product_id}`,
        Type: operationType,
        Адрес_точки: `Location ${op.location_id}`
      };
      
      // Добавляем поле "Цена" только для операций "Поставка"
      if (operationType === 'Поставка') {
        (baseData as any).Цена = op.cost_price || null;
      }
      
      return baseData;
    });

  // Добавляем заголовок с количеством дней в начало массива
  return [{ DaysCount: daysCount }, ...mlRequestData];
}
