import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from './Badge';

describe('Atom: Badge', () => {
  it('renders the badge with its children', () => {
    render(<Badge>New</Badge>);
    const badgeElement = screen.getByText(/new/i);
    expect(badgeElement).toBeInTheDocument();
  });

  it('applies default variant classes when no variant is provided', () => {
    render(<Badge>Default</Badge>);
    const badgeElement = screen.getByText(/default/i);
    // Based on cva default variant: 'bg-primary'
    expect(badgeElement.className).toContain('bg-primary');
  });

  it('applies destructive variant classes when variant is "destructive"', () => {
    render(<Badge variant="destructive">Destructive</Badge>);
    const badgeElement = screen.getByText(/destructive/i);
    // Based on cva destructive variant: 'bg-destructive'
    expect(badgeElement.className).toContain('bg-destructive');
  });

  it('applies secondary variant classes when variant is "secondary"', () => {
    render(<Badge variant="secondary">Secondary</Badge>);
    const badgeElement = screen.getByText(/secondary/i);
    // Based on cva secondary variant: 'bg-secondary'
    expect(badgeElement.className).toContain('bg-secondary');
  });

  it('applies outline variant classes when variant is "outline"', () => {
    render(<Badge variant="outline">Outline</Badge>);
    const badgeElement = screen.getByText(/outline/i);
    // Based on cva outline variant: 'text-foreground' and no bg color
    expect(badgeElement.className).toContain('text-foreground');
    expect(badgeElement.className).not.toContain('bg-primary');
  });
}); 