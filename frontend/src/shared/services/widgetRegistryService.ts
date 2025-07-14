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

class WidgetRegistryService {
  private widgets: Map<string, WidgetDefinition> = new Map();
  
  register(widget: WidgetDefinition): void {
    this.widgets.set(widget.id, widget);
  }
  
  getWidget(id: string): WidgetDefinition | undefined {
    return this.widgets.get(id);
  }
  
  getAllWidgets(): WidgetDefinition[] {
    return Array.from(this.widgets.values());
  }
  
  getWidgetsByCategory(category: string): WidgetDefinition[] {
    return this.getAllWidgets().filter(widget => widget.category === category);
  }
  
  getAllCategories(): string[] {
    const categories = new Set<string>();
    this.widgets.forEach(widget => categories.add(widget.category));
    return Array.from(categories);
  }
  
  clear(): void {
    this.widgets.clear();
  }
}

export const widgetRegistryService = new WidgetRegistryService();

// Функции для использования в других местах
export function getWidgetById(id: string): WidgetDefinition | undefined {
  return widgetRegistryService.getWidget(id);
}

export function getWidgetsByCategory(category: string): WidgetDefinition[] {
  return widgetRegistryService.getWidgetsByCategory(category);
}

export function getAllCategories(): string[] {
  return widgetRegistryService.getAllCategories();
}

export function getAllWidgets(): WidgetDefinition[] {
  return widgetRegistryService.getAllWidgets();
}

export function registerWidget(widget: WidgetDefinition): void {
  widgetRegistryService.register(widget);
}

// Экспорт типов для использования в других модулях
export type { WidgetDefinition, WidgetSize, WidgetCategory };
