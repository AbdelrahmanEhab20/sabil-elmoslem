'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

interface TranslationProps {
    errorBoundaryTitle?: string;
    errorBoundaryMessage?: string;
    refreshPage?: string;
    tryAgain?: string;
}

class ErrorBoundaryClass extends Component<Props & { t: TranslationProps }, State> {
    constructor(props: Props & { t: TranslationProps }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo);
        }

        // Call custom error handler if provided
        this.props.onError?.(error, errorInfo);

        // In production, you might want to send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {this.props.t?.errorBoundaryTitle || 'Something went wrong'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {this.props.t?.errorBoundaryMessage || 'An unexpected error occurred. Please try refreshing the page.'}
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                            >
                                {this.props.t?.refreshPage || 'Refresh Page'}
                            </button>
                            <button
                                onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
                                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                            >
                                {this.props.t?.tryAgain || 'Try Again'}
                            </button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                                    Error Details (Development)
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper component to provide translations
export const ErrorBoundary: React.FC<Props> = ({ children, fallback, onError }) => {
    // Note: We can't use hooks in class components, so we'll use a default translation
    const defaultT: TranslationProps = {
        errorBoundaryTitle: 'Something went wrong',
        errorBoundaryMessage: 'An unexpected error occurred. Please try refreshing the page.',
        refreshPage: 'Refresh Page',
        tryAgain: 'Try Again'
    };

    return (
        <ErrorBoundaryClass t={defaultT} fallback={fallback} onError={onError}>
            {children}
        </ErrorBoundaryClass>
    );
};

export default ErrorBoundary; 