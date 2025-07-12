import request from 'supertest';
import app from '../../app';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('XSS Security Tests', () => {
  let authToken: string;
  let testUser: any;

  beforeAll(async () => {
    // Clean up database
    await prisma.user.deleteMany();
    
    const hashedPassword = await bcrypt.hash('TestPassword123!', 10);
    testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER'
      }
    });

    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Input Sanitization', () => {
    test('should sanitize script tags in user input', async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')"></iframe>',
        '<body onload=alert("XSS")>',
        '<input onfocus=alert("XSS") autofocus>',
        '<select onfocus=alert("XSS") autofocus>',
        '<textarea onfocus=alert("XSS") autofocus>',
        '<button onclick=alert("XSS")>Click me</button>',
        '<a href="javascript:alert(\'XSS\')">Click me</a>'
      ];

      for (const payload of xssPayloads) {
        const response = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: payload,
            content: payload,
            description: payload
          });

        if (response.status === 201) {
          // Проверяем, что скрипты были очищены
          expect(response.body.title).not.toContain('<script>');
          expect(response.body.title).not.toContain('javascript:');
          expect(response.body.title).not.toContain('onerror=');
          expect(response.body.title).not.toContain('onload=');
          expect(response.body.title).not.toContain('onfocus=');
          expect(response.body.title).not.toContain('onclick=');
        }
      }
    });

    test('should sanitize event handlers in attributes', async () => {
      const eventHandlerPayloads = [
        { name: 'Test', bio: '<div onmouseover="alert(\'XSS\')">Hover me</div>' },
        { name: 'Test', bio: '<p onclick="alert(\'XSS\')">Click me</p>' },
        { name: 'Test', bio: '<img src="valid.jpg" onload="alert(\'XSS\')">' },
        { name: 'Test', bio: '<svg><script>alert("XSS")</script></svg>' }
      ];

      for (const payload of eventHandlerPayloads) {
        const response = await request(app)
          .put(`/api/users/${testUser.id}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send(payload);

        if (response.status === 200) {
          expect(response.body.bio).not.toContain('onmouseover=');
          expect(response.body.bio).not.toContain('onclick=');
          expect(response.body.bio).not.toContain('onload=');
          expect(response.body.bio).not.toContain('<script>');
        }
      }
    });
  });

  describe('Content-Type Headers', () => {
    test('should set proper Content-Type headers for JSON responses', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['content-type']).toContain('application/json');
    });

    test('should not reflect user input in HTML responses', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .get('/api/search')
        .query({ q: xssPayload });

      // Проверяем, что ответ не содержит несанитизированный пользовательский ввод
      const responseText = JSON.stringify(response.body);
      expect(responseText).not.toContain('<script>alert("XSS")</script>');
    });
  });

  describe('Stored XSS Prevention', () => {
    test('should prevent stored XSS in user profiles', async () => {
      const xssPayloads = [
        {
          name: '<script>alert("Stored XSS")</script>',
          bio: '<img src=x onerror=alert("Stored XSS")>',
          website: 'javascript:alert("Stored XSS")'
        }
      ];

      for (const payload of xssPayloads) {
        // Создаем пользователя с XSS payload
        const createResponse = await request(app)
          .post('/api/users')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            email: `xss${Date.now()}@example.com`,
            password: 'password123',
            ...payload
          });

        if (createResponse.status === 201) {
          const userId = createResponse.body.id;

          // Получаем пользователя обратно
          const getResponse = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);

          // Проверяем, что XSS payload был санитизирован
          expect(getResponse.body.name).not.toContain('<script>');
          expect(getResponse.body.bio).not.toContain('onerror=');
          expect(getResponse.body.website).not.toContain('javascript:');
        }
      }
    });

    test('should prevent stored XSS in comments', async () => {
      const xssComment = {
        content: '<script>document.cookie</script><img src=x onerror=alert(document.cookie)>',
        postId: 1
      };

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(xssComment);

      if (response.status === 201) {
        expect(response.body.content).not.toContain('<script>');
        expect(response.body.content).not.toContain('onerror=');
      }
    });
  });

  describe('DOM-based XSS Prevention', () => {
    test('should escape special characters in JSON responses', async () => {
      const specialChars = {
        name: '<>&"\'`',
        description: '<<SCRIPT>alert("XSS")//<</SCRIPT>',
        data: '{"key": "<img src=x onerror=alert(1)>"}'
      };

      const response = await request(app)
        .post('/api/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send(specialChars);

      if (response.status === 201) {
        // Проверяем, что специальные символы экранированы
        const responseText = JSON.stringify(response.body);
        expect(responseText).toContain('\\u003c'); // < escaped
        expect(responseText).toContain('\\u003e'); // > escaped
      }
    });
  });

  describe('URL Parameter XSS', () => {
    test('should sanitize XSS in URL parameters', async () => {
      const xssParams = [
        'search?q=<script>alert("XSS")</script>',
        'users?filter=<img src=x onerror=alert("XSS")>',
        'posts?sort="><script>alert("XSS")</script>',
        'api?callback=alert("XSS")'
      ];

      for (const param of xssParams) {
        const response = await request(app)
          .get(`/api/${param}`)
          .set('Authorization', `Bearer ${authToken}`);

        // Проверяем, что ответ не содержит XSS
        const responseText = JSON.stringify(response.body);
        expect(responseText).not.toContain('<script>');
        expect(responseText).not.toContain('onerror=');
        expect(responseText).not.toContain('alert(');
      }
    });
  });

  describe('File Upload XSS', () => {
    test('should validate file types and prevent XSS through file uploads', async () => {
      const maliciousFiles = [
        {
          filename: 'test.html',
          content: '<html><script>alert("XSS")</script></html>',
          mimetype: 'text/html'
        },
        {
          filename: 'test.svg',
          content: '<svg onload=alert("XSS")></svg>',
          mimetype: 'image/svg+xml'
        },
        {
          filename: '"><script>alert("XSS")</script>.jpg',
          content: 'fake image content',
          mimetype: 'image/jpeg'
        }
      ];

      for (const file of maliciousFiles) {
        const response = await request(app)
          .post('/api/upload')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from(file.content), {
            filename: file.filename,
            contentType: file.mimetype
          });

        // Проверяем, что опасные файлы отклонены или санитизированы
        if (response.status === 200) {
          expect(response.body.filename).not.toContain('<script>');
          expect(response.body.filename).not.toContain('">');
        }
      }
    });
  });

  describe('Response Headers', () => {
    test('should set X-Content-Type-Options header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });

    test('should set X-XSS-Protection header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    test('should set Content-Security-Policy header', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    });
  });

  describe('Template Injection', () => {
    test('should prevent template injection attacks', async () => {
      const templatePayloads = [
        '{{7*7}}',
        '${7*7}',
        '<%= 7*7 %>',
        '{{constructor.constructor("alert(1)")()}}',
        '${constructor.constructor("alert(1)")()}'
      ];

      for (const payload of templatePayloads) {
        const response = await request(app)
          .post('/api/messages')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            message: payload,
            template: payload
          });

        if (response.status === 201) {
          // Проверяем, что payload не был выполнен
          expect(response.body.message).not.toBe('49'); // 7*7
          expect(response.body.message).toBe(payload); // Должен быть сохранен как есть
        }
      }
    });
  });
});
