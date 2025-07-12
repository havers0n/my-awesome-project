import { test, expect, chromium } from '@playwright/test';
import { playAudit } from 'playwright-lighthouse';
import { join } from 'path';

// Пороговые значения для метрик производительности
const thresholds = {
  performance: 85,
  accessibility: 90,
  'best-practices': 85,
  seo: 90,
  pwa: 80
};

test.describe('Тесты производительности с Lighthouse', () => {
  test('Производительность главной страницы', async ({ page, browserName }) => {
    // Lighthouse работает только с Chromium
    test.skip(browserName !== 'chromium', 'Lighthouse тесты только для Chromium');
    
    await page.goto('/');
    
    // Запускаем Lighthouse аудит
    const result = await playAudit({
      page,
      thresholds,
      port: 9222,
      reports: {
        formats: {
          html: true,
          json: true
        },
        name: 'lighthouse-report-homepage',
        directory: 'test-results/lighthouse'
      }
    });
    
    // Проверяем результаты
    expect(result.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(thresholds.performance);
    expect(result.lhr.categories.accessibility.score * 100).toBeGreaterThanOrEqual(thresholds.accessibility);
    expect(result.lhr.categories['best-practices'].score * 100).toBeGreaterThanOrEqual(thresholds['best-practices']);
    expect(result.lhr.categories.seo.score * 100).toBeGreaterThanOrEqual(thresholds.seo);
  });
  
  test('Производительность страницы прогноза продаж', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Lighthouse тесты только для Chromium');
    
    await page.goto('/sales-forecast');
    
    const result = await playAudit({
      page,
      thresholds: {
        performance: 80, // Немного ниже из-за графиков
        accessibility: 90,
        'best-practices': 85,
        seo: 85
      },
      port: 9222,
      reports: {
        formats: { html: true },
        name: 'lighthouse-report-forecast',
        directory: 'test-results/lighthouse'
      }
    });
    
    // Дополнительные проверки для страницы с графиками
    const metrics = result.lhr.audits;
    
    // First Contentful Paint должен быть менее 2 секунд
    expect(metrics['first-contentful-paint'].numericValue).toBeLessThan(2000);
    
    // Largest Contentful Paint должен быть менее 3 секунд
    expect(metrics['largest-contentful-paint'].numericValue).toBeLessThan(3000);
    
    // Total Blocking Time должно быть менее 300ms
    expect(metrics['total-blocking-time'].numericValue).toBeLessThan(300);
  });
  
  test('Производительность на мобильных устройствах', async ({ browserName }) => {
    test.skip(browserName !== 'chromium', 'Lighthouse тесты только для Chromium');
    
    // Создаем новый браузер с мобильной эмуляцией
    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    const page = await context.newPage();
    
    await page.goto('http://localhost:5174/dashboard');
    
    const result = await playAudit({
      page,
      thresholds: {
        performance: 75, // Ниже для мобильных
        accessibility: 90,
        'best-practices': 85,
        seo: 90,
        pwa: 70
      },
      port: 9222,
      reports: {
        formats: { html: true },
        name: 'lighthouse-report-mobile',
        directory: 'test-results/lighthouse'
      }
    });
    
    // Проверяем мобильную производительность
    expect(result.lhr.categories.performance.score * 100).toBeGreaterThanOrEqual(75);
    
    // Проверяем viewport meta tag
    expect(result.lhr.audits['viewport'].score).toBe(1);
    
    // Проверяем размер текста
    expect(result.lhr.audits['font-size'].score).toBe(1);
    
    await browser.close();
  });
});

test.describe('Детальные метрики производительности', () => {
  test('Core Web Vitals', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Собираем метрики производительности
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Ждем загрузки страницы
        if (document.readyState === 'complete') {
          collectMetrics();
        } else {
          window.addEventListener('load', collectMetrics);
        }
        
        function collectMetrics() {
          const paint = performance.getEntriesByType('paint');
          const navigation = performance.getEntriesByType('navigation')[0];
          
          // Получаем LCP
          let lcp = 0;
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Получаем CLS
          let cls = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });
          
          // Получаем FID (приблизительно через TBT)
          let tbt = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                tbt += entry.duration - 50;
              }
            }
          }).observe({ entryTypes: ['longtask'] });
          
          setTimeout(() => {
            resolve({
              fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
              lcp: lcp,
              cls: cls,
              tbt: tbt,
              ttfb: navigation.responseStart - navigation.requestStart,
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              loadComplete: navigation.loadEventEnd - navigation.loadEventStart
            });
          }, 3000); // Даем время для сбора всех метрик
        }
      });
    });
    
    // Проверяем Core Web Vitals
    expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s (хорошо)
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s (хорошо)
    expect(metrics.cls).toBeLessThan(0.1);  // CLS < 0.1 (хорошо)
    expect(metrics.tbt).toBeLessThan(300);  // TBT < 300ms (хорошо)
    expect(metrics.ttfb).toBeLessThan(600); // TTFB < 600ms
  });
  
  test('Размер бандла и ресурсов', async ({ page }) => {
    const resourceSizes = {
      js: 0,
      css: 0,
      images: 0,
      fonts: 0,
      total: 0
    };
    
    // Отслеживаем все загружаемые ресурсы
    page.on('response', response => {
      const url = response.url();
      const size = Number(response.headers()['content-length'] || 0);
      
      if (url.endsWith('.js') || url.includes('.js?')) {
        resourceSizes.js += size;
      } else if (url.endsWith('.css') || url.includes('.css?')) {
        resourceSizes.css += size;
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)/i)) {
        resourceSizes.images += size;
      } else if (url.match(/\.(woff|woff2|ttf|otf)/i)) {
        resourceSizes.fonts += size;
      }
      
      resourceSizes.total += size;
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Проверяем размеры ресурсов (в байтах)
    expect(resourceSizes.js).toBeLessThan(500 * 1024);     // JS < 500KB
    expect(resourceSizes.css).toBeLessThan(100 * 1024);    // CSS < 100KB
    expect(resourceSizes.total).toBeLessThan(2 * 1024 * 1024); // Total < 2MB
    
    // Проверяем количество запросов
    const requests = await page.evaluate(() => performance.getEntriesByType('resource').length);
    expect(requests).toBeLessThan(50); // Менее 50 запросов
  });
  
  test('Кэширование и оптимизация', async ({ page }) => {
    // Первый визит
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Собираем информацию о кэшировании
    const cacheableResources = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource');
      return resources.filter(resource => {
        // Проверяем, что ресурс кэшируемый (по типу)
        return resource.name.match(/\.(js|css|jpg|jpeg|png|gif|webp|woff|woff2)/i);
      }).length;
    });
    
    // Второй визит (проверяем работу кэша)
    const cachedResponses = [];
    page.on('response', response => {
      if (response.status() === 304 || response.fromCache()) {
        cachedResponses.push(response.url());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что хотя бы 50% ресурсов взяты из кэша
    expect(cachedResponses.length).toBeGreaterThan(cacheableResources * 0.5);
  });
  
  test('Производительность анимаций', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Измеряем FPS во время анимаций
    const fps = await page.evaluate(async () => {
      let frames = 0;
      let lastTime = performance.now();
      const fpsValues = [];
      
      function measureFPS() {
        frames++;
        const currentTime = performance.now();
        
        if (currentTime >= lastTime + 1000) {
          const currentFPS = Math.round((frames * 1000) / (currentTime - lastTime));
          fpsValues.push(currentFPS);
          frames = 0;
          lastTime = currentTime;
        }
        
        if (fpsValues.length < 5) {
          requestAnimationFrame(measureFPS);
        }
      }
      
      // Запускаем измерение
      requestAnimationFrame(measureFPS);
      
      // Симулируем взаимодействие для запуска анимаций
      const buttons = document.querySelectorAll('button');
      buttons.forEach(btn => {
        btn.dispatchEvent(new MouseEvent('mouseenter'));
        btn.dispatchEvent(new MouseEvent('mouseleave'));
      });
      
      // Ждем завершения измерений
      await new Promise(resolve => setTimeout(resolve, 6000));
      
      return fpsValues;
    });
    
    // Проверяем, что средний FPS выше 30
    const avgFPS = fps.reduce((a, b) => a + b, 0) / fps.length;
    expect(avgFPS).toBeGreaterThan(30);
  });
  
  test('Время до интерактивности (TTI)', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/sales-forecast');
    
    // Ждем, пока страница станет интерактивной
    await page.waitForLoadState('networkidle');
    
    // Проверяем, что основные элементы интерактивны
    const inputField = page.locator('input[type="number"]').first();
    await inputField.waitFor({ state: 'visible' });
    await inputField.fill('7');
    
    const button = page.getByRole('button', { name: /предсказать|прогноз/i });
    await button.waitFor({ state: 'visible' });
    await expect(button).toBeEnabled();
    
    const tti = Date.now() - startTime;
    
    // TTI должно быть менее 3.8 секунд для хорошей производительности
    expect(tti).toBeLessThan(3800);
  });
});

test.describe('Оптимизация для медленных сетей', () => {
  test('Производительность на 3G', async ({ page, context }) => {
    // Эмулируем медленную 3G сеть
    await context.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Добавляем задержку
    });
    
    const startTime = Date.now();
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    const loadTime = Date.now() - startTime;
    
    // На медленной сети допускаем больше времени, но все равно должно быть разумно
    expect(loadTime).toBeLessThan(10000); // 10 секунд
    
    // Проверяем наличие индикаторов загрузки
    const loadingIndicators = await page.locator('.skeleton, .loading, .spinner').count();
    expect(loadingIndicators).toBeGreaterThan(0);
  });
  
  test('Progressive Web App функции', async ({ page }) => {
    await page.goto('/');
    
    // Проверяем наличие Service Worker
    const hasServiceWorker = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(hasServiceWorker).toBe(true);
    
    // Проверяем манифест
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link ? link.getAttribute('href') : null;
    });
    expect(manifest).toBeTruthy();
    
    // Проверяем offline функциональность
    await context.setOffline(true);
    await page.reload();
    
    // Страница должна показать offline страницу или кэшированный контент
    const offlineContent = await page.locator('text=/offline|нет соединения/i').count();
    const cachedContent = await page.locator('[data-testid="main-content"]').count();
    
    expect(offlineContent + cachedContent).toBeGreaterThan(0);
    
    await context.setOffline(false);
  });
});
