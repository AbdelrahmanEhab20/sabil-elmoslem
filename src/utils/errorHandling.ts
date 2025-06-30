import { ErrorInfo } from 'react';

// Custom error classes for better error handling
export class ApiError extends Error {
    constructor(
        message: string,
        public status?: number,
        public code?: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends Error {
    constructor(message: string, public originalError?: Error) {
        super(message);
        this.name = 'NetworkError';
    }
}

export class ValidationError extends Error {
    constructor(message: string, public field?: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class LocationError extends Error {
    constructor(message: string, public code?: number) {
        super(message);
        this.name = 'LocationError';
    }
}

// Error logging utility
export const logError = (error: Error, context?: string, additionalData?: unknown) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        name: error.name,
        message: error.message,
        stack: error.stack,
        context,
        additionalData,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        url: typeof window !== 'undefined' ? window.location.href : 'server'
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error logged:', errorLog);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorLog });

    return errorLog;
};

// Retry mechanism for API calls
export const retry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000,
    backoff: number = 2
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                throw lastError;
            }

            // Don't retry on certain errors
            if (error instanceof ValidationError || error instanceof LocationError) {
                throw error;
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
        }
    }

    throw lastError!;
};

// Error message mapping
export const getErrorMessage = (error: Error, language: 'en' | 'ar' = 'en'): string => {
    const errorMessages = {
        en: {
            network: 'Network connection failed. Please check your internet connection.',
            timeout: 'Request timed out. Please try again.',
            server: 'Server error occurred. Please try again later.',
            notFound: 'The requested resource was not found.',
            unauthorized: 'You are not authorized to access this resource.',
            forbidden: 'Access to this resource is forbidden.',
            validation: 'Invalid data provided. Please check your input.',
            location: 'Unable to get your location. Please allow location access or search for a city.',
            default: 'An unexpected error occurred. Please try again.'
        },
        ar: {
            network: 'فشل الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.',
            timeout: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى.',
            server: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقًا.',
            notFound: 'لم يتم العثور على المورد المطلوب.',
            unauthorized: 'غير مصرح لك بالوصول إلى هذا المورد.',
            forbidden: 'الوصول إلى هذا المورد محظور.',
            validation: 'بيانات غير صالحة. يرجى التحقق من المدخلات.',
            location: 'تعذر الحصول على موقعك. يرجى السماح بالوصول إلى الموقع أو البحث عن مدينة.',
            default: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
        }
    };

    const messages = errorMessages[language];

    if (error instanceof NetworkError) {
        return messages.network;
    }

    if (error instanceof ApiError) {
        switch (error.status) {
            case 404:
                return messages.notFound;
            case 401:
                return messages.unauthorized;
            case 403:
                return messages.forbidden;
            case 422:
                return messages.validation;
            case 500:
            case 502:
            case 503:
                return messages.server;
            default:
                return error.message || messages.default;
        }
    }

    if (error instanceof ValidationError) {
        return messages.validation;
    }

    if (error instanceof LocationError) {
        return messages.location;
    }

    return error.message || messages.default;
};

// Async error wrapper
export const withErrorHandling = <T extends unknown[], R>(
    fn: (...args: T) => Promise<R>,
    context?: string
) => {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            logError(error as Error, context, { args });
            throw error;
        }
    };
};

// Error boundary error handler
export const handleErrorBoundaryError = (error: Error, errorInfo: ErrorInfo) => {
    logError(error, 'ErrorBoundary', { errorInfo });

    // You can add additional error reporting logic here
    // Example: Send to analytics, error tracking service, etc.
}; 