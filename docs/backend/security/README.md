# Security Testing Suite

This directory contains comprehensive security tests for the application API.

## Test Coverage

### 1. SQL Injection Tests (`sql-injection.test.ts`)
- Tests for SQL injection vulnerabilities in all API endpoints
- Validates proper parameterized queries usage
- Checks input sanitization
- Tests various SQL injection patterns

### 2. XSS Tests (`xss.test.ts`)
- Cross-Site Scripting vulnerability tests
- Input sanitization validation
- Output encoding checks
- Tests for reflected, stored, and DOM-based XSS

### 3. CSRF Protection Tests (`csrf.test.ts`)
- CSRF token generation and validation
- Double-submit cookie pattern verification
- Origin and referer header validation
- Token expiration and regeneration

### 4. Rate Limiting Tests (`rate-limiting.test.ts`)
- API endpoint rate limiting
- Authentication endpoint brute-force protection
- IP-based and user-based limiting
- Custom limits for different user roles

### 5. JWT & Authentication Tests (`jwt-refresh.test.ts`)
- JWT token generation and validation
- Refresh token mechanism
- Token expiration handling
- Secure token storage

### 6. Access Control Tests (`protected-resources.test.ts`)
- Role-based access control (RBAC)
- Resource ownership validation
- Permission-based access
- Protection against IDOR vulnerabilities

## Running Security Tests

### Quick Start

**Windows (PowerShell):**
```powershell
.\run-security-tests.ps1
```

**Linux/Mac:**
```bash
chmod +x run-security-tests.sh
./run-security-tests.sh
```

### Individual Test Suites

Run specific test files:
```bash
# From backend directory
npm test -- src/__tests__/security/sql-injection.test.ts
npm test -- src/__tests__/security/xss.test.ts
npm test -- src/__tests__/security/csrf.test.ts
npm test -- src/__tests__/security/rate-limiting.test.ts
npm test -- src/__tests__/security/jwt-refresh.test.ts
npm test -- src/__tests__/security/protected-resources.test.ts
```

Run all security tests:
```bash
npm test -- src/__tests__/security/
```

### NPM Audit

Check for vulnerable dependencies:
```bash
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

### OWASP ZAP Scanning

1. Install OWASP ZAP from https://www.zaproxy.org/download/
2. Configure the scan using `zap-config.yaml`
3. Run automated scan:
   ```bash
   zap.sh -cmd -autorun zap-config.yaml
   # or on Windows
   zap.bat -cmd -autorun zap-config.yaml
   ```

## Security Test Configuration

### Environment Variables

Create a `.env.test` file in the backend directory:
```env
NODE_ENV=test
JWT_SECRET=test-secret-key
REFRESH_TOKEN_SECRET=test-refresh-secret
CSRF_SECRET=test-csrf-secret
DATABASE_URL=sqlite::memory:
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Test Database

Tests use an in-memory SQLite database by default. For testing with a real database:

```env
DATABASE_URL=postgres://user:password@localhost:5432/test_db
```

## Interpreting Results

### Jest Test Results
- ✅ Green tests: Security measures are properly implemented
- ❌ Red tests: Potential vulnerabilities detected
- ⚠️ Skipped tests: May need configuration or dependencies

### NPM Audit Results
- **Critical**: Fix immediately
- **High**: Fix as soon as possible
- **Moderate**: Fix in next release
- **Low**: Review and fix if needed

### OWASP ZAP Results
- **High Risk**: Critical vulnerabilities requiring immediate attention
- **Medium Risk**: Should be addressed before production
- **Low Risk**: Best practices violations
- **Informational**: Suggestions for improvement

## Best Practices

1. **Run tests regularly**: Include in CI/CD pipeline
2. **Keep dependencies updated**: Regular npm audit and updates
3. **Test in staging**: Run full security suite before production deployments
4. **Monitor production**: Implement runtime security monitoring
5. **Security headers**: Ensure all security headers are properly set
6. **Input validation**: Validate all user inputs on both client and server
7. **Output encoding**: Properly encode all outputs
8. **Authentication**: Use secure session management and strong passwords
9. **Authorization**: Implement principle of least privilege
10. **Logging**: Log security events for monitoring and analysis

## Continuous Integration

Add to your CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run Security Tests
  run: |
    npm audit --production
    npm test -- src/__tests__/security/ --coverage
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    directory: ./src/__tests__/security/coverage
```

## Troubleshooting

### Common Issues

1. **Tests failing due to missing dependencies**
   ```bash
   npm install --save-dev @types/jest supertest
   ```

2. **OWASP ZAP not found**
   - Download and install from official website
   - Add to system PATH

3. **Rate limit tests failing**
   - Ensure Redis or memory store is configured
   - Check rate limit configurations

4. **Database connection issues**
   - Verify DATABASE_URL in test environment
   - Ensure test database is accessible

## Contributing

When adding new security tests:
1. Follow existing test patterns
2. Document test purpose and coverage
3. Include both positive and negative test cases
4. Test edge cases and boundary conditions
5. Update this README with new test information

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [npm Security](https://docs.npmjs.com/auditing-package-dependencies-for-security-vulnerabilities)
