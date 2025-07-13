# Contributing Guide

Thank you for your interest in contributing to our project! This guide will help you get started with contributing to our React component library.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Component Development](#component-development)
- [Testing](#testing)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Code Review Guidelines](#code-review-guidelines)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Git

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/project-name.git
   cd project-name
   ```

3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Start Storybook for component development:
   ```bash
   npm run storybook
   ```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all components and utilities
- Define proper interfaces for all props
- Use strict mode and enable all recommended rules
- Avoid `any` type - use proper typing

### Component Structure

Follow the Atomic Design methodology:

```
src/components/
├── atoms/           # Basic building blocks
├── molecules/       # Simple groups of atoms
├── organisms/       # Complex components
└── templates/       # Layout components
```

### Naming Conventions

- **Components**: PascalCase (`Button`, `DataTable`)
- **Files**: PascalCase for components (`Button.tsx`)
- **Props**: camelCase with descriptive names
- **Hooks**: camelCase starting with `use` (`useLocalStorage`)
- **Utilities**: camelCase (`formatDate`, `calculateTotal`)

### Code Formatting

We use Prettier for code formatting:

```bash
npm run format
```

### Linting

We use ESLint for code linting:

```bash
npm run lint
```

## Component Development

### Creating a New Component

1. Create the component directory:
   ```bash
   mkdir src/components/atoms/NewComponent
   ```

2. Create the component files:
   ```
   src/components/atoms/NewComponent/
   ├── index.ts
   ├── NewComponent.tsx
   ├── NewComponent.test.tsx
   ├── NewComponent.stories.tsx
   └── README.md
   ```

3. Component template:
   ```typescript
   import React from 'react';
   import { cn } from '@/utils/cn';

   export interface NewComponentProps {
     /**
      * The content to display
      */
     children: React.ReactNode;
     /**
      * Additional CSS classes
      */
     className?: string;
     /**
      * Component variant
      */
     variant?: 'primary' | 'secondary';
   }

   /**
    * NewComponent description
    */
   export const NewComponent: React.FC<NewComponentProps> = ({
     children,
     className,
     variant = 'primary',
     ...props
   }) => {
     return (
       <div
         className={cn(
           'base-styles',
           {
             'primary-styles': variant === 'primary',
             'secondary-styles': variant === 'secondary',
           },
           className
         )}
         {...props}
       >
         {children}
       </div>
     );
   };
   ```

4. Export from index.ts:
   ```typescript
   export { NewComponent } from './NewComponent';
   export type { NewComponentProps } from './NewComponent';
   ```

### Props Guidelines

- Use descriptive prop names
- Provide default values where appropriate
- Include JSDoc comments for all props
- Use union types for variants
- Support `className` prop for styling flexibility
- Use `...props` spread for HTML attributes

### Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper color contrast
- Support focus management

## Testing

### Unit Testing

Use React Testing Library for component testing:

```typescript
import { render, screen } from '@testing-library/react';
import { NewComponent } from './NewComponent';

describe('NewComponent', () => {
  it('renders children correctly', () => {
    render(<NewComponent>Test content</NewComponent>);
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(<NewComponent variant="secondary">Test</NewComponent>);
    expect(screen.getByText('Test')).toHaveClass('secondary-styles');
  });
});
```

### Integration Testing

Test component interactions and complex workflows:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('form submission works correctly', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  
  render(<MyForm onSubmit={onSubmit} />);
  
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(onSubmit).toHaveBeenCalledWith({ name: 'John Doe' });
});
```

### E2E Testing

Use Playwright for end-to-end testing:

```typescript
import { test, expect } from '@playwright/test';

test('user can complete workflow', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-button"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## Documentation

### Storybook Stories

Create stories for all components:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { NewComponent } from './NewComponent';

const meta: Meta<typeof NewComponent> = {
  title: 'Atoms/NewComponent',
  component: NewComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary component',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary component',
    variant: 'secondary',
  },
};
```

### Component README

Include a README.md for each component with:
- Description
- Props documentation
- Usage examples
- Accessibility notes
- Design guidelines

### JSDoc Comments

Document all props and methods:

```typescript
/**
 * Button component for user interactions
 * 
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Click me
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({ ... }) => {
  // Component implementation
};
```

## Pull Request Process

1. Create a feature branch:
   ```bash
   git checkout -b feature/new-component
   ```

2. Make your changes following the guidelines above

3. Write tests for your changes

4. Update documentation

5. Run the full test suite:
   ```bash
   npm run test
   npm run test:e2e
   npm run lint
   npm run type-check
   ```

6. Commit your changes:
   ```bash
   git commit -m "feat: add new component with accessibility support"
   ```

7. Push to your fork:
   ```bash
   git push origin feature/new-component
   ```

8. Create a Pull Request

### Commit Messages

Use conventional commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

## Code Review Guidelines

### For Authors

- Keep PRs focused and small
- Include screenshots for UI changes
- Write clear commit messages
- Update documentation
- Add tests for new features

### For Reviewers

- Check functionality and design
- Verify accessibility compliance
- Review test coverage
- Ensure code follows style guidelines
- Test the changes locally

### Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Accessibility is considered
- [ ] Performance impact is minimal
- [ ] Breaking changes are documented
- [ ] TypeScript types are correct

## Performance Guidelines

- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders
- Use lazy loading for large components
- Optimize bundle size

## Security Guidelines

- Sanitize user input
- Use TypeScript for type safety
- Avoid dangerouslySetInnerHTML
- Validate props with TypeScript
- Follow OWASP guidelines

## Questions?

If you have questions about contributing, please:

1. Check the existing documentation
2. Search existing issues
3. Create a new issue with the "question" label
4. Join our community discussions

Thank you for contributing! 🎉
