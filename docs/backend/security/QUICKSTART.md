# Security Testing Quick Start Guide

## Prerequisites

1. Node.js 18+ installed
2. npm or yarn package manager
3. OWASP ZAP (optional, for automated scanning)

## Running Security Tests

### 1. Quick Test (Windows PowerShell)
```powershell
cd backend
.\src\__tests__\security\run-security-tests.ps1
```

### 2. Quick Test (Linux/macOS)
```bash
cd backend
chmod +x src/__tests__/security/run-security-tests.sh
./src/__tests__/security/run-security-tests.sh
```

### 3. Individual Test Suites

From the `backend` directory:

```bash
# SQL Injection tests
npm test -- src/__tests__/security/sql-injection.test.ts

# XSS tests
npm test -- src/__tests__/security/xss.test.ts

# CSRF tests
npm test -- src/__tests__/security/csrf.test.ts

# Rate limiting tests
npm test -- src/__tests__/security/rate-limiting.test.ts

# JWT and refresh token tests
npm test -- src/__tests__/security/jwt-refresh.test.ts

# Access control tests
npm test -- src/__tests__/security/protected-resources.test.ts

# Integration tests
npm test -- src/__tests__/security/integration.test.ts
```

### 4. Run All Security Tests
```bash
npm test -- src/__tests__/security/
```

### 5. Check Dependencies
```bash
npm audit
npm audit fix  # Auto-fix vulnerabilities
```

## Test Results

After running tests, check:

1. **Console output** - Immediate test results
2. **coverage/lcov-report/index.html** - Code coverage report
3. **security-test-summary.md** - Summary of all security tests
4. **npm-audit-report.json** - Dependency vulnerability report
5. **security-reports/** - OWASP ZAP scan results (if run)

## Common Issues

### Tests Failing
- Ensure all dependencies are installed: `npm install`
- Check environment variables in `.env.test`
- Verify database connection

### OWASP ZAP Not Found
- Download from: https://www.zaproxy.org/download/
- Add to system PATH or specify full path in scripts

### Permission Denied (Linux/macOS)
```bash
chmod +x src/__tests__/security/run-security-tests.sh
```

## CI/CD Integration

Tests are automatically run on:
- Every push to main/develop branches
- Every pull request
- Daily at 2 AM UTC (scheduled)

Check `.github/workflows/security-tests.yml` for configuration.

## Next Steps

1. Review failing tests and fix vulnerabilities
2. Add custom security tests for your specific endpoints
3. Configure OWASP ZAP for deeper scanning
4. Set up monitoring for production
