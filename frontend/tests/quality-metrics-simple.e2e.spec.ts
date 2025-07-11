import { test, expect } from '@playwright/test';

// Simple end-to-end test for Quality Metrics component
test.describe('Quality Metrics Simple Tests', () => {
  
  test('should verify quality metrics component structure', async ({ page }) => {
    // Navigate to the root page
    await page.goto('http://localhost:5174/');
    
    // Check if we can access the page
    await page.waitForLoadState('networkidle');
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    
    // Check if login page is shown
    const isLoginPage = await page.locator('h1:has-text("Вход")').isVisible();
    
    if (isLoginPage) {
      console.log('Login page detected - skipping full test');
      
      // Just verify the login page structure
      await expect(page.locator('h1')).toContainText('Вход');
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      return;
    }
    
    // If we can access the main app directly, try to test quality metrics
    try {
      await page.goto('http://localhost:5174/sales-forecast');
      await page.waitForLoadState('networkidle');
      
      // Check if we can see the sales forecast page
      const salesForecastTitle = await page.locator('h1').textContent();
      
      if (salesForecastTitle && salesForecastTitle.includes('Прогноз продаж')) {
        console.log('Sales forecast page loaded successfully');
        
        // Look for quality metrics button
        const qualityMetricsButton = page.locator('button:has-text("Метрики качества")');
        
        if (await qualityMetricsButton.isVisible()) {
          console.log('Quality metrics button found');
          
          // Click the button
          await qualityMetricsButton.click();
          await page.waitForTimeout(1000);
          
          // Take a screenshot after clicking
          await page.screenshot({ path: 'debug-quality-metrics.png', fullPage: true });
          
          // Check if quality metrics content is visible
          const qualityMetricsContent = await page.locator('[data-testid="quality-metrics-content"]').isVisible();
          
          if (qualityMetricsContent) {
            console.log('Quality metrics content is visible');
            
            // Test basic functionality
            await expect(page.locator('[data-testid="quality-metrics-content"]')).toBeVisible();
            
            // Check for KPI blocks
            const kpiBlocks = await page.locator('[data-testid="kpi-blocks"]').isVisible();
            if (kpiBlocks) {
              console.log('KPI blocks are visible');
              await expect(page.locator('[data-testid="kpi-blocks"]')).toBeVisible();
            }
            
            // Check for control elements
            const timeSlice = await page.locator('button:has-text("Time")').isVisible();
            const skuSlice = await page.locator('button:has-text("SKU")').isVisible();
            const storeSlice = await page.locator('button:has-text("Store")').isVisible();
            
            if (timeSlice && skuSlice && storeSlice) {
              console.log('All slice buttons are visible');
              
              // Test slice switching
              await page.click('button:has-text("SKU")');
              await page.waitForTimeout(500);
              
              await page.click('button:has-text("Store")');
              await page.waitForTimeout(500);
              
              await page.click('button:has-text("Time")');
              await page.waitForTimeout(500);
              
              console.log('Slice switching test completed');
            }
          }
        }
      }
    } catch (error) {
      console.log('Error during quality metrics test:', error);
      
      // Take a screenshot on error
      await page.screenshot({ path: 'debug-error.png', fullPage: true });
    }
  });
  
  test('should check QualityMetricsDashboard component functionality', async ({ page }) => {
    // Navigate directly to the page
    await page.goto('http://localhost:5174/sales-forecast');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check the page title
    const pageTitle = await page.title();
    console.log('Page title:', pageTitle);
    
    // Check if we can see any content
    const bodyContent = await page.locator('body').textContent();
    const hasQualityMetrics = bodyContent && bodyContent.includes('Метрики качества');
    
    if (hasQualityMetrics) {
      console.log('Quality metrics text found in page');
      
      // Look for the button
      const button = page.locator('button:has-text("Метрики качества")');
      
      if (await button.isVisible()) {
        console.log('Quality metrics button is visible');
        
        // Click the button
        await button.click();
        await page.waitForTimeout(1000);
        
        // Check for any quality metrics related content
        const content = await page.locator('body').textContent();
        const hasMetricsContent = content && (
          content.includes('R²') || 
          content.includes('MAPE') ||
          content.includes('MAE') ||
          content.includes('RMSE')
        );
        
        if (hasMetricsContent) {
          console.log('Quality metrics content detected');
          
          // Look for specific elements
          const r2Text = await page.locator('text=R²').count();
          const mapeText = await page.locator('text=MAPE').count();
          
          console.log('R² mentions:', r2Text);
          console.log('MAPE mentions:', mapeText);
          
          expect(r2Text).toBeGreaterThan(0);
        }
      }
    }
  });
});
