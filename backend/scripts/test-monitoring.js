const fs = require('fs');
const path = require('path');

/**
 * Скрипт для мониторинга тестов
 * Собирает метрики покрытия, времени выполнения и flaky тестов
 */

class TestMonitoring {
  constructor() {
    this.metricsDir = path.join(__dirname, '../test-metrics');
    this.coverageFile = path.join(__dirname, '../coverage/coverage-summary.json');
    this.historyFile = path.join(this.metricsDir, 'test-history.json');
    
    // Создаем директорию для метрик если не существует
    if (!fs.existsSync(this.metricsDir)) {
      fs.mkdirSync(this.metricsDir, { recursive: true });
    }
  }

  /**
   * Читает текущие метрики покрытия
   */
  getCoverageMetrics() {
    if (!fs.existsSync(this.coverageFile)) {
      console.warn('Coverage file not found. Run tests with coverage first.');
      return null;
    }

    const coverage = JSON.parse(fs.readFileSync(this.coverageFile, 'utf8'));
    const total = coverage.total;

    return {
      lines: total.lines.pct,
      statements: total.statements.pct,
      functions: total.functions.pct,
      branches: total.branches.pct,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Сохраняет метрики в историю
   */
  saveMetrics(metrics) {
    let history = [];
    
    if (fs.existsSync(this.historyFile)) {
      history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
    }

    history.push(metrics);
    
    // Сохраняем только последние 100 записей
    if (history.length > 100) {
      history = history.slice(-100);
    }

    fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
  }

  /**
   * Проверяет пороги покрытия
   */
  checkCoverageThresholds(metrics) {
    const thresholds = {
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 80
    };

    const alerts = [];

    for (const [metric, threshold] of Object.entries(thresholds)) {
      if (metrics[metric] < threshold) {
        alerts.push(`⚠️  ${metric} coverage is below threshold: ${metrics[metric]}% < ${threshold}%`);
      }
    }

    return alerts;
  }

  /**
   * Генерирует отчет
   */
  generateReport() {
    const metrics = this.getCoverageMetrics();
    
    if (!metrics) {
      return;
    }

    console.log('\\n📊 Test Coverage Report');
    console.log('======================');
    console.log(`Lines:      ${metrics.lines}%`);
    console.log(`Statements: ${metrics.statements}%`);
    console.log(`Functions:  ${metrics.functions}%`);
    console.log(`Branches:   ${metrics.branches}%`);

    // Проверяем пороги
    const alerts = this.checkCoverageThresholds(metrics);
    
    if (alerts.length > 0) {
      console.log('\\n🚨 Alerts:');
      alerts.forEach(alert => console.log(alert));
    } else {
      console.log('\\n✅ All coverage thresholds met!');
    }

    // Сохраняем метрики
    this.saveMetrics(metrics);
    
    // Генерируем HTML дашборд
    this.generateDashboard();
  }

  /**
   * Генерирует HTML дашборд
   */
  generateDashboard() {
    const history = fs.existsSync(this.historyFile) 
      ? JSON.parse(fs.readFileSync(this.historyFile, 'utf8'))
      : [];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Coverage Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .metric-card {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .metric-value {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .metric-label {
            color: #666;
            font-size: 14px;
        }
        .chart-container {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            height: 400px;
        }
        .good { color: #10b981; }
        .warning { color: #f59e0b; }
        .danger { color: #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Test Coverage Dashboard</h1>
            <p>Last updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics-grid">
            ${this.renderMetricCards(history[history.length - 1] || {})}
        </div>
        
        <div class="chart-container">
            <canvas id="coverageChart"></canvas>
        </div>
    </div>
    
    <script>
        const history = ${JSON.stringify(history)};
        
        const ctx = document.getElementById('coverageChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: history.map(h => new Date(h.timestamp).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Lines',
                        data: history.map(h => h.lines),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: 'Statements',
                        data: history.map(h => h.statements),
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    },
                    {
                        label: 'Functions',
                        data: history.map(h => h.functions),
                        borderColor: 'rgb(54, 162, 235)',
                        tension: 0.1
                    },
                    {
                        label: 'Branches',
                        data: history.map(h => h.branches),
                        borderColor: 'rgb(255, 205, 86)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    </script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(this.metricsDir, 'dashboard.html'), html);
    console.log(`\\n📈 Dashboard generated: ${path.join(this.metricsDir, 'dashboard.html')}`);
  }

  renderMetricCards(metrics) {
    const cards = ['lines', 'statements', 'functions', 'branches'];
    
    return cards.map(metric => {
      const value = metrics[metric] || 0;
      const colorClass = value >= 80 ? 'good' : value >= 60 ? 'warning' : 'danger';
      
      return `
        <div class="metric-card">
            <div class="metric-label">${metric.charAt(0).toUpperCase() + metric.slice(1)}</div>
            <div class="metric-value ${colorClass}">${value.toFixed(1)}%</div>
        </div>
      `;
    }).join('');
  }
}

// Запуск мониторинга
const monitor = new TestMonitoring();
monitor.generateReport();
