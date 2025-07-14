import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Alert, AlertTitle, AlertDescription } from "./Alert";

describe('Molecule: Alert', () => {
  it('renders with title and description', () => {
    render(
      <Alert>
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>You can add components to your app using the cli.</AlertDescription>
      </Alert>
    );

    expect(screen.getByText('Heads up!')).toBeInTheDocument();
    expect(screen.getByText('You can add components to your app using the cli.')).toBeInTheDocument();
  });

  it('has the role of "alert"', () => {
    render(<Alert />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('applies destructive variant classes', () => {
    render(
      <Alert variant="destructive" data-testid="alert">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
      </Alert>
    );

    const alertElement = screen.getByTestId('alert');
    // Based on cva destructive variant: 'border-destructive/50' and 'text-destructive'
    expect(alertElement.className).toContain('border-destructive/50');
    expect(alertElement.className).toContain('text-destructive');
  });
}); 