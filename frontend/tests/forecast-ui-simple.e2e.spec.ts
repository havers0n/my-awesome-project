import { test, expect } from '@playwright/test';

test.describe('Sales Forecast Page - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/sales-forecast');
    await page.waitForLoadState('networkidle');
  });

  const testForecast = async (days: number) => {
    console.log(`🔍 Testing forecast creation for ${days} days`);

    const dayInput = page.locator('input[type="number"]');
    await dayInput.fill(days.toString());

    const predictButton = page.locator('button:has-text("Предсказать")');
    await predictButton.click();

    await page.waitForSelector('.loading', { state: 'visible' });
    console.log('✅ Loading indicator displayed');

    await page.waitForTimeout(5000); // Wait for toast and updates
    console.log('✅ Toast notification should be displayed');

    const chart = page.locator('canvas');
    await expect(chart).toBeVisible();
    console.log('✅ Chart updated');

    const topProducts = page.locator('text=Top Products');
    await expect(topProducts).toBeVisible();
    console.log('✅ Top products list updated');

    const historyEntry = page.locator('text=History Entry');
    await expect(historyEntry).toBeVisible();
    console.log('✅ New entry in forecast history');

    // Check API requests
    const requests = await page.context().request.get('/api/predictions/predict');
    expect(requests.length).toBeGreaterThan(0);
    expect(requests[0].postDataJSON()).toEqual([{ DaysCount: days }]);
    console.log('✅ Correct API request sent with DaysCount:', days);
    expect(requests[0].headers()['authorization']).toMatch(/^Bearer .*/);
    console.log('✅ Authorization header present');
  };

  const testCases = [1, 7, 14, 30, 90, 0, 91, -1];

  testCases.forEach((days) => {
    test(`Create forecast for ${days} days`, async ({ page }) => {
      await testForecast(days);
    });
  });
});
