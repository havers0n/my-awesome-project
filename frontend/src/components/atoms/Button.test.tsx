import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Atom: Button', () => {
  it('renders the button with children', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('calls the onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button when the disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    expect(buttonElement).toBeDisabled();
  });

  it('does not call onClick handler when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click Me
      </Button>
    );
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(buttonElement);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies default variant and size classes when no props are provided', () => {
    render(<Button>Default Button</Button>);
    const buttonElement = screen.getByRole('button', { name: /default button/i });
    // Based on cva defaults: 'bg-primary' for variant and 'h-10' for size
    expect(buttonElement.className).toContain('bg-primary');
    expect(buttonElement.className).toContain('h-10');
  });

  it('applies specified variant and size classes', () => {
    render(
      <Button variant="secondary" size="lg">
        Custom Button
      </Button>
    );
    const buttonElement = screen.getByRole('button', { name: /custom button/i });
    // Based on cva: 'bg-secondary' for variant and 'h-11' for size
    expect(buttonElement.className).toContain('bg-secondary');
    expect(buttonElement.className).toContain('h-11');
  });
}); 