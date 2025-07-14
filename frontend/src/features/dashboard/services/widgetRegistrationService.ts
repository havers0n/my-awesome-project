import { WidgetDefinition } from '../types/widget.types';

class WidgetRegistrationService {
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
}

export const widgetRegistrationService = new WidgetRegistrationService();

// Функции для использования в других местах
export function getWidgetById(id: string): WidgetDefinition | undefined {
  return widgetRegistrationService.getWidget(id);
}

export function getWidgetsByCategory(category: string): WidgetDefinition[] {
  return widgetRegistrationService.getWidgetsByCategory(category);
}

export function getAllCategories(): string[] {
  return widgetRegistrationService.getAllCategories();
}

export function getAllWidgets(): WidgetDefinition[] {
  return widgetRegistrationService.getAllWidgets();
}
