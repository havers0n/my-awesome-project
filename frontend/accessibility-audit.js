import { chromium } from 'playwright';
import { AxePuppeteer } from '@axe-core/puppeteer';
import puppeteer from 'puppeteer';
import lighthouse from 'lighthouse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5175';

const PAGES_TO_TEST = [
  { name: 'Dashboard', url: `${BASE_URL}/` },
  { name: 'Calendar', url: `${BASE_URL}/calendar` },
  { name: 'Profile', url: `${BASE_URL}/profile` },
  { name: 'Form Elements', url: `${BASE_URL}/form-elements` },
  { name: 'Basic Tables', url: `${BASE_URL}/basic-tables` },
];

async function runAxeAudit() {
  console.log('🚀 Starting Axe-core accessibility audit...\n');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const results = [];
  
  for (const testPage of PAGES_TO_TEST) {
    console.log(`Testing ${testPage.name}: ${testPage.url}`);
    
    try {
      await page.goto(testPage.url, { waitUntil: 'networkidle0' });
      
      // Wait for sidebar and main content to load
      await page.waitForSelector('aside', { timeout: 5000 });
      await page.waitForTimeout(2000);
      
      const axe = new AxePuppeteer(page);
      const axeResults = await axe.analyze();
      
      results.push({
        page: testPage.name,
        url: testPage.url,
        violations: axeResults.violations,
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.length,
        inapplicable: axeResults.inapplicable.length
      });
      
      console.log(`  ✅ ${axeResults.passes.length} tests passed`);
      console.log(`  ❌ ${axeResults.violations.length} violations found`);
      console.log(`  ⚠️  ${axeResults.incomplete.length} incomplete tests`);
      
    } catch (error) {
      console.log(`  ❌ Error testing ${testPage.name}: ${error.message}`);
      results.push({
        page: testPage.name,
        url: testPage.url,
        error: error.message
      });
    }
    
    console.log('');
  }
  
  await browser.close();
  
  // Save detailed results
  fs.writeFileSync(
    path.join(__dirname, 'accessibility-report-axe.json'),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

async function runLighthouseAudit() {
  console.log('🚀 Starting Lighthouse accessibility audit...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const results = [];
  
  for (const testPage of PAGES_TO_TEST) {
    console.log(`Testing ${testPage.name}: ${testPage.url}`);
    
    try {
      const { port } = new URL(browser.wsEndpoint());
      const lighthouseResults = await lighthouse(testPage.url, {
        port: port,
        onlyCategories: ['accessibility'],
        settings: {
          formFactor: 'desktop',
          throttling: {
            rttMs: 40,
            throughputKbps: 10240,
            cpuSlowdownMultiplier: 1,
            requestLatencyMs: 0,
            downloadThroughputKbps: 0,
            uploadThroughputKbps: 0
          }
        }
      });
      
      const accessibility = lighthouseResults.lhr.categories.accessibility;
      
      results.push({
        page: testPage.name,
        url: testPage.url,
        score: Math.round(accessibility.score * 100),
        audits: lighthouseResults.lhr.audits
      });
      
      console.log(`  Score: ${Math.round(accessibility.score * 100)}/100`);
      
    } catch (error) {
      console.log(`  ❌ Error testing ${testPage.name}: ${error.message}`);
      results.push({
        page: testPage.name,
        url: testPage.url,
        error: error.message
      });
    }
    
    console.log('');
  }
  
  await browser.close();
  
  // Save detailed results
  fs.writeFileSync(
    path.join(__dirname, 'accessibility-report-lighthouse.json'),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

async function generateSummaryReport(axeResults, lighthouseResults) {
  const summary = {
    timestamp: new Date().toISOString(),
    axe: {
      totalViolations: axeResults.reduce((sum, page) => sum + (page.violations?.length || 0), 0),
      totalPasses: axeResults.reduce((sum, page) => sum + (page.passes || 0), 0),
      pageResults: axeResults.map(page => ({
        page: page.page,
        violations: page.violations?.length || 0,
        passes: page.passes || 0
      }))
    },
    lighthouse: {
      averageScore: Math.round(
        lighthouseResults.reduce((sum, page) => sum + (page.score || 0), 0) / lighthouseResults.length
      ),
      pageResults: lighthouseResults.map(page => ({
        page: page.page,
        score: page.score || 0
      }))
    }
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'accessibility-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('📊 Accessibility Audit Summary');
  console.log('================================');
  console.log(`Axe-core: ${summary.axe.totalViolations} violations, ${summary.axe.totalPasses} passes`);
  console.log(`Lighthouse: Average score ${summary.lighthouse.averageScore}/100`);
  console.log('\nDetailed reports saved:');
  console.log('- accessibility-report-axe.json');
  console.log('- accessibility-report-lighthouse.json');
  console.log('- accessibility-summary.json');
}

async function main() {
  try {
    const axeResults = await runAxeAudit();
    const lighthouseResults = await runLighthouseAudit();
    await generateSummaryReport(axeResults, lighthouseResults);
  } catch (error) {
    console.error('Error running accessibility audit:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runAxeAudit, runLighthouseAudit };
