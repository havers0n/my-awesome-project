import { ComponentType } from 'react';

export interface WidgetSize {
  w: number;
  h: number;
}

export interface WidgetDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  component: ComponentType<any>;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  configurable: boolean;
  icon: string;
  preview: string;
}

export type WidgetCategory = 'analytics' | 'sales' | 'inventory' | 'planning' | 'forecasting';
