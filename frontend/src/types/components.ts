import { ReactNode } from 'react';

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  testId?: string;
}

// Size variants
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Color variants
export type ComponentColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'
  | 'dark'
  | 'light';

// Variant styles
export type ComponentVariant = 'default' | 'outline' | 'solid' | 'subtle' | 'ghost' | 'link';

// Position types
export type PositionType = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';

// Component loading states
export interface LoadingState {
  loading: boolean;
  error: string | null;
  message?: string;
}

// Component pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  showQuickJumper?: boolean;
  className?: string;
}

// Component filtering
export interface FilterProps<T = any> {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onResetFilters: () => void;
  data: T[];
  filteredData: T[];
}

// Component sorting
export interface SortProps<T = any> {
  sortBy: keyof T;
  sortOrder: 'asc' | 'desc';
  onSort: (key: keyof T, order: 'asc' | 'desc') => void;
  sortableColumns: (keyof T)[];
}

// Component selection
export interface SelectionProps<T = any> {
  selectedItems: (string | number)[];
  onSelectionChange: (items: (string | number)[]) => void;
  selectionType: 'single' | 'multiple';
  data: T[];
  disabled?: boolean;
}

// Dialog/Modal props
export interface DialogProps extends BaseComponentProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ComponentSize;
  closable?: boolean;
  maskClosable?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  footer?: ReactNode;
  actions?: ReactNode;
}

// Form component props
export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  name: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  value?: any;
  onChange?: (value: any) => void;
  size?: ComponentSize;
  variant?: ComponentVariant;
}

// Button props
export interface ButtonProps extends BaseComponentProps {
  type?: 'button' | 'submit' | 'reset';
  variant?: ComponentVariant;
  size?: ComponentSize;
  color?: ComponentColor;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

// Badge props
export interface BadgeProps extends BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  color?: ComponentColor;
  icon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

// Card props
export interface CardProps extends BaseComponentProps {
  variant?: ComponentVariant;
  size?: ComponentSize;
  padding?: ComponentSize;
  shadow?: boolean | ComponentSize;
  border?: boolean;
  hoverable?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  cover?: ReactNode;
}

// Avatar props
export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  size?: ComponentSize;
  shape?: 'circle' | 'square';
  name?: string;
  badge?: ReactNode;
  status?: 'online' | 'offline' | 'away' | 'busy';
  clickable?: boolean;
  onClick?: () => void;
}

// Input props
export interface InputProps extends FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  maxLength?: number;
  autoComplete?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  onEnter?: () => void;
  onClear?: () => void;
}

// Select props
export interface SelectProps<T = any> extends FormFieldProps {
  options: SelectOption<T>[];
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  createable?: boolean;
  loading?: boolean;
  noOptionsMessage?: string;
  onSearch?: (query: string) => void;
  onCreate?: (value: string) => void;
  renderOption?: (option: SelectOption<T>) => ReactNode;
}

export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
  data?: any;
}

// Tooltip props
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode;
  placement?:
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';
  trigger?: 'hover' | 'click' | 'focus';
  disabled?: boolean;
  delay?: number;
  arrow?: boolean;
}

// Dropdown props
export interface DropdownProps extends BaseComponentProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom' | 'top' | 'left' | 'right';
  disabled?: boolean;
  onItemClick?: (item: DropdownItem) => void;
}

export interface DropdownItem {
  key: string;
  label: ReactNode;
  disabled?: boolean;
  divided?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

// Notification/Alert props
export interface NotificationProps extends BaseComponentProps {
  type?: 'success' | 'info' | 'warning' | 'error';
  title?: string;
  message: ReactNode;
  closable?: boolean;
  showIcon?: boolean;
  duration?: number;
  onClose?: () => void;
  action?: ReactNode;
}

// Progress props
export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  size?: ComponentSize;
  variant?: ComponentVariant;
  color?: ComponentColor;
  showText?: boolean;
  status?: 'normal' | 'success' | 'error' | 'warning';
  striped?: boolean;
  animated?: boolean;
}

// Tab props
export interface TabsProps extends BaseComponentProps {
  activeKey?: string;
  defaultActiveKey?: string;
  onChange?: (key: string) => void;
  size?: ComponentSize;
  variant?: ComponentVariant;
  position?: 'top' | 'bottom' | 'left' | 'right';
  items: TabItem[];
}

export interface TabItem {
  key: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  closable?: boolean;
  icon?: ReactNode;
}
