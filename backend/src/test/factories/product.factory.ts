import { Product } from '@prisma/client';
import { faker } from '@faker-js/faker';

export class ProductFactory {
  static build(overrides: Partial<Product> = {}): Partial<Product> {
    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
      sku: faker.string.alphanumeric(10).toUpperCase(),
      stock: faker.number.int({ min: 0, max: 100 }),
      categoryId: faker.string.uuid(),
      images: [faker.image.url()],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static buildOutOfStock(overrides: Partial<Product> = {}): Partial<Product> {
    return ProductFactory.build({
      stock: 0,
      ...overrides,
    });
  }

  static buildInactive(overrides: Partial<Product> = {}): Partial<Product> {
    return ProductFactory.build({
      isActive: false,
      ...overrides,
    });
  }

  static buildMany(count: number, overrides: Partial<Product> = {}): Partial<Product>[] {
    return Array.from({ length: count }, () => ProductFactory.build(overrides));
  }
}
