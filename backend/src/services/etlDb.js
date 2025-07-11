// etlDb.js — сервис для работы с sales_input и operations
const { supabase } = require('../supabaseAdminClient');

// Получить запись sales_input по id
async function getSalesInputById(id, tx) {
  const { data, error } = await supabase
    .from('sales_input')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Создать запись в operations
async function createOperation(data, tx) {
  const { data: created, error } = await supabase
    .from('operations')
    .insert([data])
    .select('id')
    .single();
  if (error) throw error;
  return created.id;
}

// Пометить sales_input как обработанную
async function markSalesInputProcessed(id, tx) {
  const { error } = await supabase
    .from('sales_input')
    .update({ is_processed: true, processed_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

module.exports = {
  getSalesInputById,
  createOperation,
  markSalesInputProcessed
}; 