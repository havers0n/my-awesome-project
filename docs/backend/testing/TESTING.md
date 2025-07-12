# Testing Guide

## Overview

This project uses a comprehensive testing strategy with unit, integration, and E2E tests. All tests are run automatically in CI/CD pipeline using GitHub Actions.

## Test Structure

```
src/
├── __tests__/
│   ├── unit/          # Unit tests
│   ├── integration/   # Integration tests
│   └── e2e/          # End-to-end tests
├── test/
│   ├── factories/     # Test data factories
│   ├── fixtures/      # Static test data
│   ├── utils/         # Test utilities
│   └── setup files    # Jest setup configurations
└── seeds/
    └── test/         # Test database seeds
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests
```bash
npm run test:unit
npm run test:unit:coverage  # with coverage
```

### Integration Tests
```bash
npm run test:integration
npm run test:integration:coverage  # with coverage
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:coverage  # with coverage
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Environment Setup

1. **Database**: Tests use a separate PostgreSQL database (`test_db`)
2. **Environment**: Configure `.env.test` file
3. **Seeds**: Test data is automatically seeded before E2E tests

### Local Setup

1. Create test database:
```bash
createdb test_db
```

2. Run migrations:
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/test_db npm run db:migrate
```

3. Seed test data (optional):
```bash
npm run db:seed:test
```

## Writing Tests

### Unit Tests

Unit tests focus on individual functions and classes in isolation.

```typescript
import { calculateTotal } from '@/utils/order';

describe('calculateTotal', () => {
  it('should calculate order total correctly', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 3 }
    ];
    
    expect(calculateTotal(items)).toBe(35);
  });
});
```

### Integration Tests

Integration tests verify interactions between different parts of the system.

```typescript
import { prisma } from '@/test/setup.integration';
import { UserService } from '@/services/user.service';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(prisma);
  });

  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    const user = await userService.create(userData);
    
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userData.email);
  });
});
```

### E2E Tests

E2E tests verify complete user workflows through the API.

```typescript
import { request, getAuthToken } from '@/test/setup.e2e';

describe('Auth Flow', () => {
  it('should complete registration and login flow', async () => {
    // Register
    const registerRes = await request
      .post('/api/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      });

    expect(registerRes.status).toBe(201);

    // Login
    const loginRes = await request
      .post('/api/auth/login')
      .send({
        email: 'newuser@example.com',
        password: 'password123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
  });
});
```

## Test Data Management

### Factories

Use factories to generate test data dynamically:

```typescript
import { UserFactory } from '@/test/factories/user.factory';

const user = await UserFactory.build({ role: 'ADMIN' });
const users = await UserFactory.buildMany(5);
```

### Fixtures

Use fixtures for static test data:

```typescript
import { testUsers, testProducts } from '@/test/fixtures/common.fixtures';

const adminUser = testUsers.admin;
const laptop = testProducts.laptop;
```

### Database Utilities

```typescript
import { TestDatabase } from '@/test/utils/database';

// Clean database
await TestDatabase.clean();

// Seed specific data
await TestDatabase.seed({
  users: [userData],
  products: [productData]
});
```

## Coverage Requirements

- **Global**: 80% minimum coverage for all metrics
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Coverage reports are generated in the `coverage/` directory and uploaded to Codecov in CI.

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests

The CI pipeline runs tests in parallel:
1. Linting and type checking
2. Unit tests
3. Integration tests (with PostgreSQL and Redis services)
4. E2E tests

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Mocking**: Mock external services in unit tests
4. **Descriptive**: Use clear test descriptions
5. **Fast**: Keep tests fast and focused
6. **Deterministic**: Tests should produce consistent results

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env.test`
- Verify database exists: `psql -d test_db`

### Test Timeout
- Increase timeout for slow tests: `jest.setTimeout(30000)`
- Check for unresolved promises
- Ensure proper cleanup in `afterAll` hooks

### Coverage Issues
- Run `npm run test:coverage` to see detailed report
- Check `jest.config.js` for coverage configuration
- Ensure new files are not in coverage ignore list
