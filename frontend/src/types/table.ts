import { ReactNode } from 'react';

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  sortKey?: keyof T;
  render?: (value: T[keyof T], row: T, index: number) => ReactNode;
  width?: string | number;
  className?: string;
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  showSelection?: boolean;
  selectedItems?: (string | number)[];
  onSelectionChange?: (selectedItems: (string | number)[]) => void;
  onRowClick?: (row: T, index: number) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  };
  sorting?: {
    key: keyof T;
    direction: 'asc' | 'desc';
    onSort: (key: keyof T, direction: 'asc' | 'desc') => void;
  };
  className?: string;
}

export interface TableSort<T = any> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export interface TablePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface TableSelection<T = any> {
  selectedItems: (string | number)[];
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (selected: boolean) => void;
  onSelectItem: (item: T, selected: boolean) => void;
}

export interface TableState<T = any> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: TablePagination;
  sort: TableSort<T> | null;
  selection: TableSelection<T>;
  filters: Record<string, any>;
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (row: T, index: number) => void;
  disabled?: (row: T, index: number) => boolean;
  visible?: (row: T, index: number) => boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export interface TableBulkAction<T = any> {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (selectedItems: T[]) => void;
  disabled?: (selectedItems: T[]) => boolean;
  visible?: (selectedItems: T[]) => boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  confirmMessage?: string;
}

export interface TableFilter<T = any> {
  key: keyof T;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: { value: any; label: string }[];
  defaultValue?: any;
  placeholder?: string;
}
