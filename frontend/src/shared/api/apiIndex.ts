// Shared API public API
// Export API clients and services here

// Supabase API
export * from "./supabase";

// Основной API (переименовываем для избежания конфликтов)
export { default as baseAPI, authAPI } from "./api";

// Сервисы
export * from "./outOfStockService";
export * from "./shelfAvailabilityService";
export * from "./userPreferencesService";
export * from "./warehouseApi";
