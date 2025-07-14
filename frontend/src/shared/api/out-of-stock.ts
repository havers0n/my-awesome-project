import { supabase } from '@/services/supabaseClient';

export interface OutOfStockRecord {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  product_name: string;
  hours: number;
  minutes: number;
  created_at?: string;
}

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

export async function addRecord({ user_id, date, product_name, hours, minutes }: Omit<OutOfStockRecord, "id" | "created_at">) {
  const { data, error } = await supabase
    .from("out_of_stock_items")
    .insert([{ user_id, date, product_name, hours, minutes }])
    .select()
    .single();
  if (error) throw error;
  return data as OutOfStockRecord;
}

export async function deleteRecord(id: string) {
  const { error } = await supabase
    .from("out_of_stock_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}
