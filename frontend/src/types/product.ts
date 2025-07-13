export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: ProductStatus;
  category?: string;
  sku?: string;
  created_at: string;
  updated_at: string;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
}
