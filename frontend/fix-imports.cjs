const fs = require('fs');
const path = require('path');

// Функция для рекурсивного поиска файлов
function findFiles(dir, extensions) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findFiles(fullPath, extensions));
    } else if (extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Функция для исправления импортов в файле
function fixImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Массив замен для импортов
  const replacements = [
    // Относительные пути к компонентам
    { pattern: /from\s+['"]\.\.\/\.\.\/components\/atoms\//g, replacement: "from '@/shared/ui/atoms/" },
    { pattern: /from\s+['"]\.\.\/components\/atoms\//g, replacement: "from '@/shared/ui/atoms/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/atoms\//g, replacement: "from '@/shared/ui/atoms/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/atoms\//g, replacement: "from '@/shared/ui/atoms/" },
    
    { pattern: /from\s+['"]\.\.\/\.\.\/components\/molecules\//g, replacement: "from '@/shared/ui/molecules/" },
    { pattern: /from\s+['"]\.\.\/components\/molecules\//g, replacement: "from '@/shared/ui/molecules/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/molecules\//g, replacement: "from '@/shared/ui/molecules/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/molecules\//g, replacement: "from '@/shared/ui/molecules/" },
    
    { pattern: /from\s+['"]\.\.\/\.\.\/components\/organisms\//g, replacement: "from '@/shared/ui/organisms/" },
    { pattern: /from\s+['"]\.\.\/components\/organisms\//g, replacement: "from '@/shared/ui/organisms/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/components\/organisms\//g, replacement: "from '@/shared/ui/organisms/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/organisms\//g, replacement: "from '@/shared/ui/organisms/" },
    
    // Относительные пути к типам
    { pattern: /from\s+['"]\.\.\/\.\.\/types\//g, replacement: "from '@/shared/types/" },
    { pattern: /from\s+['"]\.\.\/types\//g, replacement: "from '@/shared/types/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/types\//g, replacement: "from '@/shared/types/" },
    
    // Относительные пути к features
    { pattern: /from\s+['"]\.\.\/\.\.\/features\//g, replacement: "from '@/features/" },
    { pattern: /from\s+['"]\.\.\/features\//g, replacement: "from '@/features/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/features\//g, replacement: "from '@/features/" },
    
    // Относительные пути к utils
    { pattern: /from\s+['"]\.\.\/\.\.\/utils\//g, replacement: "from '@/shared/lib/" },
    { pattern: /from\s+['"]\.\.\/utils\//g, replacement: "from '@/shared/lib/" },
    { pattern: /from\s+['"]\.\.\/\.\.\/\.\.\/utils\//g, replacement: "from '@/shared/lib/" },
  ];
  
  // Применяем все замены
  for (const { pattern, replacement } of replacements) {
    newContent = newContent.replace(pattern, replacement);
  }
  
  // Исправляем неправильные кавычки в конце импортов
  newContent = newContent.replace(/from\s+(['"])[^'"]*\1"\s*;/g, (match, quote) => {
    return match.replace(/"\s*;$/, '\'');
  });
  
  // Исправляем смешанные кавычки
  newContent = newContent.replace(/from\s+(['"])[^'"]*['"]\s*;/g, (match, quote) => {
    const cleanMatch = match.replace(/from\s+(['"])[^'"]*/, (m, q) => {
      const path = m.substring(5 + q.length);
      return `from ${q}${path}${q}`;
    });
    return cleanMatch;
  });
  
  // Записываем изменения только если что-то изменилось
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Исправлен файл: ${filePath}`);
    return true;
  }
  
  return false;
}

// Главная функция
function main() {
  const srcDir = path.join(__dirname, 'src');
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];
  
  console.log('Поиск файлов для исправления...');
  const files = findFiles(srcDir, extensions);
  
  let fixedCount = 0;
  for (const file of files) {
    if (fixImports(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nИсправлено файлов: ${fixedCount} из ${files.length}`);
  console.log('Готово!');
}

main();
