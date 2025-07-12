import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TestDatabase {
  static async clean() {
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma%'
    `;

    for (const { tablename } of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
    }
  }

  static async seed(data: {
    users?: any[];
    categories?: any[];
    products?: any[];
    orders?: any[];
  }) {
    const results: any = {};

    if (data.users) {
      results.users = await Promise.all(
        data.users.map(user => prisma.user.create({ data: user }))
      );
    }

    if (data.categories) {
      results.categories = await Promise.all(
        data.categories.map(category => prisma.category.create({ data: category }))
      );
    }

    if (data.products) {
      results.products = await Promise.all(
        data.products.map(product => prisma.product.create({ data: product }))
      );
    }

    if (data.orders) {
      results.orders = await Promise.all(
        data.orders.map(order => prisma.order.create({ data: order }))
      );
    }

    return results;
  }

  static async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }

  static async disconnect() {
    await prisma.$disconnect();
  }
}
