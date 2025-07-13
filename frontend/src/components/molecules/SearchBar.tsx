import React, { useState, useRef } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import { Dropdown, DropdownItem, DropdownDivider } from '../atoms/Dropdown';
import { Badge } from '../atoms/Badge';
import { Text } from '../atoms/Typography';

export interface SearchBarProps {
  /** Placeholder текст */
  placeholder?: string;
  /** Текущее значение поиска */
  value?: string;
  /** Обработчик изменения значения */
  onChange?: (value: string) => void;
  /** Обработчик поиска */
  onSearch?: (value: string) => void;
  /** Обработчик очистки */
  onClear?: () => void;
  /** Размер компонента */
  size?: 'sm' | 'md' | 'lg';
  /** Показывать кнопку поиска */
  showSearchButton?: boolean;
  /** Показывать кнопку очистки */
  showClearButton?: boolean;
  /** Автофокус */
  autoFocus?: boolean;
  /** Загрузка */
  loading?: boolean;
  /** Отключить компонент */
  disabled?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Недавние поиски */
  recentSearches?: string[];
  /** Предложения для поиска */
  suggestions?: Array<{
    id: string;
    text: string;
    category?: string;
    count?: number;
  }>;
  /** Обработчик выбора предложения */
  onSuggestionSelect?: (suggestion: any) => void;
  /** Показывать dropdown с предложениями */
  showSuggestions?: boolean;
  /** Максимальное количество предложений */
  maxSuggestions?: number;
  /** Обработчик клавиатуры */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  onClear,
  size = 'md',
  showSearchButton = true,
  showClearButton = true,
  autoFocus = false,
  loading = false,
  disabled = false,
  className = '',
  recentSearches = [],
  suggestions = [],
  onSuggestionSelect,
  showSuggestions = true,
  maxSuggestions = 10,
  onKeyDown,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    onChange?.(newValue);

    // Показываем dropdown только при наличии значения и предложений
    if (showSuggestions && (newValue.length > 0 || recentSearches.length > 0)) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (showSuggestions && (value.length > 0 || recentSearches.length > 0)) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Небольшая задержка для обработки клика по предложениям
    setTimeout(() => setShowDropdown(false), 150);
  };

  const handleSearch = () => {
    if (value.trim()) {
      onSearch?.(value.trim());
      setShowDropdown(false);
    }
  };

  const handleClear = () => {
    onChange?.('');
    onClear?.();
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: any) => {
    onSuggestionSelect?.(suggestion);
    setShowDropdown(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    } else if (event.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
    onKeyDown?.(event);
  };

  // Фильтруем предложения по текущему значению
  const filteredSuggestions = suggestions
    .filter(suggestion => suggestion.text.toLowerCase().includes(value.toLowerCase()))
    .slice(0, maxSuggestions);

  const hasContent = value.length > 0;
  const shouldShowClearButton = showClearButton && hasContent && !loading;

  const searchIcon = (
    <Icon
      name="search"
      size={size === 'sm' ? 4 : size === 'lg' ? 5 : 4}
      className="text-gray-400"
    />
  );

  const clearIcon = (
    <Icon
      name="x"
      size={size === 'sm' ? 4 : size === 'lg' ? 5 : 4}
      className="text-gray-400 hover:text-gray-600 cursor-pointer"
      onClick={handleClear}
    />
  );

  const loadingIcon = (
    <div className="animate-spin">
      <Icon
        name="loader"
        size={size === 'sm' ? 4 : size === 'lg' ? 5 : 4}
        className="text-gray-400"
      />
    </div>
  );

  const containerClasses = `relative ${className}`;
  const inputContainerClasses = `flex items-center gap-2 ${
    isFocused ? 'ring-2 ring-brand-500 ring-offset-2' : ''
  }`;

  return (
    <div className={containerClasses}>
      <div className={inputContainerClasses}>
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            size={size}
            disabled={disabled}
            autoFocus={autoFocus}
            leftIcon={searchIcon}
            rightIcon={loading ? loadingIcon : shouldShowClearButton ? clearIcon : undefined}
            className="pr-10"
          />
        </div>

        {showSearchButton && (
          <Button
            variant="primary"
            size={size}
            onClick={handleSearch}
            disabled={disabled || loading || !hasContent}
            loading={loading}
            className="flex-shrink-0"
          >
            Search
          </Button>
        )}
      </div>

      {/* Dropdown с предложениями */}
      {showDropdown && showSuggestions && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 dark:bg-gray-800 dark:border-gray-700 max-h-80 overflow-y-auto">
          {/* Недавние поиски */}
          {recentSearches.length > 0 && !hasContent && (
            <div className="px-4 py-2">
              <Text variant="label" size="sm" color="secondary" className="mb-2">
                Recent searches
              </Text>
              {recentSearches.slice(0, 5).map((search, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handleSuggestionClick({ text: search })}
                >
                  <Icon name="clock" size={4} className="text-gray-400" />
                  <Text variant="span" size="sm">
                    {search}
                  </Text>
                </div>
              ))}
            </div>
          )}

          {/* Предложения */}
          {filteredSuggestions.length > 0 && (
            <div className="px-4 py-2">
              {recentSearches.length > 0 && !hasContent && <DropdownDivider />}

              <Text variant="label" size="sm" color="secondary" className="mb-2">
                Suggestions
              </Text>

              {filteredSuggestions.map(suggestion => (
                <div
                  key={suggestion.id}
                  className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    <Icon name="search" size={4} className="text-gray-400" />
                    <div>
                      <Text variant="span" size="sm">
                        {suggestion.text}
                      </Text>
                      {suggestion.category && (
                        <Text variant="span" size="xs" color="secondary" className="block">
                          in {suggestion.category}
                        </Text>
                      )}
                    </div>
                  </div>

                  {suggestion.count && (
                    <Badge variant="light" size="sm" color="gray">
                      {suggestion.count}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Пустое состояние */}
          {hasContent && filteredSuggestions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Text variant="span" size="sm" color="secondary">
                No suggestions found
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
