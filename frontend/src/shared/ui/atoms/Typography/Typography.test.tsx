import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { Typography, Heading, Text, Caption } from "./index";

describe('Typography Components', () => {
  describe('Heading', () => {
    it('renders with correct default props', () => {
      render(<Heading>Test Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
      expect(heading).toHaveClass('text-3xl', 'font-semibold');
    });

    it('renders with correct level', () => {
      render(<Heading level={3}>Test Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading.tagName).toBe('H3');
      expect(heading).toHaveClass('text-xl'); // Default size for h3
    });

    it('applies custom size', () => {
      render(<Heading size="6xl">Large Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-6xl');
    });

    it('applies custom weight', () => {
      render(<Heading weight="bold">Bold Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('font-bold');
    });

    it('applies custom color', () => {
      render(<Heading color="secondary">Secondary Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-gray-700');
    });

    it('applies text alignment', () => {
      render(<Heading align="center">Centered Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('text-center');
    });

    it('applies truncate when specified', () => {
      render(<Heading truncate>Truncated Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('truncate');
    });

    it('applies custom className', () => {
      render(<Heading className="custom-class">Custom Heading</Heading>);
      const heading = screen.getByRole('heading');
      expect(heading).toHaveClass('custom-class');
    });
  });

  describe('Text', () => {
    it('renders with correct default props', () => {
      render(<Text>Test Text</Text>);
      const text = screen.getByText('Test Text');
      expect(text).toBeInTheDocument();
      expect(text.tagName).toBe('P');
      expect(text).toHaveClass('text-base', 'font-normal');
    });

    it('renders with different elements', () => {
      render(<Text as="span">Span Text</Text>);
      const text = screen.getByText('Span Text');
      expect(text.tagName).toBe('SPAN');
    });

    it('applies custom size', () => {
      render(<Text size="lg">Large Text</Text>);
      const text = screen.getByText('Large Text');
      expect(text).toHaveClass('text-lg');
    });

    it('applies custom weight', () => {
      render(<Text weight="bold">Bold Text</Text>);
      const text = screen.getByText('Bold Text');
      expect(text).toHaveClass('font-bold');
    });

    it('applies custom color', () => {
      render(<Text color="success">Success Text</Text>);
      const text = screen.getByText('Success Text');
      expect(text).toHaveClass('text-green-600');
    });

    it('applies text alignment', () => {
      render(<Text align="center">Centered Text</Text>);
      const text = screen.getByText('Centered Text');
      expect(text).toHaveClass('text-center');
    });

    it('applies text decorations', () => {
      render(\n        <Text italic underline strikethrough>\n          Decorated Text\n        </Text>\n      );\n      const text = screen.getByText('Decorated Text');\n      expect(text).toHaveClass('italic', 'underline', 'line-through');\n    });

    it('applies truncate when specified', () => {
      render(<Text truncate>Truncated Text</Text>);
      const text = screen.getByText('Truncated Text');
      expect(text).toHaveClass('truncate');
    });
  });

  describe('Caption', () => {
    it('renders with correct default props', () => {
      render(<Caption>Test Caption</Caption>);
      const caption = screen.getByText('Test Caption');
      expect(caption).toBeInTheDocument();
      expect(caption.tagName).toBe('SMALL');
      expect(caption).toHaveClass('text-sm', 'font-normal', 'text-gray-500');
    });

    it('renders with different elements', () => {
      render(<Caption as="span">Span Caption</Caption>);
      const caption = screen.getByText('Span Caption');
      expect(caption.tagName).toBe('SPAN');
    });

    it('applies custom size', () => {
      render(<Caption size="xs">Extra Small Caption</Caption>);
      const caption = screen.getByText('Extra Small Caption');
      expect(caption).toHaveClass('text-xs');
    });

    it('applies custom weight', () => {
      render(<Caption weight="semibold">Semibold Caption</Caption>);
      const caption = screen.getByText('Semibold Caption');
      expect(caption).toHaveClass('font-semibold');
    });

    it('applies custom color', () => {
      render(<Caption color="warning">Warning Caption</Caption>);
      const caption = screen.getByText('Warning Caption');
      expect(caption).toHaveClass('text-yellow-600');
    });

    it('applies uppercase when specified', () => {
      render(<Caption uppercase>Uppercase Caption</Caption>);
      const caption = screen.getByText('Uppercase Caption');
      expect(caption).toHaveClass('uppercase');
    });

    it('applies truncate when specified', () => {
      render(<Caption truncate>Truncated Caption</Caption>);
      const caption = screen.getByText('Truncated Caption');
      expect(caption).toHaveClass('truncate');
    });
  });

  describe('Legacy Typography', () => {
    it('renders with correct default props', () => {
      render(<Typography>Test Typography</Typography>);
      const typography = screen.getByText('Test Typography');
      expect(typography).toBeInTheDocument();
      expect(typography.tagName).toBe('P');
      expect(typography).toHaveClass('text-base', 'font-normal');
    });

    it('renders with different variants', () => {
      render(<Typography variant="h1">Heading Typography</Typography>);
      const typography = screen.getByText('Heading Typography');
      expect(typography.tagName).toBe('H1');
    });

    it('applies custom size', () => {
      render(<Typography size="lg">Large Typography</Typography>);
      const typography = screen.getByText('Large Typography');
      expect(typography).toHaveClass('text-lg');
    });

    it('applies custom weight', () => {
      render(<Typography weight="bold">Bold Typography</Typography>);
      const typography = screen.getByText('Bold Typography');
      expect(typography).toHaveClass('font-bold');
    });

    it('applies custom color', () => {
      render(<Typography color="danger">Danger Typography</Typography>);
      const typography = screen.getByText('Danger Typography');
      expect(typography).toHaveClass('text-red-600');
    });

    it('applies text alignment', () => {
      render(<Typography align="center">Centered Typography</Typography>);
      const typography = screen.getByText('Centered Typography');
      expect(typography).toHaveClass('text-center');
    });
  });
});
