import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { Icon } from "./Icon";

describe('Icon', () => {
  describe('Local icons', () => {
    it('renders local icon correctly', () => {
      render(<Icon name="LOGO" type="local" />);
      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/images/logo/logo.svg');
      expect(icon).toHaveAttribute('alt', 'LOGO icon');
    });

    it('applies correct size to local icon', () => {
      render(<Icon name="LOGO" type="local" size="lg" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });

    it('applies custom size to local icon', () => {
      render(<Icon name="LOGO" type="local" size={40} />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('width', '40');
      expect(icon).toHaveAttribute('height', '40');
    });

    it('applies custom className to local icon', () => {
      render(<Icon name="LOGO" type="local" className="custom-class" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('Lucide icons', () => {
    it('renders lucide icon correctly', () => {
      render(<Icon name="Home" type="lucide" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
    });

    it('applies correct size to lucide icon', () => {
      render(<Icon name="Home" type="lucide" size="lg" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('width', '24');
      expect(icon).toHaveAttribute('height', '24');
    });

    it('applies custom color to lucide icon', () => {
      render(<Icon name="Home" type="lucide" color="red" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('color', 'red');
    });

    it('applies variant styles to lucide icon', () => {
      render(<Icon name="Home" type="lucide" variant="outline" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('stroke-width', '1.5');
    });

    it('applies custom className to lucide icon', () => {
      render(<Icon name="Home" type="lucide" className="custom-class" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveClass('custom-class');
    });
  });

  describe('Fallback behavior', () => {
    it('shows fallback for unknown local icon', () => {
      render(<Icon name="UNKNOWN_ICON" type="local" />);
      const fallback = screen.getByTitle('Missing icon: UNKNOWN_ICON');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('bg-gray-200');
    });

    it('shows fallback for unknown lucide icon', () => {
      render(<Icon name="UnknownIcon" type="lucide" />);
      const fallback = screen.getByTitle('Missing icon: UnknownIcon');
      expect(fallback).toBeInTheDocument();
      expect(fallback).toHaveClass('bg-gray-200');
    });
  });

  describe('Default behavior', () => {
    it('defaults to local type when type is not specified', () => {
      render(<Icon name="LOGO" />);
      const icon = screen.getByRole('img');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/images/logo/logo.svg');
    });

    it('defaults to md size when size is not specified', () => {
      render(<Icon name="LOGO" type="local" />);
      const icon = screen.getByRole('img');
      expect(icon).toHaveAttribute('width', '20');
      expect(icon).toHaveAttribute('height', '20');
    });

    it('defaults to solid variant when variant is not specified', () => {
      render(<Icon name="Home" type="lucide" />);
      const icon = screen.getByRole('img', { hidden: true });
      expect(icon).toHaveAttribute('stroke-width', '1.5');
    });
  });

  describe('Size mapping', () => {
    const sizeTests = [
      { size: 'xs', expected: '12' },
      { size: 'sm', expected: '16' },
      { size: 'md', expected: '20' },
      { size: 'lg', expected: '24' },
      { size: 'xl', expected: '32' },
    ] as const;

    sizeTests.forEach(({ size, expected }) => {
      it(`maps ${size} size to ${expected}px`, () => {
        render(<Icon name="LOGO" type="local" size={size} />);
        const icon = screen.getByRole('img');
        expect(icon).toHaveAttribute('width', expected);
        expect(icon).toHaveAttribute('height', expected);
      });
    });
  });
});
