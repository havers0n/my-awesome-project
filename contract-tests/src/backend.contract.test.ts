import { loginRequestSchema, loginResponseSchema } from './schemas/backend-api.schema';
import { expect } from 'jest';

// Пример теста на валидацию запроса на вход в систему

test('Valid login request should pass validation', () => {
  const validRequest = {
    email: 'user@example.com',
    password: 's3cr3tp@ssw0rd'
  };
  const { error } = loginRequestSchema.validate(validRequest);
  expect(error).toBeUndefined();
});

test('Invalid login request should fail validation', () => {
  const invalidRequest = {
    email: 'not-an-email',
    password: '123'
  };
  const { error } = loginRequestSchema.validate(invalidRequest);
  expect(error).toBeDefined();
});

// Пример теста на валидацию ответа на вход в систему

test('Valid login response should pass validation', () => {
  const validResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    user: {
      id: 'user123',
      email: 'user@example.com',
      role: 'user'
    }
  };
  const { error } = loginResponseSchema.validate(validResponse);
  expect(error).toBeUndefined();
});

test('Invalid login response should fail validation', () => {
  const invalidResponse = {
    token: 12345,
    user: 'not-an-object'
  };
  const { error } = loginResponseSchema.validate(invalidResponse);
  expect(error).toBeDefined();
});

