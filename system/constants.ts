
import { Product, ProductStatus } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Колбаса докторская',
    shelf: 'B1',
    category: 'Мясные изделия',
    quantity: 36,
    status: ProductStatus.InStock,
    price: 550,
    history: [
      { id: 'h-1-1', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 50, newQuantity: 50 },
      { id: 'h-1-2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -14, newQuantity: 36 },
    ],
  },
  {
    id: 'prod-2',
    name: 'Сыр российский',
    shelf: 'B1',
    category: 'Сыры',
    quantity: 7,
    status: ProductStatus.LowStock,
    price: 800,
     history: [
      { id: 'h-2-1', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 20, newQuantity: 20 },
      { id: 'h-2-2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -13, newQuantity: 7 },
    ],
  },
  {
    id: 'prod-3',
    name: 'Молоко 3.2%',
    shelf: 'E2',
    category: 'Молочные продукты',
    quantity: 0,
    status: ProductStatus.OutOfStock,
    price: 90,
    history: [
      { id: 'h-3-1', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 12, newQuantity: 12 },
      { id: 'h-3-2', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -12, newQuantity: 0 },
    ],
  },
  {
    id: 'prod-4',
    name: 'Хлеб белый',
    shelf: 'A1',
    category: 'Выпечка',
    quantity: 33,
    status: ProductStatus.InStock,
    price: 50,
    history: [
        { id: 'h-4-1', date: new Date().toISOString(), type: 'Поступление', change: 33, newQuantity: 33 },
    ],
  },
  {
    id: 'prod-5',
    name: 'Масло сливочное',
    shelf: 'D1',
    category: 'Молочные продукты',
    quantity: 14,
    status: ProductStatus.InStock,
    price: 180,
    history: [
        { id: 'h-5-1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 14, newQuantity: 14 },
    ],
  },
  {
    id: 'prod-6',
    name: 'Яйца куриные (десяток)',
    shelf: 'C2',
    category: 'Яйца',
    quantity: 25,
    status: ProductStatus.InStock,
    price: 120,
    history: [
        { id: 'h-6-1', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 30, newQuantity: 30 },
        { id: 'h-6-2', date: new Date().toISOString(), type: 'Списание', change: -5, newQuantity: 25 },
    ],
  },
  {
    id: 'prod-7',
    name: 'Рис круглозерный 1кг',
    shelf: 'A1',
    category: 'Бакалея',
    quantity: 8,
    status: ProductStatus.LowStock,
    price: 150,
     history: [
        { id: 'h-7-1', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), type: 'Поступление', change: 15, newQuantity: 15 },
        { id: 'h-7-2', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), type: 'Списание', change: -7, newQuantity: 8 },
    ],
  },
];