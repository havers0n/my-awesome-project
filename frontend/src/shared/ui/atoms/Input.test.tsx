import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./Input";

describe('Atom: Input', () => {
  it('renders the input element', () => {
    render(<Input data-testid="test-input" />);
    const inputElement = screen.getByTestId('test-input');
    expect(inputElement).toBeInTheDocument();
  });

  it('calls the onChange handler when text is entered', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} data-testid="test-input" />);
    const inputElement = screen.getByTestId('test-input');
    fireEvent.change(inputElement, { target: { value: 'testing' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('disables the input when the disabled prop is true', () => {
    render(<Input disabled data-testid="test-input" />);
    const inputElement = screen.getByTestId('test-input');
    expect(inputElement).toBeDisabled();
  });

  it('applies the error variant class when variant is error', () => {
    render(<Input variant="error" data-testid="test-input" />);
    const inputElement = screen.getByTestId('test-input');
    // From cva variant: 'border-destructive'
    expect(inputElement.className).toContain('border-destructive');
  });

  it('renders with a placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    const inputElement = screen.getByPlaceholderText(/enter your name/i);
    expect(inputElement).toBeInTheDocument();
  });
}); 