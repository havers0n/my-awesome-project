// etlHelpers.js — Вспомогательные функции ETL для Supabase
const { supabase } = require('../supabaseAdminClient'); // или ваш клиент

// --- Транзакции (пример для supabase-js через SQL) ---
async function beginTransaction() {
  // Для Supabase: используйте raw SQL для транзакций
  const { data, error } = await supabase.rpc('begin');
  if (error) throw error;
  return data; // или возвращайте connection/session, если используете node-postgres
}
async function commitTransaction() {
  const { error } = await supabase.rpc('commit');
  if (error) throw error;
}
async function rollbackTransaction() {
  const { error } = await supabase.rpc('rollback');
  if (error) throw error;
}

// --- Find or Create helpers ---
async function findOrCreateManufacturer(data, tx) {
  const name = data.manufacturer;
  const orgId = data.organization_id;
  // 1. Поиск
  let { data: found, error } = await supabase
    .from('manufacturers')
    .select('id')
    .eq('name', name)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  // 2. Создание
  let { data: created, error: insertError } = await supabase
    .from('manufacturers')
    .insert([{ name, organization_id: orgId }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}
async function findOrCreateCategory(data, tx) {
  const name = data.product_category;
  const orgId = data.organization_id;
  let { data: found, error } = await supabase
    .from('product_categories')
    .select('id')
    .eq('name', name)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  let { data: created, error: insertError } = await supabase
    .from('product_categories')
    .insert([{ name, organization_id: orgId }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}
async function findOrCreateGroup(data, tx) {
  const name = data.product_group;
  const orgId = data.organization_id;
  let { data: found, error } = await supabase
    .from('product_groups')
    .select('id')
    .eq('name', name)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  let { data: created, error: insertError } = await supabase
    .from('product_groups')
    .insert([{ name, organization_id: orgId }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}
async function findOrCreateKind(data, tx) {
  const name = data.nomenclature_type;
  const orgId = data.organization_id;
  let { data: found, error } = await supabase
    .from('product_kinds')
    .select('id')
    .eq('name', name)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  let { data: created, error: insertError } = await supabase
    .from('product_kinds')
    .insert([{ name, organization_id: orgId }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}
async function findOrCreateProduct(data, tx) {
  const orgId = data.organization_id;
  const code = data.code;
  // Вложенные зависимости
  const manufacturerId = await findOrCreateManufacturer(data, tx);
  const categoryId = await findOrCreateCategory(data, tx);
  const groupId = await findOrCreateGroup(data, tx);
  const kindId = await findOrCreateKind(data, tx);
  // Поиск продукта
  let { data: found, error } = await supabase
    .from('products')
    .select('id')
    .eq('code', code)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  // Создание продукта
  let { data: created, error: insertError } = await supabase
    .from('products')
    .insert([{
      organization_id: orgId,
      name: data.nomenclature,
      sku: data.article,
      code: code,
      article: data.article,
      price: data.price || 0,
      weight: data.weight,
      shelf_life_hours: data.shelf_life_hours,
      manufacturer_id: manufacturerId,
      product_category_id: categoryId,
      product_group_id: groupId,
      product_kind_id: kindId
    }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}
async function findOrCreateSupplier(data, tx) {
  const name = data.supplier;
  const orgId = data.organization_id;
  let { data: found, error } = await supabase
    .from('suppliers')
    .select('id')
    .eq('name', name)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  let { data: created, error: insertError } = await supabase
    .from('suppliers')
    .insert([{ name, organization_id: orgId }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}
async function findOrCreateLocation(data, tx) {
  const address = data.store_address;
  const orgId = data.organization_id;
  let { data: found, error } = await supabase
    .from('locations')
    .select('id')
    .eq('address', address)
    .eq('organization_id', orgId)
    .maybeSingle();
  if (error) throw error;
  if (found) return found.id;
  let { data: created, error: insertError } = await supabase
    .from('locations')
    .insert([{ name: address, address, organization_id: orgId }])
    .select('id')
    .single();
  if (insertError) throw insertError;
  return created.id;
}

module.exports = {
  findOrCreateProduct,
  findOrCreateSupplier,
  findOrCreateLocation,
  findOrCreateManufacturer,
  findOrCreateCategory,
  findOrCreateGroup,
  findOrCreateKind,
  beginTransaction,
  commitTransaction,
  rollbackTransaction
}; 