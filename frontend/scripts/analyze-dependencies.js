#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, '../src');

// Определяем слои в порядке иерархии (от верхнего к нижнему)
const layers = ['app', 'processes', 'pages', 'widgets', 'features', 'entities', 'shared'];

// Разрешенные импорты для каждого слоя
const allowedImports = {
  app: ['processes', 'pages', 'widgets', 'features', 'entities', 'shared'],
  processes: ['pages', 'widgets', 'features', 'entities', 'shared'],
  pages: ['widgets', 'features', 'entities', 'shared'],
  widgets: ['features', 'entities', 'shared'],
  features: ['entities', 'shared'],
  entities: ['shared'],
  shared: []
};

class DependencyAnalyzer {
  constructor() {
    this.violations = [];
    this.dependencies = new Map();
    this.circularDeps = [];
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const imports = this.extractImports(content);
      const currentLayer = this.getLayer(filePath);
      
      if (!currentLayer) return;

      for (const importPath of imports) {
        const importedLayer = this.getLayerFromImport(importPath);
        if (importedLayer) {
          this.checkViolation(currentLayer, importedLayer, filePath, importPath);
          this.trackDependency(currentLayer, importedLayer);
        }
      }
    } catch (error) {
      console.error(`Error analyzing ${filePath}:`, error.message);
    }
  }

  extractImports(content) {
    const imports = [];
    
    // Регулярные выражения для различных типов импортов
    const importRegexes = [
      /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g,
      /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
      /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g
    ];

    importRegexes.forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    });

    return imports;
  }

  getLayer(filePath) {
    const relativePath = path.relative(srcPath, filePath);
    const parts = relativePath.split(path.sep);
    
    if (parts.length > 0 && layers.includes(parts[0])) {
      return parts[0];
    }
    
    return null;
  }

  getLayerFromImport(importPath) {
    // Проверяем алиасы
    if (importPath.startsWith('@app/')) return 'app';
    if (importPath.startsWith('@processes/')) return 'processes';
    if (importPath.startsWith('@pages/')) return 'pages';
    if (importPath.startsWith('@widgets/')) return 'widgets';
    if (importPath.startsWith('@features/')) return 'features';
    if (importPath.startsWith('@entities/')) return 'entities';
    if (importPath.startsWith('@shared/')) return 'shared';
    
    // Проверяем относительные пути
    const parts = importPath.split('/');
    for (const part of parts) {
      if (layers.includes(part)) {
        return part;
      }
    }
    
    return null;
  }

  checkViolation(currentLayer, importedLayer, filePath, importPath) {
    const allowed = allowedImports[currentLayer] || [];
    
    if (!allowed.includes(importedLayer)) {
      this.violations.push({
        type: 'LAYER_VIOLATION',
        currentLayer,
        importedLayer,
        filePath,
        importPath,
        message: `Layer "${currentLayer}" cannot import from "${importedLayer}"`
      });
    }
  }

  trackDependency(from, to) {
    if (!this.dependencies.has(from)) {
      this.dependencies.set(from, new Set());
    }
    this.dependencies.get(from).add(to);
  }

  checkCircularDependencies() {
    const visited = new Set();
    const stack = new Set();
    
    const dfs = (layer, path) => {
      if (stack.has(layer)) {
        // Найдена циклическая зависимость
        const cyclePath = [...path, layer];
        const startIndex = cyclePath.indexOf(layer);
        const cycle = cyclePath.slice(startIndex);
        this.circularDeps.push(cycle);
        return;
      }
      
      if (visited.has(layer)) return;
      
      visited.add(layer);
      stack.add(layer);
      
      const deps = this.dependencies.get(layer) || new Set();
      for (const dep of deps) {
        dfs(dep, [...path, layer]);
      }
      
      stack.delete(layer);
    };
    
    for (const layer of layers) {
      if (!visited.has(layer)) {
        dfs(layer, []);
      }
    }
  }

  scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        this.analyzeFile(filePath);
      }
    }
  }

  generateReport() {
    console.log('🔍 АНАЛИЗ ЗАВИСИМОСТЕЙ Feature-Sliced Design');
    console.log('='.repeat(60));
    
    // Проверяем циклические зависимости
    this.checkCircularDependencies();
    
    // Отчет о нарушениях слоев
    if (this.violations.length > 0) {
      console.log('\n❌ НАРУШЕНИЯ АРХИТЕКТУРЫ:');
      console.log('-'.repeat(40));
      
      // Группируем по типу нарушения
      const grouped = this.violations.reduce((acc, violation) => {
        const key = `${violation.currentLayer} → ${violation.importedLayer}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(violation);
        return acc;
      }, {});
      
      Object.entries(grouped).forEach(([key, violations]) => {
        console.log(`\n📍 ${key} (${violations.length} случаев):`);
        violations.slice(0, 5).forEach(v => {
          console.log(`   ${path.relative(srcPath, v.filePath)}`);
          console.log(`   └─ ${v.importPath}`);
        });
        if (violations.length > 5) {
          console.log(`   ... и еще ${violations.length - 5} случаев`);
        }
      });
    } else {
      console.log('\n✅ АРХИТЕКТУРА СОБЛЮДЕНА');
      console.log('Все импорты между слоями корректны');
    }
    
    // Отчет о циклических зависимостях
    if (this.circularDeps.length > 0) {
      console.log('\n❌ ЦИКЛИЧЕСКИЕ ЗАВИСИМОСТИ:');
      console.log('-'.repeat(40));
      this.circularDeps.forEach((cycle, index) => {
        console.log(`\n${index + 1}. ${cycle.join(' → ')}`);
      });
    } else {
      console.log('\n✅ ЦИКЛИЧЕСКИЕ ЗАВИСИМОСТИ НЕ НАЙДЕНЫ');
    }
    
    // Статистика по слоям
    console.log('\n📊 СТАТИСТИКА ПО СЛОЯМ:');
    console.log('-'.repeat(40));
    
    layers.forEach(layer => {
      const layerPath = path.join(srcPath, layer);
      if (fs.existsSync(layerPath)) {
        const fileCount = this.countFiles(layerPath);
        const deps = this.dependencies.get(layer) || new Set();
        console.log(`${layer.padEnd(12)} | ${fileCount.toString().padStart(3)} файлов | зависимости: ${[...deps].join(', ') || 'нет'}`);
      }
    });
    
    // Публичные API
    console.log('\n📋 ПУБЛИЧНЫЕ API:');
    console.log('-'.repeat(40));
    this.checkPublicAPIs();
    
    console.log('\n' + '='.repeat(60));
    
    return {
      violations: this.violations.length,
      circularDeps: this.circularDeps.length,
      passed: this.violations.length === 0 && this.circularDeps.length === 0
    };
  }

  countFiles(dir) {
    let count = 0;
    
    const scan = (currentDir) => {
      const files = fs.readdirSync(currentDir);
      for (const file of files) {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          scan(filePath);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          count++;
        }
      }
    };
    
    if (fs.existsSync(dir)) {
      scan(dir);
    }
    
    return count;
  }

  checkPublicAPIs() {
    layers.forEach(layer => {
      const layerPath = path.join(srcPath, layer);
      const indexPath = path.join(layerPath, 'index.ts');
      
      if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        const exportCount = (content.match(/export/g) || []).length;
        console.log(`${layer.padEnd(12)} | index.ts найден | ${exportCount} экспортов`);
      } else if (fs.existsSync(layerPath)) {
        console.log(`${layer.padEnd(12)} | ⚠️  index.ts отсутствует`);
      }
    });
  }

  run() {
    console.log('Запуск анализа зависимостей...\n');
    
    if (!fs.existsSync(srcPath)) {
      console.error('❌ Директория src не найдена');
      return false;
    }
    
    this.scanDirectory(srcPath);
    const result = this.generateReport();
    
    return result.passed;
  }
}

// Запуск анализа
const analyzer = new DependencyAnalyzer();
const passed = analyzer.run();

process.exit(passed ? 0 : 1);
