import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/__tests__/utils/test-utils';
import { Icon } from '../Icon';

// Мокаем helpers/icons
vi.mock('@/helpers/icons', () => ({
  ICONS: {
    home: '/icons/home.svg',
    user: '/icons/user.svg',
    settings: '/icons/settings.svg',
  },
}));

describe('Icon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен рендерить иконку с правильными атрибутами', () => {
    render(<Icon name="home" />);
    
    const icon = screen.getByAltText('home icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/icons/home.svg');
    expect(icon).toHaveClass('w-5 h-5');
  });

  it('должен применять кастомный размер', () => {
    render(<Icon name="user" size={8} />);
    
    const icon = screen.getByAltText('user icon');
    expect(icon).toHaveClass('w-8 h-8');
  });

  it('должен применять дополнительные классы', () => {
    render(<Icon name="settings" className="custom-class opacity-50" />);
    
    const icon = screen.getByAltText('settings icon');
    expect(icon).toHaveClass('w-5 h-5 custom-class opacity-50');
  });

  it('должен передавать дополнительные props', () => {
    render(
      <Icon 
        name="home" 
        data-testid="custom-icon"
        onClick={vi.fn()}
        style={{ cursor: 'pointer' }}
      />
    );
    
    const icon = screen.getByTestId('custom-icon');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveStyle({ cursor: 'pointer' });
  });

  it('должен возвращать null для несуществующей иконки', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const { container } = render(<Icon name="nonexistent" as any />);
    
    expect(container.firstChild).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Icon with name "nonexistent" not found.');
    
    consoleSpy.mockRestore();
  });

  it('должен работать без className', () => {
    render(<Icon name="home" />);
    
    const icon = screen.getByAltText('home icon');
    expect(icon.className).toBe('w-5 h-5 ');
  });
});
