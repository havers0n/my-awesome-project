import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { Button } from "./Button";

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies correct variant classes', () => {
    render(<Button variant="primary">Primary</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-brand-500');
  });

  it('applies correct size classes', () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-5', 'py-3', 'text-base');
  });

  it('applies correct link variant classes', () => {
    render(<Button variant="link">Link Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('text-brand-600', 'hover:text-brand-700', 'underline-offset-4');
    expect(button).not.toHaveClass('px-4', 'py-2.5'); // Link variant should not have padding
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies fullWidth class when fullWidth is true', () => {
    render(<Button fullWidth>Full Width</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full');
  });

  it('renders start and end icons', () => {
    const startIcon = <span data-testid="start-icon">→</span>;
    const endIcon = <span data-testid="end-icon">←</span>;

    render(
      <Button startIcon={startIcon} endIcon={endIcon}>
        With Icons
      </Button>
    );

    expect(screen.getByTestId('start-icon')).toBeInTheDocument();
    expect(screen.getByTestId('end-icon')).toBeInTheDocument();
  });

  it('hides icons when loading', () => {
    const startIcon = <span data-testid="start-icon">→</span>;
    const endIcon = <span data-testid="end-icon">←</span>;

    render(
      <Button loading startIcon={startIcon} endIcon={endIcon}>
        Loading
      </Button>
    );

    expect(screen.queryByTestId('start-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('spreads additional props to button element', () => {
    render(
      <Button data-testid="custom-button" id="my-button">
        Test
      </Button>
    );
    const button = screen.getByTestId('custom-button');

    expect(button).toHaveAttribute('id', 'my-button');
  });
});
