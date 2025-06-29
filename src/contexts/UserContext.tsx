'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Location, UserPreferences, PrayerTimes } from '@/types';

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
    toggleLanguage: () => { }
};

const UserContext = createContext<UserContextType>(defaultContextValue);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === defaultContextValue) {
        console.error('useUser must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load preferences from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPrefs = localStorage.getItem('userPreferences');
            if (savedPrefs) {
                try {
                    const parsedPrefs = JSON.parse(savedPrefs);
                    setPreferences(prev => ({ ...prev, ...parsedPrefs }));
                } catch (error) {
                    console.error('Error loading preferences:', error);
                }
            }

            const savedLocation = localStorage.getItem('userLocation');
            if (savedLocation) {
                try {
                    const parsedLocation = JSON.parse(savedLocation);
                    setLocation(parsedLocation);
                } catch (error) {
                    console.error('Error loading location:', error);
                }
            }
            setIsInitialized(true);
        }
    }, []);

    // Save preferences to localStorage when they change
    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined') {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
        }
    }, [preferences, isInitialized]);

    // Save location to localStorage when it changes
    useEffect(() => {
        if (isInitialized && typeof window !== 'undefined' && location) {
            localStorage.setItem('userLocation', JSON.stringify(location));
        }
    }, [location, isInitialized]);

    // Apply theme and language to document
    useEffect(() => {
        if (typeof document !== 'undefined') {
            // Apply theme
            document.documentElement.classList.toggle('dark', preferences.theme === 'dark');

            // Apply language direction
            document.documentElement.dir = preferences.language === 'ar' ? 'rtl' : 'ltr';
            document.documentElement.lang = preferences.language;
        }
    }, [preferences.theme, preferences.language]);

    const toggleTheme = () => {
        setPreferences(prev => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light'
        }));
    };

    const toggleLanguage = () => {
        setPreferences(prev => ({
            ...prev,
            language: prev.language === 'en' ? 'ar' : 'en'
        }));
    };

    const value: UserContextType = {
        location,
        setLocation,
        prayerTimes,
        setPrayerTimes,
        preferences,
        setPreferences,
        loading,
        setLoading,
        toggleTheme,
        toggleLanguage
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}; 