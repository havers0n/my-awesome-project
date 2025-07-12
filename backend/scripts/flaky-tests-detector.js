const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Детектор flaky тестов
 * Запускает тесты несколько раз и выявляет нестабильные
 */
class FlakyTestsDetector {
  constructor(options = {}) {
    this.iterations = options.iterations || 5;
    this.testCommand = options.testCommand || 'npm test';
    this.resultsDir = path.join(__dirname, '../test-metrics/flaky-tests');
    this.reportFile = path.join(this.resultsDir, 'flaky-tests-report.json');
    
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Запускает тесты заданное количество раз
   */
  async runTests() {
    const results = [];
    console.log(`🔄 Running tests ${this.iterations} times to detect flaky tests...`);

    for (let i = 1; i <= this.iterations; i++) {
      console.log(`\\nIteration ${i}/${this.iterations}`);
      
      try {
        const output = execSync(this.testCommand, { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        const testResults = this.parseTestResults(output);
        results.push({
          iteration: i,
          success: true,
          tests: testResults
        });
      } catch (error) {
        const testResults = this.parseTestResults(error.stdout || '');
        results.push({
          iteration: i,
          success: false,
          tests: testResults,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Парсит результаты тестов из вывода Jest
   */
  parseTestResults(output) {
    const testResults = [];
    const lines = output.split('\\n');
    
    // Простой парсер для Jest output
    let currentSuite = '';
    
    lines.forEach(line => {
      // Обнаружение test suite
      if (line.includes('PASS') || line.includes('FAIL')) {
        const match = line.match(/(PASS|FAIL)\\s+(.+)/);
        if (match) {
          currentSuite = match[2].trim();
        }
      }
      
      // Обнаружение отдельных тестов
      if (line.trim().startsWith('✓') || line.trim().startsWith('✕')) {
        const passed = line.trim().startsWith('✓');
        const testName = line.replace(/^\\s*[✓✕]\\s*/, '').trim();
        
        testResults.push({
          suite: currentSuite,
          name: testName,
          passed: passed
        });
      }
    });
    
    return testResults;
  }

  /**
   * Анализирует результаты и находит flaky тесты
   */
  analyzeFlakyTests(results) {
    const testMap = new Map();
    
    // Собираем все результаты для каждого теста
    results.forEach(run => {
      run.tests.forEach(test => {
        const key = `${test.suite}::${test.name}`;
        if (!testMap.has(key)) {
          testMap.set(key, []);
        }
        testMap.get(key).push(test.passed);
      });
    });
    
    // Находим flaky тесты
    const flakyTests = [];
    
    testMap.forEach((results, testKey) => {
      const passCount = results.filter(r => r).length;
      const failCount = results.filter(r => !r).length;
      
      // Тест считается flaky, если он иногда проходит, а иногда нет
      if (passCount > 0 && failCount > 0) {
        const [suite, name] = testKey.split('::');
        flakyTests.push({
          suite,
          name,
          passRate: (passCount / results.length) * 100,
          passCount,
          failCount,
          totalRuns: results.length
        });
      }
    });
    
    return flakyTests;
  }

  /**
   * Генерирует отчет
   */
  generateReport(flakyTests) {
    const report = {
      timestamp: new Date().toISOString(),
      iterations: this.iterations,
      totalFlakyTests: flakyTests.length,
      tests: flakyTests.sort((a, b) => a.passRate - b.passRate)
    };
    
    // Сохраняем отчет
    fs.writeFileSync(this.reportFile, JSON.stringify(report, null, 2));
    
    // Выводим результаты в консоль
    console.log('\\n📊 Flaky Tests Report');
    console.log('=====================');
    console.log(`Total iterations: ${this.iterations}`);
    console.log(`Flaky tests found: ${flakyTests.length}`);
    
    if (flakyTests.length > 0) {
      console.log('\\n⚠️  Flaky tests detected:');
      flakyTests.forEach(test => {
        console.log(`\\n  ${test.suite} > ${test.name}`);
        console.log(`  Pass rate: ${test.passRate.toFixed(1)}% (${test.passCount}/${test.totalRuns})`);
      });
      
      // Создаем HTML отчет
      this.generateHTMLReport(report);
    } else {
      console.log('\\n✅ No flaky tests detected!');
    }
    
    return report;
  }

  /**
   * Генерирует HTML отчет
   */
  generateHTMLReport(report) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flaky Tests Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .summary {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .test-list {
            margin-top: 20px;
        }
        .test-item {
            border: 1px solid #e0e0e0;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 4px;
            background-color: #fff;
        }
        .test-name {
            font-weight: bold;
            color: #333;
        }
        .test-suite {
            color: #666;
            font-size: 14px;
        }
        .pass-rate {
            float: right;
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
        }
        .pass-rate.high { background-color: #d4edda; color: #155724; }
        .pass-rate.medium { background-color: #fff3cd; color: #856404; }
        .pass-rate.low { background-color: #f8d7da; color: #721c24; }
        .no-flaky {
            text-align: center;
            padding: 40px;
            color: #28a745;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Flaky Tests Report</h1>
        <div class="summary">
            <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
            <p><strong>Test iterations:</strong> ${report.iterations}</p>
            <p><strong>Flaky tests found:</strong> ${report.totalFlakyTests}</p>
        </div>
        
        ${report.totalFlakyTests > 0 ? `
            <div class="test-list">
                <h2>Flaky Tests</h2>
                ${report.tests.map(test => `
                    <div class="test-item">
                        <div class="pass-rate ${
                            test.passRate >= 70 ? 'high' : 
                            test.passRate >= 40 ? 'medium' : 'low'
                        }">
                            ${test.passRate.toFixed(1)}% pass rate
                        </div>
                        <div class="test-name">${test.name}</div>
                        <div class="test-suite">${test.suite}</div>
                        <div style="clear: both; margin-top: 10px; color: #666; font-size: 14px;">
                            Passed: ${test.passCount}/${test.totalRuns} runs
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : `
            <div class="no-flaky">
                ✅ No flaky tests detected!
            </div>
        `}
    </div>
</body>
</html>
    `;
    
    const htmlPath = path.join(this.resultsDir, 'flaky-tests-report.html');
    fs.writeFileSync(htmlPath, html);
    console.log(`\\n📄 HTML report generated: ${htmlPath}`);
  }

  /**
   * Основной метод запуска
   */
  async run() {
    try {
      const results = await this.runTests();
      const flakyTests = this.analyzeFlakyTests(results);
      return this.generateReport(flakyTests);
    } catch (error) {
      console.error('Error detecting flaky tests:', error);
      throw error;
    }
  }
}

// Запуск детектора
if (require.main === module) {
  const detector = new FlakyTestsDetector({
    iterations: process.env.FLAKY_TEST_ITERATIONS || 5,
    testCommand: process.env.FLAKY_TEST_COMMAND || 'npm test -- --silent'
  });
  
  detector.run().catch(console.error);
}

module.exports = FlakyTestsDetector;
