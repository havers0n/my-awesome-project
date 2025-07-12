import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced E2E testing configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  
  /* Параллельное выполнение тестов для ускорения */
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4, // Увеличиваем количество воркеров
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  
  /* Максимальное время выполнения теста */
  timeout: 60 * 1000, // 60 секунд
  
  /* Reporter configuration */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/test-results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
  ],
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:5174',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Настройки для медленных сетей и устройств */
    viewport: { width: 1280, height: 720 },
    actionTimeout: 30 * 1000,
    navigationTimeout: 30 * 1000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Сохраняем состояние авторизации
        storageState: 'tests/.auth/user.json',
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        storageState: 'tests/.auth/user.json',
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        storageState: 'tests/.auth/user.json',
      },
    },

    /* Мобильная адаптивность */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'tests/.auth/user.json',
      },
    },
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        storageState: 'tests/.auth/user.json',
      },
    },
    {
      name: 'Tablet',
      use: {
        ...devices['iPad'],
        storageState: 'tests/.auth/user.json',
      },
    },

    /* Тесты производительности */
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--enable-blink-features=InterestCohort'],
        },
      },
    },
    
    /* Setup project для авторизации */
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  /* Папка для артефактов тестов */
  outputDir: 'test-results/',
});
