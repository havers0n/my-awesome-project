import React from 'react';
import { ActionBar } from '../../molecules/ActionBar';
import { FilterButton } from '../../molecules/FilterButton';
import { Button } from '../../atoms/Button';
import { Typography } from '../../atoms/Typography';

export interface OrdersTableHeaderProps {
  /** Заголовок таблицы */
  title: string;
  /** Описание таблицы */
  subtitle?: string;
  /** Общее количество заказов */
  totalCount?: number;
  /** Обработчик клика на фильтр */
  onFilterClick?: () => void;
  /** Обработчик клика на кнопку "Смотреть все" */
  onViewAllClick?: () => void;
  /** Обработчик клика на кнопку экспорта */
  onExportClick?: () => void;
  /** Обработчик клика на кнопку обновления */
  onRefreshClick?: () => void;
  /** Количество активных фильтров */
  activeFiltersCount?: number;
  /** Показывать кнопку экспорта */
  showExport?: boolean;
  /** Показывать кнопку обновления */
  showRefresh?: boolean;
  /** Показывать кнопку фильтра */
  showFilter?: boolean;
  /** Показывать кнопку "Смотреть все" */
  showViewAll?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Состояние загрузки */
  loading?: boolean;
}

export const OrdersTableHeader: React.FC<OrdersTableHeaderProps> = ({
  title,
  subtitle,
  totalCount,
  onFilterClick,
  onViewAllClick,
  onExportClick,
  onRefreshClick,
  activeFiltersCount = 0,
  showExport = false,
  showRefresh = true,
  showFilter = true,
  showViewAll = true,
  className = '',
  loading = false,
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <ActionBar
        variant="transparent"
        align="between"
        spacing="md"
        className="px-0"
      >
        {/* Левая часть - Заголовок и информация */
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Typography
              variant="h3"
              size="lg"
              weight="semibold"
              color="primary"
            >
              {title}
            </Typography>
            {totalCount !== undefined && (
              <Typography
                variant="span"
                size="sm"
                color="muted"
                className="ml-2"
              >
                ({totalCount})
              </Typography>
            )}
          </div>
          {subtitle && (
            <Typography
              variant="p"
              size="sm"
              color="secondary"
              className="mt-1"
            >
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Правая часть - Действия */
        <div className="flex items-center gap-3">
          {showFilter && (
            <FilterButton
              label="Фильтр"
              iconName="filter" // Предполагаем, что есть такая иконка
              onClick={onFilterClick || (() => {})}
              count={activeFiltersCount > 0 ? activeFiltersCount : undefined}
              active={activeFiltersCount > 0}
              size="sm"
              variant="outlined"
              disabled={loading}
            />
          )}

          {showRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefreshClick}
              disabled={loading}
              className="px-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
          )}

          {showExport && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportClick}
              disabled={loading}
              className="px-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </Button>
          )}

          {showViewAll && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewAllClick}
              disabled={loading}
            >
              Смотреть все
            </Button>
          )}
        </div>
      </ActionBar>
    </div>
  );
};

export default OrdersTableHeader;
