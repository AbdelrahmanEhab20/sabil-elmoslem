'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Location, PrayerTimes, UserPreferences } from '@/types';
import { useLocalStorage } from '@/hooks/usePerformance';
import { logError } from '@/utils/errorHandling';

interface UserContextType {
    location: Location | null;
    setLocation: (location: Location | null) => void;
    prayerTimes: PrayerTimes | null;
    setPrayerTimes: (times: PrayerTimes | null) => void;
    preferences: UserPreferences;
    setPreferences: (prefs: UserPreferences) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    toggleTheme: () => void;
    toggleLanguage: () => void;
    isInitialized: boolean;
    clearUserData: () => void;
    updateCalculationMethod: (method: number) => void;
    updateMadhab: (madhab: number) => void;
}

const defaultPreferences: UserPreferences = {
    calculationMethod: 1, // MWL
    madhab: 1, // Shafi
    theme: 'light',
    language: 'ar'
};

const defaultContextValue: UserContextType = {
    location: null,
    setLocation: () => { },
    prayerTimes: null,
    setPrayerTimes: () => { },
    preferences: defaultPreferences,
    setPreferences: () => { },
    loading: false,
    setLoading: () => { },
    toggleTheme: () => { },
    toggleLanguage: () => { },
    isInitialized: false,
    clearUserData: () => { },
    updateCalculationMethod: () => { },
    updateMadhab: () => { }
};

const UserContext = createContext<UserContextType>(defaultContextValue);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === defaultContextValue) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    // Use custom localStorage hook for better error handling
    const [storedPreferences, setStoredPreferences] = useLocalStorage<UserPreferences>(
        'userPreferences',
        defaultPreferences
    );

    const [storedLocation, setStoredLocation] = useLocalStorage<Location | null>(
        'userLocation',
        null
    );

    // State management
    const [location, setLocationState] = useState<Location | null>(storedLocation);
    const [prayerTimes, setPrayerTimesState] = useState<PrayerTimes | null>(null);
    const [preferences, setPreferencesState] = useState<UserPreferences>(storedPreferences);
    const [loading, setLoadingState] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Memoized setters to prevent unnecessary re-renders
    const setLocation = useCallback((newLocation: Location | null) => {
        setLocationState(newLocation);
        setStoredLocation(newLocation);
    }, [setStoredLocation]);

    const setPrayerTimes = useCallback((newPrayerTimes: PrayerTimes | null) => {
        setPrayerTimesState(newPrayerTimes);
    }, []);

    const setPreferences = useCallback((newPreferences: UserPreferences | ((prev: UserPreferences) => UserPreferences)) => {
        setPreferencesState(newPreferences);
        setStoredPreferences(newPreferences);
    }, [setStoredPreferences]);

    const setLoading = useCallback((newLoading: boolean) => {
        setLoadingState(newLoading);
    }, []);

    // Theme management
    const toggleTheme = useCallback(() => {
        setPreferences((prev: UserPreferences) => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
        }));
    }, [setPreferences]);

    // Language management
    const toggleLanguage = useCallback(() => {
        setPreferences((prev: UserPreferences) => ({
            ...prev,
            language: prev.language === 'en' ? 'ar' : 'en'
        }));
    }, [setPreferences]);

    // Calculation method management
    const updateCalculationMethod = useCallback((method: number) => {
        setPreferences((prev: UserPreferences) => ({
            ...prev,
            calculationMethod: method
        }));
    }, [setPreferences]);

    // Madhab management
    const updateMadhab = useCallback((madhab: number) => {
        setPreferences((prev: UserPreferences) => ({
            ...prev,
            madhab
        }));
    }, [setPreferences]);

    // Clear all user data
    const clearUserData = useCallback(() => {
        setLocation(null);
        setPrayerTimes(null);
        setPreferences(defaultPreferences);
        setLoading(false);

        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userPreferences');
            localStorage.removeItem('userLocation');
        }
    }, [setLocation, setPrayerTimes, setPreferences, setLoading]);

    // Apply theme to document
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(preferences.theme);
        }
    }, [preferences.theme]);

    // Apply language direction to document
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const html = document.documentElement;
            html.lang = preferences.language;
            html.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
        }
    }, [preferences.language]);

    // Initialize context
    useEffect(() => {
        try {
            // Validate stored preferences
            if (storedPreferences) {
                const validPreferences: UserPreferences = {
                    calculationMethod: typeof storedPreferences.calculationMethod === 'number'
                        ? storedPreferences.calculationMethod
                        : defaultPreferences.calculationMethod,
                    madhab: typeof storedPreferences.madhab === 'number'
                        ? storedPreferences.madhab
                        : defaultPreferences.madhab,
                    theme: ['light', 'dark'].includes(storedPreferences.theme)
                        ? storedPreferences.theme
                        : defaultPreferences.theme,
                    language: ['en', 'ar'].includes(storedPreferences.language)
                        ? storedPreferences.language
                        : defaultPreferences.language
                };

                if (JSON.stringify(validPreferences) !== JSON.stringify(storedPreferences)) {
                    setStoredPreferences(validPreferences);
                }
            }

            // Validate stored location
            if (storedLocation) {
                if (typeof storedLocation.latitude === 'number' &&
                    typeof storedLocation.longitude === 'number' &&
                    storedLocation.latitude >= -90 && storedLocation.latitude <= 90 &&
                    storedLocation.longitude >= -180 && storedLocation.longitude <= 180) {
                    setLocationState(storedLocation);
                } else {
                    // Invalid location data, clear it
                    setStoredLocation(null);
                    logError(new Error('Invalid location data in localStorage'), 'UserContext', { storedLocation });
                }
            }

            setIsInitialized(true);
        } catch (error) {
            logError(error as Error, 'UserContext initialization');
            // Reset to defaults on error
            setStoredPreferences(defaultPreferences);
            setStoredLocation(null);
            setIsInitialized(true);
        }
    }, [storedPreferences, storedLocation, setStoredPreferences, setStoredLocation]);

    // Memoized context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        location,
        setLocation,
        prayerTimes,
        setPrayerTimes,
        preferences,
        setPreferences,
        loading,
        setLoading,
        toggleTheme,
        toggleLanguage,
        isInitialized,
        clearUserData,
        updateCalculationMethod,
        updateMadhab
    }), [
        location,
        setLocation,
        prayerTimes,
        setPrayerTimes,
        preferences,
        setPreferences,
        loading,
        setLoading,
        toggleTheme,
        toggleLanguage,
        isInitialized,
        clearUserData,
        updateCalculationMethod,
        updateMadhab
    ]);

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
}; 