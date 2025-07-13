import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DragPreview, {
  WidgetDragPreview,
  FileDragPreview,
  ListItemDragPreview,
} from '../DragPreview';

// Mock для framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock для lucide-react
vi.mock('lucide-react', () => ({
  Move: () => React.createElement('span', { 'data-testid': 'move-icon' }, 'Move'),
  Grip: () => React.createElement('span', { 'data-testid': 'grip-icon' }, 'Grip'),
}));

describe('DragPreview', () => {
  const defaultProps = {
    title: 'Test Title',
    isDragging: true,
  };

  it('не должен рендериться, если isDragging false', () => {
    const { container } = render(<DragPreview {...defaultProps} isDragging={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('должен рендериться, если isDragging true', () => {
    render(<DragPreview {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByTestId('move-icon')).toBeInTheDocument();
    expect(screen.getByTestId('grip-icon')).toBeInTheDocument();
  });

  it('должен показывать description, если предоставлен', () => {
    render(<DragPreview {...defaultProps} description="Test Description" />);

    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('должен показывать custom icon, если предоставлен', () => {
    const customIcon = <span data-testid="custom-icon">Custom</span>;

    render(<DragPreview {...defaultProps} icon={customIcon} />);

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('move-icon')).not.toBeInTheDocument();
  });

  it('должен рендерить custom children, если предоставлены', () => {
    const customChildren = <div data-testid="custom-children">Custom Content</div>;

    render(<DragPreview {...defaultProps}>{customChildren}</DragPreview>);

    expect(screen.getByTestId('custom-children')).toBeInTheDocument();
    expect(screen.queryByText('Перетаскивание...')).not.toBeInTheDocument();
  });

  it('должен применять custom className', () => {
    const { container } = render(<DragPreview {...defaultProps} className="custom-class" />);

    const dragPreview = container.querySelector('.drag-preview');
    expect(dragPreview).toHaveClass('custom-class');
  });

  it('должен применять custom style', () => {
    const customStyle = { backgroundColor: 'red' };

    const { container } = render(<DragPreview {...defaultProps} style={customStyle} />);

    const dragPreview = container.querySelector('.drag-preview');
    expect(dragPreview).toHaveStyle('background-color: red');
  });

  it('должен показывать индикаторы drag (точки)', () => {
    const { container } = render(<DragPreview {...defaultProps} />);

    const indicators = container.querySelectorAll('.w-2.h-2.bg-blue-500.rounded-full');
    expect(indicators).toHaveLength(3);
  });
});

describe('WidgetDragPreview', () => {
  const defaultProps = {
    widgetType: 'chart',
    title: 'Test Widget',
    isDragging: true,
  };

  it('не должен рендериться, если isDragging false', () => {
    const { container } = render(<WidgetDragPreview {...defaultProps} isDragging={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('должен рендериться с правильными данными', () => {
    render(<WidgetDragPreview {...defaultProps} />);

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Виджет: chart')).toBeInTheDocument();
    expect(screen.getByText('chart')).toBeInTheDocument();
  });

  it('должен применять custom className', () => {
    const { container } = render(<WidgetDragPreview {...defaultProps} className="widget-custom" />);

    const dragPreview = container.querySelector('.drag-preview');
    expect(dragPreview).toHaveClass('widget-custom');
  });
});

describe('FileDragPreview', () => {
  const defaultProps = {
    fileName: 'test.pdf',
    fileType: 'pdf',
    isDragging: true,
  };

  it('не должен рендериться, если isDragging false', () => {
    const { container } = render(<FileDragPreview {...defaultProps} isDragging={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('должен рендериться с правильными данными файла', () => {
    render(<FileDragPreview {...defaultProps} />);

    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('P')).toBeInTheDocument(); // Первая буква в иконке
  });

  it('должен показывать размер файла, если предоставлен', () => {
    render(<FileDragPreview {...defaultProps} fileSize="2.5 MB" />);

    expect(screen.getByText('pdf • 2.5 MB')).toBeInTheDocument();
    expect(screen.getByText('2.5 MB')).toBeInTheDocument();
  });

  it('должен показывать только тип файла без размера', () => {
    render(<FileDragPreview {...defaultProps} />);

    expect(screen.getByText('pdf')).toBeInTheDocument();
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  it('должен применять custom className', () => {
    const { container } = render(<FileDragPreview {...defaultProps} className="file-custom" />);

    const dragPreview = container.querySelector('.drag-preview');
    expect(dragPreview).toHaveClass('file-custom');
  });
});

describe('ListItemDragPreview', () => {
  const defaultProps = {
    title: 'Test Item',
    isDragging: true,
  };

  it('не должен рендериться, если isDragging false', () => {
    const { container } = render(<ListItemDragPreview {...defaultProps} isDragging={false} />);

    expect(container.firstChild).toBeNull();
  });

  it('должен рендериться с правильными данными', () => {
    render(<ListItemDragPreview {...defaultProps} />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('должен показывать subtitle, если предоставлен', () => {
    render(<ListItemDragPreview {...defaultProps} subtitle="Test Subtitle" />);

    expect(screen.getByText('Test Item')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('должен применять custom className', () => {
    const { container } = render(<ListItemDragPreview {...defaultProps} className="list-custom" />);

    const dragPreview = container.querySelector('.drag-preview');
    expect(dragPreview).toHaveClass('list-custom');
  });

  it('должен показывать индикатор точки', () => {
    const { container } = render(<ListItemDragPreview {...defaultProps} />);

    const indicator = container.querySelector('.w-2.h-2.bg-blue-500.rounded-full');
    expect(indicator).toBeInTheDocument();
  });
});
