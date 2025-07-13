const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate documentation from TypeScript types
 */
async function generateDocs() {
  console.log('🔍 Generating documentation from TypeScript types...');
  
  try {
    // Install typedoc if not present
    try {
      execSync('npx typedoc --version', { stdio: 'ignore' });
    } catch (error) {
      console.log('📦 Installing TypeDoc...');
      execSync('npm install --save-dev typedoc', { stdio: 'inherit' });
    }
    
    // Create typedoc configuration
    const typedocConfig = {
      entryPoints: ['src/index.ts'],
      out: 'docs/api',
      theme: 'default',
      includeVersion: true,
      excludeExternals: true,
      excludePrivate: true,
      excludeProtected: true,
      hideGenerator: true,
      sort: ['source-order'],
      kindSortOrder: [
        'Project',
        'Module',
        'Namespace',
        'Enum',
        'EnumMember',
        'Class',
        'Interface',
        'TypeAlias',
        'Constructor',
        'Property',
        'Variable',
        'Function',
        'Method',
        'Accessor',
        'Parameter',
        'TypeParameter',
        'TypeLiteral',
        'CallSignature',
        'ConstructorSignature',
        'IndexSignature',
        'GetSignature',
        'SetSignature'
      ],
      categorizeByGroup: true,
      categoryOrder: [
        'Components',
        'Atoms',
        'Molecules',
        'Organisms',
        'Templates',
        'Pages',
        'Hooks',
        'Utils',
        'Types',
        'Services',
        'Contexts',
        'Other'
      ],
      plugin: [
        'typedoc-plugin-markdown',
        'typedoc-plugin-merge-modules'
      ],
      readme: 'README.md',
      includeVersion: true,
      excludeInternal: true,
      excludePrivate: true,
      excludeProtected: true,
      excludeReferences: true,
      excludeNotDocumented: false,
      validation: {
        notExported: true,
        invalidLink: true,
        notDocumented: false
      }
    };
    
    // Write typedoc configuration
    fs.writeFileSync('typedoc.json', JSON.stringify(typedocConfig, null, 2));
    
    // Generate documentation
    execSync('npx typedoc --options typedoc.json', { stdio: 'inherit' });
    
    console.log('✅ Documentation generated successfully!');
    
    // Generate component documentation index
    await generateComponentIndex();
    
    // Generate usage examples
    await generateUsageExamples();
    
  } catch (error) {
    console.error('❌ Error generating documentation:', error.message);
    process.exit(1);
  }
}

/**
 * Generate component documentation index
 */
async function generateComponentIndex() {
  console.log('📚 Generating component documentation index...');
  
  const componentsDir = path.join(__dirname, '../src/components');
  const outputFile = path.join(__dirname, '../docs/components/README.md');
  
  // Ensure docs directory exists
  const docsDir = path.dirname(outputFile);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  
  const atomicLevels = ['atoms', 'molecules', 'organisms', 'templates'];
  let markdown = '# Component Documentation\\n\\n';
  
  markdown += '## Atomic Design Structure\\n\\n';
  markdown += 'This project follows the Atomic Design methodology:\\n\\n';
  
  for (const level of atomicLevels) {
    const levelDir = path.join(componentsDir, level);
    if (!fs.existsSync(levelDir)) continue;
    
    markdown += `### ${level.charAt(0).toUpperCase() + level.slice(1)}\\n\\n`;
    
    const components = fs.readdirSync(levelDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    for (const component of components) {
      const componentPath = path.join(levelDir, component);
      const indexFile = path.join(componentPath, 'index.ts');
      const tsxFile = path.join(componentPath, `${component}.tsx`);
      
      if (fs.existsSync(indexFile) || fs.existsSync(tsxFile)) {
        markdown += `- [${component}](./components/${level}/${component}/README.md)\\n`;
        
        // Generate individual component documentation
        await generateComponentDoc(level, component);
      }
    }
    
    markdown += '\\n';
  }
  
  // Add usage guidelines
  markdown += '## Usage Guidelines\\n\\n';
  markdown += '### Import Components\\n\\n';
  markdown += '```typescript\\n';
  markdown += 'import { Button } from "@/components/atoms/Button";\\n';
  markdown += 'import { Card } from "@/components/molecules/Card";\\n';
  markdown += '```\\n\\n';
  
  markdown += '### Props and TypeScript\\n\\n';
  markdown += 'All components are fully typed with TypeScript. Use your IDE\\'s IntelliSense to explore available props.\\n\\n';
  
  markdown += '### Storybook\\n\\n';
  markdown += 'For interactive component documentation and testing, run:\\n\\n';
  markdown += '```bash\\n';
  markdown += 'npm run storybook\\n';
  markdown += '```\\n\\n';
  
  fs.writeFileSync(outputFile, markdown);
  console.log('✅ Component documentation index generated!');
}

/**
 * Generate individual component documentation
 */
async function generateComponentDoc(level, component) {
  const componentPath = path.join(__dirname, `../src/components/${level}/${component}`);
  const outputFile = path.join(__dirname, `../docs/components/${level}/${component}/README.md`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let markdown = `# ${component}\\n\\n`;
  
  // Try to extract component information from the file
  const tsxFile = path.join(componentPath, `${component}.tsx`);
  if (fs.existsSync(tsxFile)) {
    const content = fs.readFileSync(tsxFile, 'utf8');
    
    // Extract JSDoc comments
    const jsdocRegex = /\\/\\*\\*([\\s\\S]*?)\\*\\//g;
    const jsdocMatches = content.match(jsdocRegex);
    
    if (jsdocMatches) {
      markdown += '## Description\\n\\n';
      jsdocMatches.forEach(match => {
        const cleanComment = match
          .replace(/\\/\\*\\*|\\*\\//g, '')
          .replace(/^\\s*\\*\\s?/gm, '')
          .trim();
        markdown += `${cleanComment}\\n\\n`;
      });
    }
    
    // Extract props interface
    const propsRegex = /interface\\s+(\\w*Props)\\s*{([\\s\\S]*?)}/g;
    const propsMatch = propsRegex.exec(content);
    
    if (propsMatch) {
      markdown += '## Props\\n\\n';
      markdown += '```typescript\\n';
      markdown += `interface ${propsMatch[1]} {${propsMatch[2]}}\\n`;
      markdown += '```\\n\\n';
    }
  }
  
  // Add usage example
  markdown += '## Usage\\n\\n';
  markdown += '```typescript\\n';
  markdown += `import { ${component} } from "@/components/${level}/${component}";\\n\\n`;
  markdown += `function Example() {\\n`;
  markdown += `  return (\\n`;
  markdown += `    <${component}>\\n`;
  markdown += `      Example content\\n`;
  markdown += `    </${component}>\\n`;
  markdown += `  );\\n`;
  markdown += `}\\n`;
  markdown += '```\\n\\n';
  
  // Add Storybook link
  markdown += '## Storybook\\n\\n';
  markdown += `See the [${component} stories](../../storybook/?path=/story/${level}-${component.toLowerCase()}--default) for interactive examples.\\n\\n`;
  
  fs.writeFileSync(outputFile, markdown);
}

/**
 * Generate usage examples
 */
async function generateUsageExamples() {
  console.log('📋 Generating usage examples...');
  
  const examplesDir = path.join(__dirname, '../docs/examples');
  if (!fs.existsSync(examplesDir)) {
    fs.mkdirSync(examplesDir, { recursive: true });
  }
  
  const examples = [
    {
      name: 'Getting Started',
      filename: 'getting-started.md',
      content: `# Getting Started\\n\\n## Installation\\n\\n\`\`\`bash\\nnpm install\\n\`\`\`\\n\\n## Development\\n\\n\`\`\`bash\\nnpm run dev\\n\`\`\`\\n\\n## Testing\\n\\n\`\`\`bash\\nnpm run test\\n\`\`\`\\n\\n## Storybook\\n\\n\`\`\`bash\\nnpm run storybook\\n\`\`\`\\n\\n## Building\\n\\n\`\`\`bash\\nnpm run build\\n\`\`\`\\n`
    },
    {
      name: 'Component Usage',
      filename: 'component-usage.md',
      content: `# Component Usage Examples\\n\\n## Atomic Design Pattern\\n\\n### Atoms\\n\\n\`\`\`typescript\\nimport { Button } from "@/components/atoms/Button";\\n\\n<Button variant="primary" size="lg">\\n  Click me\\n</Button>\\n\`\`\`\\n\\n### Molecules\\n\\n\`\`\`typescript\\nimport { Card } from "@/components/molecules/Card";\\n\\n<Card>\\n  <Card.Header>\\n    <Card.Title>Card Title</Card.Title>\\n  </Card.Header>\\n  <Card.Content>\\n    Card content goes here\\n  </Card.Content>\\n</Card>\\n\`\`\`\\n\\n### Organisms\\n\\n\`\`\`typescript\\nimport { DataTable } from "@/components/organisms/DataTable";\\n\\n<DataTable\\n  data={data}\\n  columns={columns}\\n  onRowClick={handleRowClick}\\n/>\\n\`\`\`\\n`
    },
    {
      name: 'Testing Guide',
      filename: 'testing-guide.md',
      content: `# Testing Guide\\n\\n## Unit Testing\\n\\n\`\`\`typescript\\nimport { render, screen } from "@testing-library/react";\\nimport { Button } from "@/components/atoms/Button";\\n\\ntest("renders button with text", () => {\\n  render(<Button>Click me</Button>);\\n  expect(screen.getByText("Click me")).toBeInTheDocument();\\n});\\n\`\`\`\\n\\n## Integration Testing\\n\\n\`\`\`typescript\\nimport { render, screen, fireEvent } from "@testing-library/react";\\nimport { Form } from "@/components/organisms/Form";\\n\\ntest("submits form with correct data", async () => {\\n  const onSubmit = jest.fn();\\n  render(<Form onSubmit={onSubmit} />);\\n  \\n  fireEvent.click(screen.getByText("Submit"));\\n  \\n  expect(onSubmit).toHaveBeenCalledWith(expectedData);\\n});\\n\`\`\`\\n\\n## E2E Testing\\n\\n\`\`\`typescript\\nimport { test, expect } from "@playwright/test";\\n\\ntest("user can complete workflow", async ({ page }) => {\\n  await page.goto("/");\\n  await page.click("[data-testid=start-button]");\\n  await expect(page).toHaveURL("/dashboard");\\n});\\n\`\`\`\\n`
    }
  ];
  
  for (const example of examples) {
    const filePath = path.join(examplesDir, example.filename);
    fs.writeFileSync(filePath, example.content);
  }
  
  console.log('✅ Usage examples generated!');
}

// Run the documentation generation
generateDocs().catch(console.error);
