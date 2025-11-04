import { useState, useCallback, useRef } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useTranslations } from '@/utils/translations';
import { getErrorMessage } from '@/utils/errorHandling';
import { useUser } from '@/contexts/UserContext';

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    showToast?: boolean;
    toastMessage?: string;
    retryOnError?: boolean;
    maxRetries?: number;
}

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    retryCount: number;
}

export function useApi<T>(
    apiFunction: (...args: unknown[]) => Promise<T>,
    options: UseApiOptions<T> = {}
) {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const toast = useToast();
    const abortControllerRef = useRef<AbortController | null>(null);

    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
        retryCount: 0
    });

    const execute = useCallback(async (...args: unknown[]): Promise<T | null> => {
        // Cancel previous request if still pending
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        setState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const result = await apiFunction(...args);

            setState(prev => ({
                ...prev,
                data: result,
                loading: false,
                retryCount: 0
            }));

            options.onSuccess?.(result);

            if (options.showToast && options.toastMessage) {
                toast.showToast({ type: 'success', message: options.toastMessage });
            }

            return result;
        } catch (error) {
            const errorObj = error as Error;

            // Don't show error toast for aborted requests
            if (errorObj.name === 'AbortError') {
                return null;
            }

            setState(prev => ({
                ...prev,
                error: errorObj,
                loading: false
            }));

            options.onError?.(errorObj);

            if (options.showToast !== false) {
                const errorMessage = getErrorMessage(errorObj, preferences.language);
                toast.showToast({ type: 'error', message: errorMessage });
            }

            throw errorObj;
        }
    }, [apiFunction, options, preferences.language, toast]);

    const retry = useCallback(async (...args: unknown[]): Promise<T | null> => {
        const maxRetries = options.maxRetries || 3;

        if (state.retryCount >= maxRetries) {
            toast.showToast({
                type: 'error',
                message: t.error || 'Maximum retry attempts reached'
            });
            return null;
        }

        setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
        return execute(...args);
    }, [execute, state.retryCount, options.maxRetries, toast, t.error]);

    const reset = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setState({
            data: null,
            loading: false,
            error: null,
            retryCount: 0
        });
    }, []);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        setState(prev => ({ ...prev, loading: false }));
    }, []);

    return {
        ...state,
        execute,
        retry,
        reset,
        cancel
    };
}

// Specialized hooks for common API patterns
export function usePrayerTimes() {
    const { preferences } = useUser();

    return useApi(
        async (...args: unknown[]) => {
            const [location, useAutoTimezone = true] = args;
            const { fetchPrayerTimes } = await import('@/utils/api');
            return fetchPrayerTimes(
                location as { latitude: number; longitude: number },
                preferences.calculationMethod,
                preferences.madhab,
                useAutoTimezone as boolean
            );
        },
        {
            showToast: false
        }
    );
}

export function useAzkar() {
    const { preferences } = useUser();

    return useApi(
        async () => {
            const { fetchAzkar } = await import('@/utils/api');
            return fetchAzkar(preferences.language);
        },
        {
            showToast: false
        }
    );
}

export function useQuranSurahs() {
    return useApi(
        async () => {
            const { fetchQuranSurahs } = await import('@/utils/api');
            return fetchQuranSurahs();
        },
        {
            showToast: false
        }
    );
}

export function useQuranAyahs() {
    return useApi(
        async (...args: unknown[]) => {
            const { fetchQuranAyahs } = await import('@/utils/api');
            const surahNumber = args[0] as number;
            return fetchQuranAyahs(surahNumber);
        },
        {
            showToast: false
        }
    );
}

// Tajweed-related hooks - HASHED FOR NOW
// export function useQuranAyahsWithTajweed() {
//     return useApi(
//         async (...args: unknown[]) => {
//             const { fetchQuranAyahsWithTajweed } = await import('@/utils/api');
//             const surahNumber = args[0] as number;
//             return fetchQuranAyahsWithTajweed(surahNumber);
//         },
//         {
//             showToast: false
//         }
//     );
// }

export function useLocation() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);

    return useApi(
        async () => {
            const { getCurrentLocation } = await import('@/utils/api');
            return getCurrentLocation();
        },
        {
            showToast: true,
            toastMessage: t.locationSet || 'Location set successfully'
        }
    );
}

export function useCitySearch() {
    const { preferences } = useUser();

    return useApi(
        async (...args: unknown[]) => {
            const { searchCityCoordinates } = await import('@/utils/api');
            const cityName = args[0] as string;
            return searchCityCoordinates(cityName, preferences.language);
        },
        {
            showToast: false
        }
    );
}

export function useCitySuggestions() {
    const { preferences } = useUser();

    return useApi(
        async (...args: unknown[]) => {
            const { getCitySuggestions } = await import('@/utils/api');
            const [query, limit] = args as [string, number?];
            return getCitySuggestions(query, preferences.language, limit);
        },
        {
            showToast: false
        }
    );
} 