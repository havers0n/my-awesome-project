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

// Функция для добавления экспорта по умолчанию
function addDefaultExport(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Ищем именованные экспорты без экспорта по умолчанию
  const namedExportMatch = content.match(/export\s*\{\s*([^}]+)\s*\}\s*;?\s*$/m);
  const hasDefaultExport = content.includes('export default');
  
  if (namedExportMatch && !hasDefaultExport) {
    const exportedNames = namedExportMatch[1].split(',').map(name => name.trim());
    const mainComponent = exportedNames[0]; // Берем первый экспорт как основной
    
    // Добавляем экспорт по умолчанию
    newContent = content.replace(
      namedExportMatch[0],
      namedExportMatch[0] + '\nexport default ' + mainComponent + ';'
    );
  }
  
  // Записываем изменения только если что-то изменилось
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Добавлен default export в: ${filePath}`);
    return true;
  }
  
  return false;
}

// Главная функция
function main() {
  const srcDir = path.join(__dirname, 'src/shared/ui/atoms');
  const extensions = ['.tsx'];
  
  console.log('Поиск файлов компонентов...');
  const files = findFiles(srcDir, extensions);
  
  let fixedCount = 0;
  for (const file of files) {
    if (addDefaultExport(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nДобавлен default export в ${fixedCount} из ${files.length} файлов`);
  console.log('Готово!');
}

main();
