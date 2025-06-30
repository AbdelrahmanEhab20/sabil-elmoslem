// Performance monitoring utility
export class PerformanceMonitor {
    private static instance: PerformanceMonitor;
    private metrics: Map<string, number[]> = new Map();
    private marks: Map<string, number> = new Map();

    private constructor() { }

    static getInstance(): PerformanceMonitor {
        if (!PerformanceMonitor.instance) {
            PerformanceMonitor.instance = new PerformanceMonitor();
        }
        return PerformanceMonitor.instance;
    }

    // Start timing an operation
    startTimer(name: string): void {
        this.marks.set(name, performance.now());
    }

    // End timing an operation and record the duration
    endTimer(name: string): number {
        const startTime = this.marks.get(name);
        if (!startTime) {
            console.warn(`Timer '${name}' was not started`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.marks.delete(name);

        // Store the metric
        if (!this.metrics.has(name)) {
            this.metrics.set(name, []);
        }
        this.metrics.get(name)!.push(duration);

        // Log in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
        }

        return duration;
    }

    // Get average duration for a metric
    getAverageDuration(name: string): number {
        const durations = this.metrics.get(name);
        if (!durations || durations.length === 0) return 0;

        const sum = durations.reduce((acc, duration) => acc + duration, 0);
        return sum / durations.length;
    }

    // Get all metrics
    getMetrics(): Record<string, { count: number; average: number; min: number; max: number }> {
        const result: Record<string, { count: number; average: number; min: number; max: number }> = {};

        for (const [name, durations] of this.metrics.entries()) {
            if (durations.length > 0) {
                const sum = durations.reduce((acc, duration) => acc + duration, 0);
                result[name] = {
                    count: durations.length,
                    average: sum / durations.length,
                    min: Math.min(...durations),
                    max: Math.max(...durations)
                };
            }
        }

        return result;
    }

    // Clear all metrics
    clearMetrics(): void {
        this.metrics.clear();
        this.marks.clear();
    }

    // Measure function execution time
    async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
        this.startTimer(name);
        try {
            const result = await fn();
            this.endTimer(name);
            return result;
        } catch (error) {
            this.endTimer(name);
            throw error;
        }
    }

    // Measure synchronous function execution time
    measureSync<T>(name: string, fn: () => T): T {
        this.startTimer(name);
        try {
            const result = fn();
            this.endTimer(name);
            return result;
        } catch (error) {
            this.endTimer(name);
            throw error;
        }
    }
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// React hook for measuring component render time
export const useRenderTime = (componentName: string) => {
    const startTime = performance.now();

    return () => {
        const duration = performance.now() - startTime;
        performanceMonitor.startTimer(`${componentName}_render`);
        performanceMonitor.endTimer(`${componentName}_render`);

        if (process.env.NODE_ENV === 'development') {
            console.log(`🎨 ${componentName} render: ${duration.toFixed(2)}ms`);
        }
    };
};

// Utility to measure API call performance
export const measureApiCall = async <T>(
    name: string,
    apiCall: () => Promise<T>
): Promise<T> => {
    return performanceMonitor.measureAsync(`api_${name}`, apiCall);
};

// Utility to measure component mount time
export const useComponentMountTime = (componentName: string) => {
    const startTime = useRef(performance.now());

    useEffect(() => {
        const duration = performance.now() - startTime.current;
        performanceMonitor.startTimer(`${componentName}_mount`);
        performanceMonitor.endTimer(`${componentName}_mount`);

        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 ${componentName} mount: ${duration.toFixed(2)}ms`);
        }
    }, [componentName]);
};

// Missing imports
import { useRef, useEffect } from 'react'; 