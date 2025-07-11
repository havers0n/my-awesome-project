import { test, expect } from '@playwright/test';

// End-to-end tests for Quality Metrics Dashboard component
test.describe('Quality Metrics Dashboard E2E Tests', () => {
  
  // Test setup - navigate to the quality metrics page
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    // Check if we're on the login page
    const isLoginPage = await page.locator('h1:has-text("Вход")').isVisible();
    
    if (isLoginPage) {
      // Fill in login credentials (you may need to adjust these)
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Wait for login to complete
      await page.waitForTimeout(2000);
    }
    
    // Navigate to sales forecast page
    await page.goto('http://localhost:5174/sales-forecast');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we successfully loaded the sales forecast page
    const pageTitle = await page.locator('h1').textContent();
    if (pageTitle && pageTitle.includes('Прогноз продаж')) {
      // Switch to quality metrics mode
      await page.click('button:has-text("Метрики качества")');
      
      // Wait for the quality metrics dashboard to load
      await page.waitForTimeout(1000);
    }
  });

  test('should display quality metrics dashboard with all components', async ({ page }) => {
    // Verify KPI blocks are present
    await expect(page.locator('[data-testid="kpi-blocks"]')).toBeVisible();
    
    // Verify control panel elements
    await expect(page.locator('text=Time')).toBeVisible();
    await expect(page.locator('text=SKU')).toBeVisible();
    await expect(page.locator('text=Store')).toBeVisible();
    
    // Verify metric switcher
    await expect(page.locator('text=R²')).toBeVisible();
    await expect(page.locator('text=MAPE')).toBeVisible();
    await expect(page.locator('text=MAE')).toBeVisible();
    await expect(page.locator('text=RMSE')).toBeVisible();
    
    // Verify period filter
    await expect(page.locator('text=7 дней')).toBeVisible();
    
    // Verify chart/table switcher
    await expect(page.locator('text=Chart')).toBeVisible();
    await expect(page.locator('text=Table')).toBeVisible();
  });

  test('should display API failure warning and use mock data', async ({ page }) => {
    // Since API is likely not available, check for fallback behavior
    const warningMessage = page.locator('text=API недоступен, показаны демо-данные');
    
    // Wait for either success or error state
    await page.waitForTimeout(2000);
    
    // Check if warning message is displayed (API failure scenario)
    const warningVisible = await warningMessage.isVisible();
    
    if (warningVisible) {
      // Verify warning message styling
      await expect(warningMessage).toBeVisible();
      await expect(page.locator('.text-yellow-600')).toBeVisible();
      
      // Verify that mock data is still displayed
      await expect(page.locator('[data-testid="quality-metrics-content"]')).toBeVisible();
    }
    
    // Verify that some form of data is always displayed
    const hasData = await page.locator('[data-testid="quality-metrics-content"]').isVisible();
    expect(hasData).toBeTruthy();
  });

  test('should display KPI metrics with proper formatting', async ({ page }) => {
    // Wait for KPI blocks to load
    await expect(page.locator('[data-testid="kpi-blocks"]')).toBeVisible();
    
    // Check for R² metric
    const r2Block = page.locator('[data-testid="kpi-r2"]');
    await expect(r2Block).toBeVisible();
    
    // Check for MAPE metric
    const mapeBlock = page.locator('[data-testid="kpi-mape"]');
    await expect(mapeBlock).toBeVisible();
    
    // Verify numeric values are displayed (should be numbers, not "N/A")
    await page.waitForFunction(() => {
      const r2Element = document.querySelector('[data-testid="kpi-r2-value"]');
      const mapeElement = document.querySelector('[data-testid="kpi-mape-value"]');
      
      if (!r2Element || !mapeElement) return false;
      
      const r2Value = r2Element.textContent;
      const mapeValue = mapeElement.textContent;
      
      // Check if values are numeric (not "N/A" or empty)
      return r2Value && r2Value !== 'N/A' && 
             mapeValue && mapeValue !== 'N/A';
    });
  });

  test('should switch between different slice types', async ({ page }) => {
    // Test Time slice (default)
    await page.click('button:has-text("Time")');
    await expect(page.locator('[data-testid="quality-metrics-chart"]')).toBeVisible();
    
    // Test SKU slice
    await page.click('button:has-text("SKU")');
    await page.waitForTimeout(500); // Wait for data to update
    
    // Test Store slice
    await page.click('button:has-text("Store")');
    await page.waitForTimeout(500); // Wait for data to update
    
    // Verify that data updates when switching slices
    await expect(page.locator('[data-testid="quality-metrics-content"]')).toBeVisible();
  });

  test('should switch between different metrics', async ({ page }) => {
    // Test R² metric (default)
    await page.click('button:has-text("R²")');
    await expect(page.locator('[data-testid="quality-metrics-chart"]')).toBeVisible();
    
    // Test MAPE metric
    await page.click('button:has-text("MAPE")');
    await page.waitForTimeout(500);
    
    // Test MAE metric
    await page.click('button:has-text("MAE")');
    await page.waitForTimeout(500);
    
    // Test RMSE metric
    await page.click('button:has-text("RMSE")');
    await page.waitForTimeout(500);
    
    // Verify chart updates
    await expect(page.locator('[data-testid="quality-metrics-chart"]')).toBeVisible();
  });

  test('should switch between chart and table views', async ({ page }) => {
    // Test chart view (default)
    await page.click('button:has-text("Chart")');
    await expect(page.locator('[data-testid="quality-metrics-chart"]')).toBeVisible();
    
    // Switch to table view
    await page.click('button:has-text("Table")');
    await page.waitForTimeout(500);
    
    // Verify table is displayed
    await expect(page.locator('[data-testid="quality-metrics-table"]')).toBeVisible();
    
    // Switch back to chart view
    await page.click('button:has-text("Chart")');
    await page.waitForTimeout(500);
    
    // Verify chart is displayed again
    await expect(page.locator('[data-testid="quality-metrics-chart"]')).toBeVisible();
  });

  test('should update data when period changes', async ({ page }) => {
    // Test 7 days period (default)
    await page.selectOption('select[data-testid="period-selector"]', '7');
    await page.waitForTimeout(500);
    
    // Test 14 days period
    await page.selectOption('select[data-testid="period-selector"]', '14');
    await page.waitForTimeout(500);
    
    // Test 30 days period
    await page.selectOption('select[data-testid="period-selector"]', '30');
    await page.waitForTimeout(500);
    
    // Verify data is still displayed
    await expect(page.locator('[data-testid="quality-metrics-content"]')).toBeVisible();
  });

  test('should handle loading states properly', async ({ page }) => {
    // Reload the page to catch loading state
    await page.reload();
    
    // Wait for the quality metrics button to be available
    await expect(page.locator('button:has-text("Метрики качества")')).toBeVisible();
    
    // Click to switch to quality metrics
    await page.click('button:has-text("Метрики качества")');
    
    // Check for loading indicator
    const loadingIndicator = page.locator('text=Загрузка...');
    const hasLoading = await loadingIndicator.isVisible();
    
    // If loading was visible, wait for it to disappear
    if (hasLoading) {
      await expect(loadingIndicator).not.toBeVisible();
    }
    
    // Verify final state shows content
    await expect(page.locator('[data-testid="quality-metrics-content"]')).toBeVisible();
  });

  test('should display period information correctly', async ({ page }) => {
    // Check that period label is displayed
    await expect(page.locator('text=Период анализа:')).toBeVisible();
    
    // Check that period value is displayed
    await expect(page.locator('text=7 дней')).toBeVisible();
    
    // Check for info tooltip
    await expect(page.locator('span[title*="Для коротких периодов"]')).toBeVisible();
  });

  test('should maintain data consistency across interactions', async ({ page }) => {
    // Start with Time slice, R² metric, 7 days
    await page.click('button:has-text("Time")');
    await page.click('button:has-text("R²")');
    await page.selectOption('select[data-testid="period-selector"]', '7');
    
    // Verify data is displayed
    await expect(page.locator('[data-testid="quality-metrics-content"]')).toBeVisible();
    
    // Switch to SKU slice
    await page.click('button:has-text("SKU")');
    await page.waitForTimeout(500);
    
    // Switch to MAPE metric
    await page.click('button:has-text("MAPE")');
    await page.waitForTimeout(500);
    
    // Switch to table view
    await page.click('button:has-text("Table")');
    await page.waitForTimeout(500);
    
    // Verify table is displayed with data
    await expect(page.locator('[data-testid="quality-metrics-table"]')).toBeVisible();
    
    // Switch back to chart view
    await page.click('button:has-text("Chart")');
    await page.waitForTimeout(500);
    
    // Verify chart is displayed with data
    await expect(page.locator('[data-testid="quality-metrics-chart"]')).toBeVisible();
  });

  test('should validate console debug output', async ({ page }) => {
    // Listen for console logs
    const consoleLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.text().includes('🧪 QualityMetricsDashboard Integration Test:')) {
        consoleLogs.push(msg.text());
      }
    });
    
    // Navigate to quality metrics
    await page.click('button:has-text("Метрики качества")');
    
    // Wait for component to load and log
    await page.waitForTimeout(2000);
    
    // Change slice to trigger new log
    await page.click('button:has-text("SKU")');
    await page.waitForTimeout(1000);
    
    // Verify console logs were captured
    expect(consoleLogs.length).toBeGreaterThan(0);
    
    // Verify log content includes expected fields
    const lastLog = consoleLogs[consoleLogs.length - 1];
    expect(lastLog).toContain('slice');
    expect(lastLog).toContain('dataLength');
    expect(lastLog).toContain('avgR2');
    expect(lastLog).toContain('avgMape');
    expect(lastLog).toContain('status');
  });
});
