import { z } from 'zod';

// Example validation schema
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

describe('User Validation', () => {
  describe('userSchema', () => {
    it('should validate correct user data', () => {
      const validUser = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'USER',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it('should reject invalid email', () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['email']);
      }
    });

    it('should reject short password', () => {
      const invalidUser = {
        email: 'test@example.com',
        password: 'short',
        name: 'Test User',
      };

      const result = userSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['password']);
      }
    });

    it('should apply default role', () => {
      const userWithoutRole = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const result = userSchema.safeParse(userWithoutRole);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('USER');
      }
    });
  });
});
