// Типы для мониторинга производительности
interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  cls?: number; // Cumulative Layout Shift
  fid?: number; // First Input Delay
  ttfb?: number; // Time to First Byte
  dragOperationDuration?: number;
  reRenderCount?: number;
  memoryUsage?: number;
}

interface DragDropMetrics {
  dragStartTime: number;
  dragEndTime: number;
  dragDuration: number;
  elementCount: number;
  reRenderCount: number;
  memoryBefore: number;
  memoryAfter: number;
  frameDrops: number;
  animationFrames: number;
}

interface PerformanceEntry {
  timestamp: number;
  operationType: 'dragStart' | 'dragEnd' | 'drop' | 'rerender' | 'animation';
  duration: number;
  metrics: DragDropMetrics;
  additionalData?: Record<string, any>;
}

// Класс для мониторинга производительности drag & drop
class DragDropPerformanceMonitor {
  private static instance: DragDropPerformanceMonitor;
  private entries: PerformanceEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private currentDragSession: Partial<DragDropMetrics> | null = null;
  private frameCount = 0;
  private reRenderCount = 0;
  private isEnabled = true;
  private thresholds = {
    dragDuration: 500, // ms
    reRenderCount: 50,
    memoryThreshold: 50 * 1024 * 1024, // 50MB
    frameDropThreshold: 5,
  };

  private constructor() {
    this.initializeObservers();
    this.bindEvents();
  }

  public static getInstance(): DragDropPerformanceMonitor {
    if (!DragDropPerformanceMonitor.instance) {
      DragDropPerformanceMonitor.instance = new DragDropPerformanceMonitor();
    }
    return DragDropPerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Observer для Web Vitals
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordWebVital('lcp', lastEntry.startTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // FID Observer
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordWebVital('fid', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      const clsObserver = new PerformanceObserver(list => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        this.recordWebVital('cls', clsValue);
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // FCP через Navigation Timing API
    if (document.readyState === 'complete') {
      this.recordFCP();
    } else {
      window.addEventListener('load', () => this.recordFCP());
    }
  }

  private bindEvents(): void {
    if (typeof window === 'undefined') return;

    // Мониторинг памяти
    if ('memory' in performance) {
      setInterval(() => {
        this.recordMemoryUsage();
      }, 5000);
    }

    // Мониторинг FPS
    this.startFPSMonitoring();
  }

  private recordFCP(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.recordWebVital('fcp', fcpEntry.startTime);
      }
    }
  }

  private recordWebVital(metric: string, value: number): void {
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operationType: 'animation',
      duration: value,
      metrics: {
        dragStartTime: 0,
        dragEndTime: 0,
        dragDuration: 0,
        elementCount: 0,
        reRenderCount: 0,
        memoryBefore: 0,
        memoryAfter: 0,
        frameDrops: 0,
        animationFrames: 0,
      },
      additionalData: { webVital: metric, value },
    };

    this.entries.push(entry);
    this.checkThresholds(entry);
  }

  private recordMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > this.thresholds.memoryThreshold) {
        console.warn(`High memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      }
    }
  }

  private startFPSMonitoring(): void {
    let lastTime = performance.now();
    let frameCount = 0;
    let droppedFrames = 0;

    const measureFPS = (currentTime: number) => {
      frameCount++;
      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const fps = (frameCount / elapsed) * 1000;
        if (fps < 55) {
          // Считаем проблемой FPS ниже 55
          droppedFrames++;
        }

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  // Публичные методы для мониторинга drag & drop
  public startDragOperation(elementCount: number = 1): void {
    if (!this.isEnabled) return;

    const memoryBefore = this.getMemoryUsage();

    this.currentDragSession = {
      dragStartTime: performance.now(),
      elementCount,
      memoryBefore,
      reRenderCount: 0,
      frameDrops: 0,
      animationFrames: 0,
    };

    this.reRenderCount = 0;
    this.frameCount = 0;
  }

  public endDragOperation(): void {
    if (!this.isEnabled || !this.currentDragSession) return;

    const endTime = performance.now();
    const memoryAfter = this.getMemoryUsage();

    const metrics: DragDropMetrics = {
      dragStartTime: this.currentDragSession.dragStartTime!,
      dragEndTime: endTime,
      dragDuration: endTime - this.currentDragSession.dragStartTime!,
      elementCount: this.currentDragSession.elementCount!,
      reRenderCount: this.reRenderCount,
      memoryBefore: this.currentDragSession.memoryBefore!,
      memoryAfter,
      frameDrops: this.frameCount,
      animationFrames: this.currentDragSession.animationFrames!,
    };

    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      operationType: 'dragEnd',
      duration: metrics.dragDuration,
      metrics,
      additionalData: {
        memoryDelta: memoryAfter - metrics.memoryBefore,
        avgFPS: this.frameCount > 0 ? 1000 / (metrics.dragDuration / this.frameCount) : 0,
      },
    };

    this.entries.push(entry);
    this.checkThresholds(entry);
    this.currentDragSession = null;
  }

  public recordReRender(componentName?: string): void {
    if (!this.isEnabled) return;

    this.reRenderCount++;

    if (this.reRenderCount > this.thresholds.reRenderCount) {
      console.warn(`High re-render count: ${this.reRenderCount} renders`);
    }
  }

  public recordAnimationFrame(): void {
    if (!this.isEnabled || !this.currentDragSession) return;

    this.frameCount++;
    if (this.currentDragSession.animationFrames !== undefined) {
      this.currentDragSession.animationFrames++;
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private checkThresholds(entry: PerformanceEntry): void {
    const { metrics } = entry;

    // Проверяем пороговые значения
    if (metrics.dragDuration > this.thresholds.dragDuration) {
      console.warn(`Slow drag operation: ${metrics.dragDuration.toFixed(2)}ms`);
    }

    if (metrics.reRenderCount > this.thresholds.reRenderCount) {
      console.warn(`High re-render count: ${metrics.reRenderCount}`);
    }

    if (metrics.memoryAfter - metrics.memoryBefore > this.thresholds.memoryThreshold) {
      console.warn(
        `High memory usage during drag: ${((metrics.memoryAfter - metrics.memoryBefore) / 1024 / 1024).toFixed(2)}MB`
      );
    }
  }

  // Получение метрик
  public getMetrics(): PerformanceEntry[] {
    return [...this.entries];
  }

  public getCurrentSessionMetrics(): Partial<DragDropMetrics> | null {
    return this.currentDragSession;
  }

  public getAverageMetrics(): {
    avgDragDuration: number;
    avgReRenderCount: number;
    avgMemoryUsage: number;
    totalOperations: number;
  } {
    const dragOperations = this.entries.filter(entry => entry.operationType === 'dragEnd');

    if (dragOperations.length === 0) {
      return {
        avgDragDuration: 0,
        avgReRenderCount: 0,
        avgMemoryUsage: 0,
        totalOperations: 0,
      };
    }

    const totalDuration = dragOperations.reduce(
      (sum, entry) => sum + entry.metrics.dragDuration,
      0
    );
    const totalReRenders = dragOperations.reduce(
      (sum, entry) => sum + entry.metrics.reRenderCount,
      0
    );
    const totalMemoryUsage = dragOperations.reduce(
      (sum, entry) => sum + (entry.metrics.memoryAfter - entry.metrics.memoryBefore),
      0
    );

    return {
      avgDragDuration: totalDuration / dragOperations.length,
      avgReRenderCount: totalReRenders / dragOperations.length,
      avgMemoryUsage: totalMemoryUsage / dragOperations.length,
      totalOperations: dragOperations.length,
    };
  }

  public getPerformanceReport(): {
    summary: ReturnType<typeof this.getAverageMetrics>;
    webVitals: { [key: string]: number };
    recentOperations: PerformanceEntry[];
    recommendations: string[];
  } {
    const webVitals: { [key: string]: number } = {};
    const recommendations: string[] = [];

    // Собираем Web Vitals
    this.entries.forEach(entry => {
      if (entry.additionalData?.webVital) {
        webVitals[entry.additionalData.webVital] = entry.additionalData.value;
      }
    });

    // Генерируем рекомендации
    const avgMetrics = this.getAverageMetrics();

    if (avgMetrics.avgDragDuration > this.thresholds.dragDuration) {
      recommendations.push(
        'Рассмотрите оптимизацию drag анимаций или используйте requestAnimationFrame'
      );
    }

    if (avgMetrics.avgReRenderCount > this.thresholds.reRenderCount) {
      recommendations.push(
        'Используйте React.memo, useMemo и useCallback для оптимизации re-renders'
      );
    }

    if (avgMetrics.avgMemoryUsage > this.thresholds.memoryThreshold) {
      recommendations.push(
        'Проверьте memory leaks и используйте lazy loading для крупных компонентов'
      );
    }

    if (webVitals.cls > 0.1) {
      recommendations.push(
        'Оптимизируйте Cumulative Layout Shift - используйте transform вместо изменения layout'
      );
    }

    return {
      summary: avgMetrics,
      webVitals,
      recentOperations: this.entries.slice(-10),
      recommendations,
    };
  }

  // Утилиты для управления мониторингом
  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
  }

  public clearMetrics(): void {
    this.entries = [];
    this.reRenderCount = 0;
    this.frameCount = 0;
  }

  public setThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  public exportMetrics(): string {
    return JSON.stringify(
      {
        timestamp: Date.now(),
        entries: this.entries,
        summary: this.getAverageMetrics(),
        thresholds: this.thresholds,
      },
      null,
      2
    );
  }

  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.entries = [];
    this.currentDragSession = null;
  }
}

// Hook для использования мониторинга в React компонентах
export function usePerformanceMonitor() {
  const monitor = DragDropPerformanceMonitor.getInstance();

  const startDragOperation = (elementCount?: number) => {
    monitor.startDragOperation(elementCount);
  };

  const endDragOperation = () => {
    monitor.endDragOperation();
  };

  const recordReRender = (componentName?: string) => {
    monitor.recordReRender(componentName);
  };

  const getMetrics = () => {
    return monitor.getMetrics();
  };

  const getReport = () => {
    return monitor.getPerformanceReport();
  };

  return {
    startDragOperation,
    endDragOperation,
    recordReRender,
    getMetrics,
    getReport,
    monitor,
  };
}

// Decorator для автоматического мониторинга компонентов
export function withPerformanceMonitoring<T extends React.ComponentType<any>>(
  Component: T,
  componentName?: string
): T {
  const WrappedComponent = (props: any) => {
    const { recordReRender } = usePerformanceMonitor();

    React.useEffect(() => {
      recordReRender(componentName || Component.name);
    });

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name})`;

  return WrappedComponent as T;
}

// Утилита для измерения производительности функций
export function measurePerformance<T extends (...args: any[]) => any>(fn: T, name?: string): T {
  return ((...args: any[]) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();

    console.log(`${name || fn.name} took ${(end - start).toFixed(2)}ms`);

    return result;
  }) as T;
}

// Singleton instance
export const performanceMonitor = DragDropPerformanceMonitor.getInstance();

export default DragDropPerformanceMonitor;
