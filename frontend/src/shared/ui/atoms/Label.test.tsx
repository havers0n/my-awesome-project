import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Label } from "./Label";

describe('Atom: Label', () => {
  it('renders the label with its children', () => {
    render(<Label>Email Address</Label>);
    const labelElement = screen.getByText(/email address/i);
    expect(labelElement).toBeInTheDocument();
  });

  it('renders with htmlFor attribute', () => {
    render(<Label htmlFor="email">Email Address</Label>);
    const labelElement = screen.getByText(/email address/i);
    expect(labelElement).toHaveAttribute('for', 'email');
  });
}); 