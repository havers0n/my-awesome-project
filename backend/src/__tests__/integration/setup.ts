import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.test') });

// Test database client
export const testSupabase = createClient(
  process.env.TEST_SUPABASE_URL || '',
  process.env.TEST_SUPABASE_ANON_KEY || ''
);

// Helper to clean up test data
export async function cleanupTestData() {
  // Clean up test users
  const { error: usersError } = await testSupabase
    .from('users')
    .delete()
    .like('email', '%@test.com');
  
  if (usersError) console.error('Error cleaning up test users:', usersError);
  
  // Clean up test organizations
  const { error: orgsError } = await testSupabase
    .from('organizations')
    .delete()
    .like('name', 'Test%');
  
  if (orgsError) console.error('Error cleaning up test organizations:', orgsError);
  
  // Clean up test products
  const { error: productsError } = await testSupabase
    .from('products')
    .delete()
    .like('name', 'Test%');
  
  if (productsError) console.error('Error cleaning up test products:', productsError);
}

// Helper to create test user
export async function createTestUser(email: string = 'test@test.com', password: string = 'testpassword123') {
  const { data, error } = await testSupabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Test User',
        role: 'user'
      }
    }
  });
  
  if (error) throw error;
  return data;
}

// Helper to get auth token
export async function getTestAuthToken(email: string = 'test@test.com', password: string = 'testpassword123') {
  const { data, error } = await testSupabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data.session?.access_token;
}

// Setup and teardown hooks
export const setupIntegrationTests = {
  beforeAll: async () => {
    // Initialize test database if needed
    console.log('Setting up integration test environment...');
  },
  
  beforeEach: async () => {
    // Clean up before each test
    await cleanupTestData();
  },
  
  afterEach: async () => {
    // Clean up after each test
    await cleanupTestData();
  },
  
  afterAll: async () => {
    // Final cleanup
    console.log('Cleaning up integration test environment...');
    await cleanupTestData();
  }
};
