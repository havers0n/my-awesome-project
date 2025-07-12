import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Protected Resources Access Tests', () => {
  let adminToken: string;
  let userToken: string;
  let moderatorToken: string;
  let adminUser: any;
  let regularUser: any;
  let moderatorUser: any;
  let unauthorizedUserId: number;
  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    
    // Создаем пользователей с разными ролями
    const hashedPasswordAdmin = await bcrypt.hash('AdminPass123!', 10);
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        password: hashedPasswordAdmin,
        role: 'ADMIN'
      }
    });

    const hashedPasswordUser = await bcrypt.hash('UserPass123!', 10);
    regularUser = await prisma.user.create({
      data: {
        email: 'user@example.com',
        password: hashedPasswordUser,
        role: 'USER'
      }
    });

    const hashedPasswordMod = await bcrypt.hash('ModPass123!', 10);
    moderatorUser = await prisma.user.create({
      data: {
        email: 'moderator@example.com',
        password: hashedPasswordMod,
        role: 'MODERATOR'
      }
    });

    const hashedPasswordUnauth = await bcrypt.hash('UnAuth123!', 10);
    const unauthorizedUser = await prisma.user.create({
      data: {
        email: 'unauthorized@example.com',
        password: hashedPasswordUnauth,
        role: 'USER'
      }
    });
    unauthorizedUserId = unauthorizedUser.id;

    // Генерируем токены
    adminToken = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: 'admin' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    userToken = jwt.sign(
      { id: regularUser.id, email: regularUser.email, role: 'user' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    moderatorToken = jwt.sign(
      { id: moderatorUser.id, email: moderatorUser.email, role: 'moderator' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Authentication Required', () => {
    test('should deny access to protected endpoints without authentication', async () => {
      const protectedEndpoints = [
        { method: 'get', path: '/api/users' },
        { method: 'get', path: '/api/profile' },
        { method: 'post', path: '/api/posts' },
        { method: 'put', path: '/api/users/1' },
        { method: 'delete', path: '/api/posts/1' }
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request(app)[endpoint.method](endpoint.path);
        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Authentication required');
      }
    });

    test('should deny access with invalid token format', async () => {
      const invalidTokens = [
        'InvalidToken',
        'Bearer',
        'Bearer ',
        'Token ' + userToken,
        null,
        undefined
      ];

      for (const token of invalidTokens) {
        const response = await request(app)
          .get('/api/profile')
          .set('Authorization', token || '');
        
        expect(response.status).toBe(401);
      }
    });

    test('should deny access with tampered token', async () => {
      // Изменяем токен
      const tamperedToken = userToken.slice(0, -10) + 'tampered123';
      
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${tamperedToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token');
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    test('should allow only admins to access admin endpoints', async () => {
      const adminEndpoints = [
        { method: 'get', path: '/api/admin/users' },
        { method: 'post', path: '/api/admin/settings' },
        { method: 'delete', path: '/api/admin/users/1' }
      ];

      for (const endpoint of adminEndpoints) {
        // Админ должен иметь доступ
        const adminResponse = await request(app)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${adminToken}`);
        expect(adminResponse.status).not.toBe(403);

        // Обычный пользователь не должен иметь доступ
        const userResponse = await request(app)[endpoint.method](endpoint.path)
          .set('Authorization', `Bearer ${userToken}`);
        expect(userResponse.status).toBe(403);
        expect(userResponse.body.error).toContain('Insufficient permissions');
      }
    });

    test('should allow moderators specific access', async () => {
      // Модератор может управлять контентом
      const contentResponse = await request(app)
        .delete('/api/posts/1')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(contentResponse.status).not.toBe(403);

      // Но не может управлять пользователями
      const userManagementResponse = await request(app)
        .delete('/api/admin/users/1')
        .set('Authorization', `Bearer ${moderatorToken}`);
      expect(userManagementResponse.status).toBe(403);
    });

    test('should enforce hierarchical permissions', async () => {
      const hierarchicalEndpoints = [
        { path: '/api/reports', minRole: 'user' },
        { path: '/api/moderation', minRole: 'moderator' },
        { path: '/api/admin/dashboard', minRole: 'admin' }
      ];

      for (const endpoint of hierarchicalEndpoints) {
        // Пользователь
        const userResponse = await request(app)
          .get(endpoint.path)
          .set('Authorization', `Bearer ${userToken}`);

        // Модератор
        const modResponse = await request(app)
          .get(endpoint.path)
          .set('Authorization', `Bearer ${moderatorToken}`);

        // Админ
        const adminResponse = await request(app)
          .get(endpoint.path)
          .set('Authorization', `Bearer ${adminToken}`);

        if (endpoint.minRole === 'admin') {
          expect(userResponse.status).toBe(403);
          expect(modResponse.status).toBe(403);
          expect(adminResponse.status).not.toBe(403);
        } else if (endpoint.minRole === 'moderator') {
          expect(userResponse.status).toBe(403);
          expect(modResponse.status).not.toBe(403);
          expect(adminResponse.status).not.toBe(403);
        } else {
          expect(userResponse.status).not.toBe(403);
          expect(modResponse.status).not.toBe(403);
          expect(adminResponse.status).not.toBe(403);
        }
      }
    });
  });

  describe('Resource Ownership', () => {
    test('should allow users to access only their own resources', async () => {
      // Пользователь может получить свой профиль
      const ownProfileResponse = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(ownProfileResponse.status).toBe(200);

      // Но не может получить чужой профиль
      const otherProfileResponse = await request(app)
        .get(`/api/users/${unauthorizedUserId}`)
        .set('Authorization', `Bearer ${userToken}`);
      expect(otherProfileResponse.status).toBe(403);
    });

    test('should allow users to modify only their own resources', async () => {
      // Пользователь может обновить свой профиль
      const updateOwnResponse = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated Name' });
      expect(updateOwnResponse.status).toBe(200);

      // Но не может обновить чужой
      const updateOtherResponse = await request(app)
        .put(`/api/users/${unauthorizedUserId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hacked Name' });
      expect(updateOtherResponse.status).toBe(403);
    });

    test('should allow admins to access all resources', async () => {
      // Админ может получить любой профиль
      const anyProfileResponse = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(anyProfileResponse.status).toBe(200);

      // Админ может изменить любой профиль
      const updateAnyResponse = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Updated' });
      expect(updateAnyResponse.status).toBe(200);
    });
  });

  describe('API Scopes and Permissions', () => {
    test('should enforce specific permission requirements', async () => {
      const permissionEndpoints = [
        { path: '/api/users', permission: 'users:read' },
        { path: '/api/users', method: 'post', permission: 'users:create' },
        { path: '/api/analytics', permission: 'analytics:view' },
        { path: '/api/settings', permission: 'settings:manage' }
      ];

      // Создаем токен с ограниченными правами
      const limitedToken = jwt.sign(
        { 
          id: regularUser.id, 
          email: regularUser.email,
          permissions: ['users:read']
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      for (const endpoint of permissionEndpoints) {
        const method = endpoint.method || 'get';
        const response = await request(app)[method](endpoint.path)
          .set('Authorization', `Bearer ${limitedToken}`);

        if (endpoint.permission === 'users:read') {
          expect(response.status).not.toBe(403);
        } else {
          expect(response.status).toBe(403);
          expect(response.body.error).toContain('Missing required permission');
        }
      }
    });

    test('should validate token scopes for OAuth-like access', async () => {
      // Токен с ограниченными scope
      const scopedToken = jwt.sign(
        { 
          id: regularUser.id,
          scopes: ['read:profile', 'write:posts']
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      // Может читать профиль
      const readResponse = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${scopedToken}`);
      expect(readResponse.status).toBe(200);

      // Может создавать посты
      const writeResponse = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${scopedToken}`)
        .send({ title: 'Test', content: 'Content' });
      expect(writeResponse.status).not.toBe(403);

      // Не может удалять пользователей
      const deleteResponse = await request(app)
        .delete('/api/users/1')
        .set('Authorization', `Bearer ${scopedToken}`);
      expect(deleteResponse.status).toBe(403);
    });
  });

  describe('Sensitive Data Protection', () => {
    test('should filter sensitive fields based on user role', async () => {
      // Обычный пользователь
      const userResponse = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(userResponse.body).not.toHaveProperty('password');
      expect(userResponse.body).not.toHaveProperty('refreshToken');
      expect(userResponse.body).not.toHaveProperty('passwordResetToken');

      // Админ может видеть больше полей, но не пароли
      const adminResponse = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(adminResponse.body).not.toHaveProperty('password');
      expect(adminResponse.body).toHaveProperty('createdAt');
      expect(adminResponse.body).toHaveProperty('lastLogin');
    });

    test('should prevent access to internal API endpoints', async () => {
      const internalEndpoints = [
        '/api/internal/cache/clear',
        '/api/internal/metrics',
        '/api/internal/health/detailed'
      ];

      for (const endpoint of internalEndpoints) {
        // Даже админ не должен иметь доступ извне
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.status).toBe(403);
        expect(response.body.error).toContain('Internal endpoint');
      }
    });
  });

  describe('Cross-User Resource Access', () => {
    test('should prevent IDOR vulnerabilities', async () => {
      // Создаем ресурс для первого пользователя
      const createResponse = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ 
          title: 'Private Document',
          content: 'Secret content'
        });

      const documentId = createResponse.body.id;

      // Второй пользователь пытается получить доступ
      const unauthorizedToken = jwt.sign(
        { id: unauthorizedUserId, email: 'unauthorized@example.com', role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const accessResponse = await request(app)
        .get(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${unauthorizedToken}`);
      
      expect(accessResponse.status).toBe(403);
      expect(accessResponse.body.error).toContain('Access denied');
    });

    test('should validate resource existence before authorization', async () => {
      // Попытка доступа к несуществующему ресурсу
      const response = await request(app)
        .get('/api/documents/99999')
        .set('Authorization', `Bearer ${userToken}`);
      
      // Должен вернуть 404, а не 403
      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Not found');
    });
  });

  describe('Token Claims Validation', () => {
    test('should validate all required claims in JWT', async () => {
      // Токен без необходимых claims
      const incompleteToken = jwt.sign(
        { id: regularUser.id }, // Отсутствует email и role
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${incompleteToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token claims');
    });

    test('should reject tokens with invalid issuer or audience', async () => {
      const invalidIssuerToken = jwt.sign(
        { 
          id: regularUser.id,
          email: regularUser.email,
          role: 'user',
          iss: 'invalid-issuer',
          aud: 'wrong-audience'
        },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${invalidIssuerToken}`);
      
      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid token issuer');
    });
  });
});
