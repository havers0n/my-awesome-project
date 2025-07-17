import './setup';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || `postgresql://${process.env.TEST_DB_USER || 'postgres'}:${process.env.TEST_DB_PASSWORD || 'postgres'}@${process.env.TEST_DB_HOST || 'localhost'}:${process.env.TEST_DB_PORT || '5432'}/${process.env.TEST_DB_NAME || 'test_db'}?schema=public`,
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
        DATABASE_URL: process.env.TEST_DATABASE_URL || `postgresql://${process.env.TEST_DB_USER || 'postgres'}:${process.env.TEST_DB_PASSWORD || 'postgres'}@${process.env.TEST_DB_HOST || 'localhost'}:${process.env.TEST_DB_PORT || '5432'}/${process.env.TEST_DB_NAME || 'test_db'}?schema=public`,
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
