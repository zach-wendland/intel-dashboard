// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  start(label: string): void {
    this.marks.set(label, performance.now());
  }

  /**
   * End timing and log duration
   */
  end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`No start mark found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(label);

    // Log in development mode (checking for dev environment)
    if (import.meta.env.DEV) {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure and log component render time
   */
  measureRender(componentName: string, callback: () => void): void {
    this.start(componentName);
    callback();
    this.end(componentName);
  }

  /**
   * Get web vitals data
   */
  getWebVitals(): {
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
    ttfb?: number;
  } {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');

    return {
      fcp: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
      ttfb: navigation?.responseStart - navigation?.requestStart
    };
  }

  /**
   * Log current memory usage (if available)
   */
  logMemoryUsage(): void {
    // Chrome-specific performance.memory API
    interface PerformanceMemory {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    }
    const perf = performance as Performance & { memory?: PerformanceMemory };
    if (perf.memory) {
      const memory = perf.memory;
      console.log('Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`
      });
    }
  }
}

export const perfMonitor = PerformanceMonitor.getInstance();

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  return () => {
    const duration = performance.now() - startTime;
    if (import.meta.env.DEV && duration > 16) {
      console.warn(`⚠️ Slow render (${componentName}): ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
