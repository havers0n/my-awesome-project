#!/usr/bin/env node

/**
 * Automatic Import Migration Script
 * Migrates old UI component imports to new Atomic Design structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Migration mappings
const IMPORT_MIGRATIONS = {
  // Old UI components to new atoms
  "from '../ui/button/Button'": "from '../atoms/Button'",
  "from '../../ui/button/Button'": "from '../../atoms/Button'",
  "from '../../../ui/button/Button'": "from '../../../atoms/Button'",
  "from '@/components/ui/button/Button'": "from '@/components/atoms/Button'",
  
  "from '../ui/badge/Badge'": "from '../atoms/Badge'",
  "from '../../ui/badge/Badge'": "from '../../atoms/Badge'",
  "from '../../../ui/badge/Badge'": "from '../../../atoms/Badge'",
  "from '@/components/ui/badge/Badge'": "from '@/components/atoms/Badge'",
  
  // Common components to atoms
  "from '../common/Card'": "from '../atoms/Card'",
  "from '../../common/Card'": "from '../../atoms/Card'",
  "from '../../../common/Card'": "from '../../../atoms/Card'",
  "from '@/components/common/Card'": "from '@/components/atoms/Card'",
  
  // Add more mappings as needed
};

// Component name mappings (if component names changed)
const COMPONENT_MIGRATIONS = {
  // Add any component name changes here
  // 'OldComponentName': 'NewComponentName'
};

/**
 * Recursively find all TypeScript/JavaScript files
 */
function findSourceFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
          traverse(fullPath);
        }
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

/**
 * Migrate imports in a single file
 */
function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Apply import migrations
  for (const [oldImport, newImport] of Object.entries(IMPORT_MIGRATIONS)) {
    if (content.includes(oldImport)) {
      content = content.replace(new RegExp(oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newImport);
      hasChanges = true;
      console.log(`  ✅ Migrated import: ${oldImport} → ${newImport}`);
    }
  }
  
  // Apply component name migrations
  for (const [oldName, newName] of Object.entries(COMPONENT_MIGRATIONS)) {
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newName);
      hasChanges = true;
      console.log(`  ✅ Migrated component: ${oldName} → ${newName}`);
    }
  }
  
  // Write back if changes were made
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

/**
 * Main migration function
 */
function runMigration() {
  console.log('🚀 Starting Atomic Design import migration...\n');
  
  const frontendDir = path.join(__dirname, '../frontend/src');
  
  if (!fs.existsSync(frontendDir)) {
    console.error('❌ Frontend src directory not found:', frontendDir);
    process.exit(1);
  }
  
  const sourceFiles = findSourceFiles(frontendDir);
  console.log(`📁 Found ${sourceFiles.length} source files to check\n`);
  
  let migratedFiles = 0;
  let totalMigrations = 0;
  
  for (const filePath of sourceFiles) {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`🔍 Checking: ${relativePath}`);
    
    if (migrateFile(filePath)) {
      migratedFiles++;
      totalMigrations++;
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`  • Files checked: ${sourceFiles.length}`);
  console.log(`  • Files migrated: ${migratedFiles}`);
  console.log(`  • Total migrations: ${totalMigrations}`);
  
  if (migratedFiles > 0) {
    console.log('\n✅ Migration completed successfully!');
    console.log('💡 Tip: Run your tests to ensure everything still works');
  } else {
    console.log('\n✨ No migrations needed - all imports are up to date!');
  }
}

// Run the migration
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, migrateFile }; 