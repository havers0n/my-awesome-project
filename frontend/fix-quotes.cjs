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

// Функция для исправления кавычек в файле
function fixQuotes(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  // Исправляем двойные кавычки в конце импортов
  newContent = newContent.replace(/from\s+['"]([^'"]*)['"]\s*['"]\s*;/g, 'from "$1";');
  
  // Исправляем двойные кавычки в начале импортов
  newContent = newContent.replace(/from\s+['"]["]/g, 'from "');
  
  // Исправляем неправильные кавычки в конце строк
  newContent = newContent.replace(/['"]\s*['"]\s*;/g, '";');
  
  // Исправляем импорты со смешанными кавычками
  newContent = newContent.replace(/from\s+['"]([^'"]*)['"]\s*['"]/g, 'from "$1"');
  
  // Исправляем неправильные кавычки в присваиваниях
  newContent = newContent.replace(/=\s*['"]\s*;/g, '= "";');
  
  // Исправляем неправильные кавычки в логических операторах
  newContent = newContent.replace(/\|\|\s*['"]\s*;/g, '|| "";');
  
  // Исправляем неправильные return
  newContent = newContent.replace(/return\s+['"]\s*;/g, 'return "";');
  
  // Исправляем неправильные кавычки в switch default
  newContent = newContent.replace(/default:\s*return\s+['"]\s*;/g, 'default:\n          return "";');
  
  // Исправляем неправильные кавычки в других местах
  newContent = newContent.replace(/\s+['"]\s*;/g, ' "";');
  
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
    if (fixQuotes(file)) {
      fixedCount++;
    }
  }
  
  console.log(`\nИсправлено файлов: ${fixedCount} из ${files.length}`);
  console.log('Готово!');
}

main();
