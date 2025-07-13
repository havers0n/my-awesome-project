const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Setup Chromatic for visual regression testing
 */
async function setupChromatic() {
  console.log('🎨 Setting up Chromatic for visual regression testing...');
  
  try {
    // Install chromatic if not present
    try {
      execSync('npx chromatic --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('📦 Installing Chromatic...');
      execSync('npm install --save-dev chromatic', { stdio: 'inherit' });
    }
    
    // Create chromatic configuration
    const chromaticConfig = {
      projectToken: process.env.CHROMATIC_PROJECT_TOKEN || 'your-project-token',
      buildScriptName: 'build-storybook',
      onlyChanged: true,
      externals: ['public/**'],
      ignore: [
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/*.spec.{js,jsx,ts,tsx}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
        'dist/**',
        'build/**',
        'node_modules/**',
        '**/*.d.ts'
      ],
      delay: 300,
      diffThreshold: 0.2,
      threshold: 0.2,
      autoAcceptChanges: false,
      exitOnceUploaded: true,
      exitZeroOnChanges: true,
      skip: false,
      dryRun: false,
      forceRebuild: false,
      debug: false,
      diagnostics: false,
      zip: true,
      junitReport: true,
      junit: {
        outputFile: 'test-results/chromatic-junit.xml'
      },
      storybookBuildDir: 'storybook-static',
      storybookLogLevel: 'info',
      uploadMetadata: true,
      traceChanged: true,
      preserveMissing: true,
      allowConsoleErrors: false,
      interactive: false
    };
    
    // Write chromatic configuration
    const configPath = path.join(__dirname, '../chromatic.config.json');
    fs.writeFileSync(configPath, JSON.stringify(chromaticConfig, null, 2));
    
    console.log('✅ Chromatic configuration created!');
    
    // Create GitHub Action for Chromatic
    await createChromaticAction();
    
    // Create utility scripts
    await createChromaticScripts();
    
    console.log('🎉 Chromatic setup complete!');
    console.log('📝 Next steps:');
    console.log('1. Sign up at https://www.chromatic.com/');
    console.log('2. Create a new project and get your project token');
    console.log('3. Add CHROMATIC_PROJECT_TOKEN to your environment variables');
    console.log('4. Run: npm run chromatic to start visual regression testing');
    
  } catch (error) {
    console.error('❌ Error setting up Chromatic:', error.message);
    process.exit(1);
  }
}

/**
 * Create GitHub Action for Chromatic
 */
async function createChromaticAction() {
  console.log('⚙️ Creating GitHub Action for Chromatic...');
  
  const actionContent = `name: Chromatic Visual Regression Testing

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --legacy-peer-deps

      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          token: \${{ secrets.GITHUB_TOKEN }}
          projectToken: \${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: 'build-storybook'
          onlyChanged: true
          exitOnceUploaded: true
          exitZeroOnChanges: true
          ignoreLastBuildOnBranch: 'main'
          
      - name: Upload Chromatic results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: chromatic-results
          path: |
            chromatic-build-*.log
            test-results/chromatic-junit.xml
          retention-days: 30`;
  
  const actionPath = path.join(__dirname, '../.github/workflows/chromatic.yml');
  const actionDir = path.dirname(actionPath);
  
  if (!fs.existsSync(actionDir)) {
    fs.mkdirSync(actionDir, { recursive: true });
  }
  
  fs.writeFileSync(actionPath, actionContent);
  console.log('✅ GitHub Action for Chromatic created!');
}

/**
 * Create utility scripts for Chromatic
 */
async function createChromaticScripts() {
  console.log('📝 Creating Chromatic utility scripts...');
  
  // Update package.json with Chromatic scripts
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  packageJson.scripts = {
    ...packageJson.scripts,
    'chromatic': 'chromatic --exit-zero-on-changes',
    'chromatic:ci': 'chromatic --exit-zero-on-changes --only-changed',
    'chromatic:debug': 'chromatic --debug',
    'chromatic:review': 'chromatic --exit-zero-on-changes --auto-accept-changes',
    'visual-test': 'npm run chromatic',
    'visual-test:ci': 'npm run chromatic:ci'
  };
  
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  
  // Create Chromatic utility script
  const utilityScript = `#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const command = args[0];

function runChromatic(options = '') {
  try {
    const cmd = \`npx chromatic \${options}\`;
    console.log(\`Running: \${cmd}\`);
    execSync(cmd, { stdio: 'inherit' });
  } catch (error) {
    console.error('Chromatic failed:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(\`
Chromatic Visual Regression Testing Commands:

  npm run chromatic              - Run Chromatic with default settings
  npm run chromatic:ci           - Run Chromatic for CI (only changed stories)
  npm run chromatic:debug        - Run Chromatic with debug output
  npm run chromatic:review       - Run Chromatic and auto-accept changes
  npm run visual-test            - Alias for chromatic
  npm run visual-test:ci         - Alias for chromatic:ci

Environment Variables:
  CHROMATIC_PROJECT_TOKEN       - Your Chromatic project token (required)
  
For more options, visit: https://www.chromatic.com/docs/cli
\`);
}

switch (command) {
  case 'help':
  case '--help':
  case '-h':
    showHelp();
    break;
  case 'ci':
    runChromatic('--exit-zero-on-changes --only-changed');
    break;
  case 'debug':
    runChromatic('--debug');
    break;
  case 'review':
    runChromatic('--exit-zero-on-changes --auto-accept-changes');
    break;
  default:
    runChromatic('--exit-zero-on-changes');
}`;
  
  const scriptPath = path.join(__dirname, '../scripts/chromatic.js');
  fs.writeFileSync(scriptPath, utilityScript);
  
  // Make script executable on Unix systems
  if (process.platform !== 'win32') {
    fs.chmodSync(scriptPath, '755');
  }
  
  console.log('✅ Chromatic utility scripts created!');
}

// Run the setup
setupChromatic().catch(console.error);
