// Сервис для работы с историей отсутствий товаров
// В будущем можно заменить localStorage на API

import { supabase } from "@/services/supabaseClient";

export interface OutOfStockRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  product_name: string;
  hours: number;
  minutes: number;
  created_at?: string;
}

// Получить записи по user_id и (опционально) дате
export async function getRecords({ userId, date }: { userId: string; date?: string }) {
  let query = supabase
    .from("out_of_stock_items")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });
  if (date) {
    query = query.eq("date", date);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as OutOfStockRecord[];
}

// Добавить запись
export async function addRecord({ user_id, date, product_name, hours, minutes }: Omit<OutOfStockRecord, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("out_of_stock_items")
    .insert([{ user_id, date, product_name, hours, minutes }])
    .select()
    .single();
  if (error) throw error;
  return data as OutOfStockRecord;
}

// Удалить запись по id
export async function deleteRecord(id: string) {
  const { error } = await supabase
    .from("out_of_stock_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

// period: 'week' | 'month'
function aggregateByPeriod(period: 'week' | 'month') {
  const history = getHistory();
  const result: Record<string, Record<string, number>> = {};
  history.forEach((rec) => {
    const date = new Date(rec.date);
    let periodKey = "";
    if (period === 'week') {
      // YYYY-WW
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      periodKey = `${year}-W${week}`;
    } else {
      // YYYY-MM
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      periodKey = `${year}-${month}`;
    }
    if (!result[rec.product]) result[rec.product] = {};
    if (!result[rec.product][periodKey]) result[rec.product][periodKey] = 0;
    result[rec.product][periodKey] += rec.hours;
  });
  return result;
}

// Вспомогательная функция для получения номера недели
function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear =
    (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export const outOfStockService = {
  getRecords,
  addRecord,
  deleteRecord,
  aggregateByPeriod,
}; 