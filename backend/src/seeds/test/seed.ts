import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export async function seedTestData() {
  try {
    // Clear existing data
    await clearDatabase();

    // Seed users
    const users = await seedUsers();
    
    // Seed categories
    const categories = await seedCategories();
    
    // Seed products
    const products = await seedProducts(categories);
    
    // Seed orders
    await seedOrders(users, products);

    console.log('Test data seeded successfully');
  } catch (error) {
    console.error('Error seeding test data:', error);
    throw error;
  }
}

async function clearDatabase() {
  const tables = ['OrderItem', 'Order', 'Product', 'Category', 'User'];
  
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }
}

async function seedUsers() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    // Admin user
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isVerified: true,
      },
    }),
    // Regular users
    ...Array.from({ length: 5 }, (_, i) => 
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          password: hashedPassword,
          name: faker.person.fullName(),
          role: 'USER',
          isVerified: true,
        },
      })
    ),
  ]);
  
  return users;
}

async function seedCategories() {
  const categoryNames = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports'];
  
  const categories = await Promise.all(
    categoryNames.map(name =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          description: faker.lorem.sentence(),
        },
      })
    )
  );
  
  return categories;
}

async function seedProducts(categories: any[]) {
  const products = [];
  
  for (const category of categories) {
    const categoryProducts = await Promise.all(
      Array.from({ length: 10 }, () =>
        prisma.product.create({
          data: {
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
            sku: faker.string.alphanumeric(10).toUpperCase(),
            stock: faker.number.int({ min: 0, max: 100 }),
            categoryId: category.id,
            images: [faker.image.url()],
            isActive: faker.datatype.boolean(0.9), // 90% chance of being active
          },
        })
      )
    );
    products.push(...categoryProducts);
  }
  
  return products;
}

async function seedOrders(users: any[], products: any[]) {
  const orders = [];
  
  for (const user of users.slice(1)) { // Skip admin user
    const orderCount = faker.number.int({ min: 0, max: 5 });
    
    for (let i = 0; i < orderCount; i++) {
      const orderProducts = faker.helpers.arrayElements(products, { min: 1, max: 5 });
      const orderItems = orderProducts.map(product => ({
        productId: product.id,
        quantity: faker.number.int({ min: 1, max: 3 }),
        price: product.price,
      }));
      
      const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status: faker.helpers.arrayElement(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
          total,
          orderItems: {
            create: orderItems,
          },
        },
      });
      
      orders.push(order);
    }
  }
  
  return orders;
}

// Run seed if called directly
if (require.main === module) {
  seedTestData()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}
