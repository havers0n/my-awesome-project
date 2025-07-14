import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom';
import { ProductCell } from "../ProductCell";
import { FilterButton } from "../FilterButton";
import { SearchBar } from "../SearchBar";
import { MetricCard } from "../MetricCard";

// Mock Icons
jest.mock('../../atoms/Icon', () => ({
  Icon: ({ name, ...props }: any) => <div data-testid={`icon-${name}`} {...props} />,
}));

// Mock Image
jest.mock('../../atoms/Image', () => ({
  Image: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

describe('Migrated Molecules Components', () => {
  describe('ProductCell', () => {
    it('renders basic product information', () => {
      render(
        <ProductCell
          imageUrl="/test-image.jpg"
          title="Test Product"
          description="Test description"
          price="$99.99"
        />
      );

      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
    });

    it('shows status badge when status is not available', () => {
      render(<ProductCell imageUrl="/test-image.jpg" title="Test Product" status="out-of-stock" />);

      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('renders actions when showActions is true', () => {
      const mockQuickView = jest.fn();
      const mockAddToCart = jest.fn();

      render(
        <ProductCell
          imageUrl="/test-image.jpg"
          title="Test Product"
          showActions={true}
          onQuickView={mockQuickView}
          onAddToCart={mockAddToCart}
        />
      );

      expect(screen.getByText('Quick View')).toBeInTheDocument();
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    });

    it('calls onClick handler when clicked', () => {
      const mockClick = jest.fn();

      render(<ProductCell imageUrl="/test-image.jpg" title="Test Product" onClick={mockClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('supports keyboard navigation', () => {
      const mockClick = jest.fn();

      render(<ProductCell imageUrl="/test-image.jpg" title="Test Product" onClick={mockClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('FilterButton', () => {
    it('renders filter button with label and icon', () => {
      render(<FilterButton label="Electronics" iconName="laptop" onClick={() => {}} />);

      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByTestId('icon-laptop')).toBeInTheDocument();
    });

    it('shows active state correctly', () => {
      render(
        <FilterButton label="Electronics" iconName="laptop" onClick={() => {}} active={true} />
      );

      // Check if active styling is applied (this depends on your implementation)
      const button = screen.getByRole('button');
      expect(button).toHaveClass('ring-2', 'ring-brand-500');
    });

    it('displays count when provided', () => {
      render(<FilterButton label="Electronics" iconName="laptop" onClick={() => {}} count={42} />);

      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
      const mockClick = jest.fn();

      render(<FilterButton label="Electronics" iconName="laptop" onClick={mockClick} />);

      fireEvent.click(screen.getByRole('button'));
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SearchBar', () => {
    it('renders search input with placeholder', () => {
      render(<SearchBar value="" onChange={() => {}} placeholder="Search products..." />);

      expect(screen.getByPlaceholderText('Search products...')).toBeInTheDocument();
    });

    it('calls onChange when input value changes', () => {
      const mockChange = jest.fn();

      render(<SearchBar value="" onChange={mockChange} placeholder="Search..." />);

      const input = screen.getByPlaceholderText('Search...');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(mockChange).toHaveBeenCalledWith('test');
    });

    it('calls onSearch when search button is clicked', () => {
      const mockSearch = jest.fn();

      render(
        <SearchBar
          value="test query"
          onChange={() => {}}
          onSearch={mockSearch}
          showSearchButton={true}
        />
      );

      const searchButton = screen.getByText('Search');
      fireEvent.click(searchButton);
      expect(mockSearch).toHaveBeenCalledWith('test query');
    });

    it('calls onSearch when Enter key is pressed', () => {
      const mockSearch = jest.fn();

      render(<SearchBar value="test query" onChange={() => {}} onSearch={mockSearch} />);

      const input = screen.getByDisplayValue('test query');
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(mockSearch).toHaveBeenCalledWith('test query');
    });
  });

  describe('MetricCard', () => {
    it('renders metric title and value', () => {
      render(<MetricCard title="Total Revenue" value={12345} />);

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText('12,345')).toBeInTheDocument();
    });

    it('formats currency values correctly', () => {
      render(<MetricCard title="Revenue" value={12345.67} format="currency" />);

      expect(screen.getByText(/\\$12,345\\.67/)).toBeInTheDocument();
    });

    it('formats percentage values correctly', () => {
      render(<MetricCard title="Conversion Rate" value={15.5} format="percentage" />);

      expect(screen.getByText('15.5%')).toBeInTheDocument();
    });

    it('shows change indicator when change is provided', () => {
      render(<MetricCard title="Revenue" value={12345} change={5.2} changeType="increase" />);

      expect(screen.getByText('5.2%')).toBeInTheDocument();
      expect(screen.getByTestId('icon-trending-up')).toBeInTheDocument();
    });

    it('shows loading state correctly', () => {
      render(<MetricCard title="Revenue" value={12345} loading={true} />);

      expect(screen.getByText('Revenue')).toBeInTheDocument();
      // Loading state shows skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('shows progress bar when progress is provided', () => {
      render(<MetricCard title="Progress" value={75} progress={{ value: 75, max: 100 }} />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('75 / 100')).toBeInTheDocument();
    });

    it('calls onClick when card is clicked', () => {
      const mockClick = jest.fn();

      render(<MetricCard title="Revenue" value={12345} onClick={mockClick} />);

      fireEvent.click(screen.getByText('Revenue').closest('div')!);
      expect(mockClick).toHaveBeenCalledTimes(1);
    });
  });
});
