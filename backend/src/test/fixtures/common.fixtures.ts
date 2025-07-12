export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Test Admin',
    role: 'ADMIN' as const,
  },
  user: {
    email: 'user@test.com',
    password: 'user123',
    name: 'Test User',
    role: 'USER' as const,
  },
  unverified: {
    email: 'unverified@test.com',
    password: 'unverified123',
    name: 'Unverified User',
    role: 'USER' as const,
    isVerified: false,
  },
};

export const testCategories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
  },
  {
    name: 'Books',
    slug: 'books',
    description: 'Books and publications',
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    description: 'Apparel and accessories',
  },
];

export const testProducts = {
  laptop: {
    name: 'Test Laptop',
    description: 'High-performance laptop for testing',
    price: 999.99,
    sku: 'LAPTOP001',
    stock: 50,
    images: ['laptop1.jpg', 'laptop2.jpg'],
  },
  outOfStock: {
    name: 'Out of Stock Product',
    description: 'This product is out of stock',
    price: 49.99,
    sku: 'OOS001',
    stock: 0,
    images: ['oos.jpg'],
  },
  inactive: {
    name: 'Inactive Product',
    description: 'This product is inactive',
    price: 29.99,
    sku: 'INACTIVE001',
    stock: 100,
    isActive: false,
    images: ['inactive.jpg'],
  },
};

export const testOrders = {
  pending: {
    status: 'PENDING' as const,
    items: [
      { quantity: 2, price: 50.00 },
      { quantity: 1, price: 100.00 },
    ],
  },
  delivered: {
    status: 'DELIVERED' as const,
    items: [
      { quantity: 1, price: 999.99 },
    ],
  },
};
