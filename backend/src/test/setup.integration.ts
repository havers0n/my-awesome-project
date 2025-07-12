import './setup';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db',
    },
  },
});

// Setup test database
beforeAll(async () => {
  try {
    // Run migrations
    execSync('npx prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test_db',
      },
    });

    // Connect to database
    await prisma.$connect();
  } catch (error) {
    console.error('Failed to setup test database:', error);
    throw error;
  }
});

// Clean up database before each test
beforeEach(async () => {
  // Get all table names
  const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE '_prisma%'
  `;

  // Clear all tables
  for (const { tablename } of tables) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE`);
  }
});

// Cleanup after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
