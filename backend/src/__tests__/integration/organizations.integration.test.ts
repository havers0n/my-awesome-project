import request from 'supertest';
import app from '../../app';
import { setupIntegrationTests, testSupabase, getTestAuthToken } from './setup';

describe('Organizations CRUD Integration Tests', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await setupIntegrationTests.beforeAll();
    
    // Create regular user
    await testSupabase.auth.signUp({
      email: 'user@test.com',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Regular User',
          role: 'user'
        }
      }
    });
    
    // Create admin user
    await testSupabase.auth.signUp({
      email: 'admin@test.com',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Admin User',
          role: 'admin'
        }
      }
    });
    
    authToken = await getTestAuthToken('user@test.com', 'testpassword123') || '';
    adminToken = await getTestAuthToken('admin@test.com', 'testpassword123') || '';
  });

  beforeEach(setupIntegrationTests.beforeEach);
  afterEach(setupIntegrationTests.afterEach);
  afterAll(setupIntegrationTests.afterAll);

  describe('GET /admin/organizations', () => {
    beforeEach(async () => {
      // Create test organizations
      const organizations = [
        { name: 'Test Organization 1', description: 'Test Org 1', is_active: true },
        { name: 'Test Organization 2', description: 'Test Org 2', is_active: true },
        { name: 'Test Organization 3', description: 'Test Org 3', is_active: false }
      ];

      for (const org of organizations) {
        await testSupabase.from('organizations').insert(org);
      }
    });

    it('should return list of organizations for admin', async () => {
      const response = await request(app)
        .get('/admin/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter active organizations', async () => {
      const response = await request(app)
        .get('/admin/organizations?active=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((org: any) => {
        expect(org.is_active).toBe(true);
      });
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/admin/organizations?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(2);
    });

    it('should deny access for non-admin users', async () => {
      const response = await request(app)
        .get('/admin/organizations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /admin/organizations', () => {
    it('should create new organization as admin', async () => {
      const newOrg = {
        name: 'Test New Organization',
        description: 'A new test organization',
        is_active: true,
        settings: {
          theme: 'light',
          language: 'en'
        }
      };

      const response = await request(app)
        .post('/admin/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newOrg)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newOrg.name);
      expect(response.body.description).toBe(newOrg.description);
    });

    it('should validate required fields', async () => {
      const invalidOrg = {
        description: 'Missing name field'
      };

      const response = await request(app)
        .post('/admin/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidOrg)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should prevent duplicate organization names', async () => {
      const org = {
        name: 'Test Duplicate Org',
        description: 'First org'
      };

      // Create first organization
      await request(app)
        .post('/admin/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(org)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/admin/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(org)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny creation for non-admin users', async () => {
      const newOrg = {
        name: 'Test Unauthorized Org',
        description: 'Should not be created'
      };

      const response = await request(app)
        .post('/admin/organizations')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newOrg)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /admin/organizations/:id', () => {
    let testOrgId: string;

    beforeEach(async () => {
      // Create a test organization
      const { data } = await testSupabase
        .from('organizations')
        .insert({
          name: 'Test Get Organization',
          description: 'Test organization for GET',
          is_active: true
        })
        .select()
        .single();

      testOrgId = data?.id;
    });

    it('should return organization details', async () => {
      const response = await request(app)
        .get(`/admin/organizations/${testOrgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', testOrgId);
      expect(response.body).toHaveProperty('name', 'Test Get Organization');
    });

    it('should return 404 for non-existent organization', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/admin/organizations/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/admin/organizations/invalid-uuid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('PUT /admin/organizations/:id', () => {
    let testOrgId: string;

    beforeEach(async () => {
      // Create a test organization
      const { data } = await testSupabase
        .from('organizations')
        .insert({
          name: 'Test Update Organization',
          description: 'Original description',
          is_active: true
        })
        .select()
        .single();

      testOrgId = data?.id;
    });

    it('should update organization', async () => {
      const updates = {
        description: 'Updated description',
        is_active: false,
        settings: {
          theme: 'dark'
        }
      };

      const response = await request(app)
        .put(`/admin/organizations/${testOrgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body.description).toBe(updates.description);
      expect(response.body.is_active).toBe(updates.is_active);
    });

    it('should prevent updating to duplicate name', async () => {
      // Create another organization
      await testSupabase
        .from('organizations')
        .insert({
          name: 'Test Existing Organization',
          description: 'Existing org'
        });

      const updates = {
        name: 'Test Existing Organization'
      };

      const response = await request(app)
        .put(`/admin/organizations/${testOrgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updates)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent organization', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/admin/organizations/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny update for non-admin users', async () => {
      const response = await request(app)
        .put(`/admin/organizations/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ description: 'Unauthorized update' })
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /admin/organizations/:id', () => {
    let testOrgId: string;

    beforeEach(async () => {
      // Create a test organization
      const { data } = await testSupabase
        .from('organizations')
        .insert({
          name: 'Test Delete Organization',
          description: 'To be deleted',
          is_active: true
        })
        .select()
        .single();

      testOrgId = data?.id;
    });

    it('should soft delete organization', async () => {
      const response = await request(app)
        .delete(`/admin/organizations/${testOrgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');

      // Verify organization is soft deleted
      const { data } = await testSupabase
        .from('organizations')
        .select('is_active')
        .eq('id', testOrgId)
        .single();

      expect(data?.is_active).toBe(false);
    });

    it('should permanently delete with force flag', async () => {
      const response = await request(app)
        .delete(`/admin/organizations/${testOrgId}?force=true`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(200);

      // Verify organization is permanently deleted
      const { data } = await testSupabase
        .from('organizations')
        .select()
        .eq('id', testOrgId)
        .single();

      expect(data).toBeNull();
    });

    it('should return 404 for non-existent organization', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .delete(`/admin/organizations/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should deny deletion for non-admin users', async () => {
      const response = await request(app)
        .delete(`/admin/organizations/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking database errors
      // For now, we'll test with invalid data that might cause DB errors
      const invalidData = {
        name: null, // Assuming name is required and NOT NULL
        description: 'a'.repeat(1001) // Assuming max length constraint
      };

      const response = await request(app)
        .post('/admin/organizations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect('Content-Type', /json/);

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle concurrent updates', async () => {
      // Create organization
      const { data } = await testSupabase
        .from('organizations')
        .insert({
          name: 'Test Concurrent Organization',
          description: 'For concurrent update test'
        })
        .select()
        .single();

      const orgId = data?.id;

      // Simulate concurrent updates
      const update1 = request(app)
        .put(`/admin/organizations/${orgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Update 1' });

      const update2 = request(app)
        .put(`/admin/organizations/${orgId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Update 2' });

      const [response1, response2] = await Promise.all([update1, update2]);

      // Both should succeed (last write wins) or one should fail with conflict
      expect([200, 409]).toContain(response1.status);
      expect([200, 409]).toContain(response2.status);
    });
  });
});
