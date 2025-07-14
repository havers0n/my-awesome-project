import './setup.integration';
import { seedTestData } from '../seeds/test/seed';
import supertest from 'supertest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import app from '../app';

const prisma = new PrismaClient();

export const request = supertest(app);

// Seed test data before all E2E tests
beforeAll(async () => {
  await seedTestData();
});

// Helper function to get auth token
export async function getAuthToken(email: string = 'admin@example.com', password: string = 'password123'): Promise<string> {
  const response = await request
    .post('/api/auth/login')
    .send({ email, password });
  
  return response.body.token;
}

// Helper function to create authenticated request
export function authenticatedRequest(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, token: string) {
  return request[method](url).set('Authorization', `Bearer ${token}`);
}
