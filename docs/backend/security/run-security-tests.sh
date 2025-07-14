#!/bin/bash

# Security Testing Script
# This script runs all security tests including OWASP ZAP scanning

echo "================================"
echo "Starting Security Test Suite"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if npm audit is available
echo -e "${YELLOW}Running npm audit to check dependencies...${NC}"
cd ../../../ # Go to backend root
npm audit --production

# Save audit report
npm audit --json > src/__tests__/security/npm-audit-report.json

# Run Jest security tests
echo -e "\n${YELLOW}Running Jest security tests...${NC}"
npm test -- src/__tests__/security/ --coverage --coverageDirectory=./src/__tests__/security/coverage

# Check if OWASP ZAP is installed
if command -v zap.sh &> /dev/null || command -v zap.bat &> /dev/null; then
    echo -e "\n${YELLOW}Starting OWASP ZAP scan...${NC}"
    
    # Start the application if not running
    if ! curl -s http://localhost:3000/api/health > /dev/null; then
        echo "Starting application for security scanning..."
        npm start &
        APP_PID=$!
        
        # Wait for app to start
        sleep 10
    fi
    
    # Run ZAP scan
    if command -v zap.sh &> /dev/null; then
        zap.sh -cmd -autorun src/__tests__/security/zap-config.yaml
    else
        zap.bat -cmd -autorun src/__tests__/security/zap-config.yaml
    fi
    
    # Stop the application if we started it
    if [ ! -z "$APP_PID" ]; then
        kill $APP_PID
    fi
else
    echo -e "${RED}OWASP ZAP not found. Please install it for automated security scanning.${NC}"
    echo "Download from: https://www.zaproxy.org/download/"
fi

# Generate summary report
echo -e "\n${YELLOW}Generating security test summary...${NC}"

cat > src/__tests__/security/security-test-summary.md << EOF
# Security Test Summary

Generated on: $(date)

## NPM Audit Results
$(npm audit --production 2>&1 | grep -E "found|vulnerabilities")

## Jest Security Tests
- SQL Injection Tests: src/__tests__/security/sql-injection.test.ts
- XSS Tests: src/__tests__/security/xss.test.ts
- CSRF Tests: src/__tests__/security/csrf.test.ts
- Rate Limiting Tests: src/__tests__/security/rate-limiting.test.ts
- JWT/Auth Tests: src/__tests__/security/jwt-refresh.test.ts
- Access Control Tests: src/__tests__/security/protected-resources.test.ts

## OWASP ZAP Scan
Check security-reports/ZAP-Report.html for detailed results

## Recommendations
1. Fix all high and critical vulnerabilities found by npm audit
2. Review and fix any failing security tests
3. Address issues found by OWASP ZAP scan
4. Regularly update dependencies
5. Implement security headers
6. Enable HTTPS in production
7. Use environment variables for sensitive data
8. Implement proper logging and monitoring
EOF

echo -e "\n${GREEN}Security testing completed!${NC}"
echo "Check the following files for results:"
echo "- npm-audit-report.json"
echo "- coverage/lcov-report/index.html"
echo "- security-reports/ZAP-Report.html"
echo "- security-test-summary.md"
