import { User } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

export class UserFactory {
  static async build(overrides: Partial<User> = {}): Promise<Partial<User>> {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    return {
      email: faker.internet.email(),
      password: hashedPassword,
      name: faker.person.fullName(),
      role: 'USER',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  }

  static async buildAdmin(overrides: Partial<User> = {}): Promise<Partial<User>> {
    return UserFactory.build({
      role: 'ADMIN',
      ...overrides,
    });
  }

  static async buildMany(count: number, overrides: Partial<User> = {}): Promise<Partial<User>[]> {
    return Promise.all(
      Array.from({ length: count }, () => UserFactory.build(overrides))
    );
  }
}
