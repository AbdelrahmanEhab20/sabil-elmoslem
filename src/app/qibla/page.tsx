'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { getCurrentLocation, searchCityCoordinates, getCitySuggestions } from '@/utils/api';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';
import { Location } from '@/types';
import QiblaCompass from '@/components/QiblaCompass';

export default function QiblaPage() {
    const { location, setLocation, preferences } = useUser();
    const [searchCity, setSearchCity] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string; coordinates: [number, number] }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const t = useTranslations(preferences.language);
    const toast = useToast();

    // Get location on mount if not available
    useEffect(() => {
        const initializeLocation = async () => {
            if (!location) {
                try {
                    setLocationLoading(true);
                    const userLocation = await getCurrentLocation();
                    setLocation(userLocation);
                } catch {
                    toast.showToast({ type: 'error', message: t.errorGettingLocation });
                } finally {
                    setLocationLoading(false);
                }
            }
        };

        initializeLocation();
    }, [location, setLocation, t.errorGettingLocation, toast]);

    // Enhanced city search with suggestions
    const handleCityInputChange = useCallback(async (value: string) => {
        setSearchCity(value);

        if (value.trim().length >= 2) {
            try {
                const suggestions = await getCitySuggestions(value, preferences.language, 5);
                setCitySuggestions(suggestions);
                setShowSuggestions(suggestions.length > 0);
            } catch (error) {
                console.warn('Failed to get city suggestions:', error);
                setCitySuggestions([]);
                setShowSuggestions(false);
            }
        } else {
            setCitySuggestions([]);
            setShowSuggestions(false);
        }
    }, [preferences.language]);

    const handleLocationSearch = async (cityName?: string) => {
        const searchTerm = cityName || searchCity.trim();
        if (!searchTerm) return;

        try {
            setSearchLoading(true);
            const cityLocation = await searchCityCoordinates(searchTerm, preferences.language);
            setLocation(cityLocation);
            setSearchCity('');
            setShowSuggestions(false);
            toast.showToast({ type: 'success', message: t.locationSet });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t.cityNotFound;
            toast.showToast({ type: 'error', message: errorMessage });
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion: { name: string; country: string; coordinates: [number, number] }) => {
        const newLocation: Location = {
            latitude: suggestion.coordinates[0],
            longitude: suggestion.coordinates[1],
            city: suggestion.name,
            country: suggestion.country
        };
        setLocation(newLocation);
        setSearchCity('');
        setShowSuggestions(false);
        toast.showToast({ type: 'success', message: t.locationSet });
    };

    const handleUseCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const userLocation = await getCurrentLocation();
            setLocation(userLocation);
            toast.showToast({ type: 'success', message: t.locationSet });
        } catch {
            toast.showToast({ type: 'error', message: t.errorGettingLocation });
        } finally {
            setLocationLoading(false);
        }
    };

    const isArabic = preferences.language === 'ar';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Header */}
            <section className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white py-12 md:py-16 overflow-hidden">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 8.5L51.5 30L30 51.5L8.5 30L30 8.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <span className="text-3xl">🕋</span>
                    </motion.div>
                    <motion.h1
                        className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isArabic ? 'font-arabic-display' : ''}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {isArabic ? 'اتجاه القبلة' : 'Qibla Direction'}
                    </motion.h1>
                    <motion.p
                        className={`text-lg md:text-xl text-amber-100 max-w-2xl mx-auto ${isArabic ? 'font-arabic-body' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        {isArabic
                            ? 'اعرف اتجاه القبلة من موقعك الحالي'
                            : 'Find the direction of Qibla from your current location'}
                    </motion.p>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 30L60 25C120 20 240 10 360 15C480 20 600 40 720 45C840 50 960 40 1080 30C1200 20 1320 10 1380 5L1440 0V60H0V30Z" className="fill-gray-50 dark:fill-gray-900" />
                    </svg>
                </div>
            </section>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Location Settings Card */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 sm:p-7 mb-8"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <h2 className={`text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-3 ${isArabic ? 'font-arabic-display' : ''}`}>
                        <span className="w-8 h-1 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full" />
                        {t.location}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Current Location Display */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                {preferences.language === 'ar' ? 'الموقع الحالي' : 'Current Location'}
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                {locationLoading ? (
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {preferences.language === 'ar' ? 'جاري تحديد الموقع...' : 'Getting location...'}
                                        </span>
                                    </div>
                                ) : location ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {location.city && location.country
                                                        ? `${location.city}, ${location.country}`
                                                        : location.city
                                                            ? location.city
                                                            : preferences.language === 'ar' ? 'موقع محدد' : 'Location Set'}
                                                </span>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                    {`${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            {preferences.language === 'ar' ? 'لم يتم تحديد الموقع' : 'No location set'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Location Search */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {preferences.language === 'ar' ? 'البحث عن مدينة' : 'Search City'}
                                </label>
                                <div className="space-y-2 relative">
                                    <input
                                        type="text"
                                        value={searchCity}
                                        onChange={(e) => handleCityInputChange(e.target.value)}
                                        placeholder={preferences.language === 'ar' ? 'ابحث عن مدينة...' : 'Search for a city...'}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                                        onFocus={() => setShowSuggestions(citySuggestions.length > 0)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        disabled={searchLoading}
                                    />

                                    {/* City Suggestions Dropdown */}
                                    {showSuggestions && citySuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            {citySuggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(suggestion)}
                                                    className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none first:rounded-t-md last:rounded-b-md"
                                                >
                                                    <div className="text-sm text-gray-900 dark:text-white">
                                                        {suggestion.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {suggestion.country}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleLocationSearch()}
                                        disabled={searchLoading || !searchCity.trim()}
                                        className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                                    >
                                        {searchLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>{preferences.language === 'ar' ? 'جاري البحث...' : 'Searching...'}</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                                <span>{t.search}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={locationLoading}
                                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
                            >
                                {locationLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>{preferences.language === 'ar' ? 'جاري تحديد الموقع...' : 'Getting location...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{preferences.language === 'ar' ? 'استخدم موقعي الحالي' : 'Use My Current Location'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Qibla Compass Card */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 sm:p-8"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    {location ? (
                        <QiblaCompass
                            userLatitude={location.latitude}
                            userLongitude={location.longitude}
                            language={preferences.language}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🧭</div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {preferences.language === 'ar' ? 'حدد موقعك' : 'Set Your Location'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                                {preferences.language === 'ar'
                                    ? 'يرجى السماح بالوصول إلى موقعك أو البحث عن مدينتك لتحديد اتجاه القبلة'
                                    : 'Please allow location access or search for your city to find the Qibla direction'}
                            </p>
                            <button
                                onClick={handleUseCurrentLocation}
                                disabled={locationLoading}
                                className="mt-6 px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse mx-auto"
                            >
                                {locationLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>{preferences.language === 'ar' ? 'جاري تحديد الموقع...' : 'Getting location...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{preferences.language === 'ar' ? 'تحديد موقعي' : 'Get My Location'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </motion.div>

            </div>
        </div>
    );
}

