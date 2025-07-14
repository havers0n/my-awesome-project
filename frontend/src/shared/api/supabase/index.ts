// Фасад для Supabase API
export { default as supabase } from "./client";
export type { SupabaseClient } from "@supabase/supabase-js";

// Реэкспорт основных типов и утилит
export * from "./client";
