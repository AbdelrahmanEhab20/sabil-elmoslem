'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { fetchPrayerTimes, getCurrentLocation, searchCityCoordinates, getCitySuggestions } from '@/utils/api';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';
import { shouldApplyEgyptDST, calculateTimeDifference, formatTimeDifference, getCurrentTimeString } from '@/utils/dateTime';
import { findNextPrayer, getPrayerNameTranslated } from '@/utils/prayerHelpers';
import { ANIMATION_DURATIONS } from '@/utils/constants';
import { PrayerTimes, Location } from '@/types';

export default function PrayerTimesPage() {
    const { location, setLocation, prayerTimes, setPrayerTimes, loading, setLoading, preferences } = useUser();
    const [searchCity, setSearchCity] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [timeUntilNext, setTimeUntilNext] = useState<string>('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [isDSTActive, setIsDSTActive] = useState(false);
    const [useAutoTimezone, setUseAutoTimezone] = useState<boolean>(true);
    const [applyEgyptDST] = useState<boolean>(false);
    const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string; coordinates: [number, number] }>>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [timezoneInfo, setTimezoneInfo] = useState<{
        timezone?: string;
        abbreviation?: string;
        isDst?: boolean;
        utcOffset?: number;
        dstOffset?: number;
    } | null>(null);
    const t = useTranslations(preferences.language);
    const toast = useToast();

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate DST status for Egypt
    useEffect(() => {
        if (location) {
            setIsDSTActive(shouldApplyEgyptDST(location));
        } else {
            setIsDSTActive(false);
        }
    }, [location]);

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

    // Enhanced prayer times fetching with timezone support
    useEffect(() => {
        const getPrayerTimes = async () => {
            if (location) {
                try {
                    setLoading(true);

                    // Check if Egypt DST should be applied
                    const shouldApplyDST = shouldApplyEgyptDST(location);

                    const result = await fetchPrayerTimes(
                        location,
                        preferences.calculationMethod,
                        preferences.madhab,
                        false, // Disable auto timezone for Egypt to use manual DST
                        shouldApplyDST
                    );

                    // Extract timezone info if available
                    const { timezoneInfo: tz, ...times } = result;
                    setPrayerTimes(times as PrayerTimes);
                    setTimezoneInfo(tz || null);

                } catch (error) {
                    console.error('Failed to fetch prayer times:', error);
                    toast.showToast({ type: 'error', message: t.errorFetchingPrayerTimes });
                } finally {
                    setLoading(false);
                }
            }
        };

        getPrayerTimes();
    }, [location, preferences.calculationMethod, preferences.madhab, preferences.language, useAutoTimezone, applyEgyptDST, isDSTActive, setPrayerTimes, setLoading, t.errorFetchingPrayerTimes, toast]);

    // Calculate next prayer and time until
    useEffect(() => {
        if (prayerTimes) {
            const nextPrayerInfo = findNextPrayer(prayerTimes, getCurrentTimeString());

            if (nextPrayerInfo) {
                setNextPrayer(nextPrayerInfo.name);

                // Calculate time until next prayer
                const timeDiff = calculateTimeDifference(nextPrayerInfo.time, currentTime);
                setTimeUntilNext(formatTimeDifference(timeDiff.hours, timeDiff.minutes, timeDiff.seconds));
            }
        }
    }, [prayerTimes, currentTime]);

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
        const location: Location = {
            latitude: suggestion.coordinates[0],
            longitude: suggestion.coordinates[1],
            city: suggestion.name,
            country: suggestion.country
        };
        setLocation(location);
        setSearchCity('');
        setShowSuggestions(false);
        toast.showToast({ type: 'success', message: t.locationSet });
    };

    const handleUseCurrentLocation = async () => {
        try {
            setLocationLoading(true);
            const userLocation = await getCurrentLocation();
            setLocation(userLocation);
        } catch {
            toast.showToast({ type: 'error', message: t.errorGettingLocation });
        } finally {
            setLocationLoading(false);
        }
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0);
        // Always use hour12 and show AM/PM marker
        const locale = preferences.language === 'ar' ? 'ar-EG' : 'en-US';
        const formatted = date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        // For Arabic, ensure ص/م is separated for styling
        if (preferences.language === 'ar') {
            // Split time and marker
            const match = formatted.match(/^(.*?)(\s*[صم])$/);
            if (match) {
                return (
                    <span className="inline-flex items-baseline gap-1">
                        <span>{match[1].trim()}</span>
                        <span className="text-xs font-bold text-gray-400 align-baseline">{match[2].trim()}</span>
                    </span>
                );
            }
        }
        return formatted;
    };

    const getPrayerName = (name: string) => {
        return getPrayerNameTranslated(name, t);
    };

    // Simple prayer times with clean icons
    const prayerList = [
        {
            name: 'Fajr',
            time: prayerTimes?.Fajr,
            description: t.fajr,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" />
                </svg>
            ),
            color: 'text-indigo-600 dark:text-indigo-400'
        },
        {
            name: 'Sunrise',
            time: prayerTimes?.Sunrise,
            description: t.sunrise,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            name: 'Dhuhr',
            time: prayerTimes?.Dhuhr,
            description: t.dhuhr,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: 'text-orange-600 dark:text-orange-400'
        },
        {
            name: 'Asr',
            time: prayerTimes?.Asr,
            description: t.asr,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <path d="M12 4V2M20 12H22M12 20V22M4 12H2M17.66 6.34L19.07 4.93M6.34 6.34L4.93 4.93M17.66 17.66L19.07 19.07M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            ),
            color: 'text-amber-600 dark:text-amber-400'
        },
        {
            name: 'Maghrib',
            time: prayerTimes?.Maghrib,
            description: t.maghrib,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z" fill="currentColor" opacity="0.3" />
                    <path d="M12 2V4M20.485 4.929L19.071 6.343M22 12H20M19.071 17.657L20.485 19.071M12 20V22M4.929 19.071L6.343 17.657M2 12H4M4.929 4.929L6.343 6.343" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.5" />
                </svg>
            ),
            color: 'text-rose-600 dark:text-rose-400'
        },
        {
            name: 'Isha',
            time: prayerTimes?.Isha,
            description: t.isha,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" fill="currentColor" />
                    <circle cx="17" cy="7" r="1.5" fill="currentColor" opacity="0.8" />
                    <circle cx="19" cy="10" r="1" fill="currentColor" opacity="0.6" />
                </svg>
            ),
            color: 'text-blue-600 dark:text-blue-400'
        }
    ];

    return (
        <div className="min-h-screen py-4 sm:py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <motion.h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        {t.prayerTimes}
                    </motion.h1>
                    <motion.p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 px-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        {t.prayerTimesDescription}
                    </motion.p>
                    {location && shouldApplyEgyptDST(location) && (
                        <motion.p className="text-sm text-green-600 dark:text-green-400 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            {preferences.language === 'ar'
                                ? '⏰ التوقيت الصيفي مصر مفعل - تم تعديل أوقات الصلاة (+1 ساعة)'
                                : '⏰ Egypt Summer Time Active - Prayer times adjusted (+1 hour)'
                            }
                        </motion.p>
                    )}
                </div>

                {/* Location Settings */}
                <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                        {t.location}
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                {preferences.language === 'ar' ? 'الموقع الحالي' : 'Current Location'}
                            </label>
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                {locationLoading ? (
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {preferences.language === 'ar' ? 'جاري تحديد الموقع...' : 'Getting location...'}
                                        </span>
                                    </div>
                                ) : location ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            <div className="space-y-1">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {location.city && location.country
                                                        ? `${location.city}, ${location.country}`
                                                        : location.city
                                                            ? location.city
                                                            : preferences.language === 'ar' ? 'موقع محدد' : 'Location Set'
                                                    }
                                                </span>
                                                {location.accuracy && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {preferences.language === 'ar'
                                                            ? `دقة: ${Math.round(location.accuracy)}م`
                                                            : `Accuracy: ${Math.round(location.accuracy)}m`
                                                        }
                                                    </div>
                                                )}
                                                {location.timezone && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {preferences.language === 'ar'
                                                            ? `المنطقة الزمنية: ${location.timezone}`
                                                            : `Timezone: ${location.timezone}`
                                                        }
                                                    </div>
                                                )}
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

                        <div className="space-y-4">
                            {/* Automatic Timezone Detection */}
                            <div>
                                <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <input
                                        type="checkbox"
                                        checked={useAutoTimezone}
                                        onChange={(e) => setUseAutoTimezone(e.target.checked)}
                                        className="h-4 w-4 accent-green-600"
                                    />
                                    <span>{preferences.language === 'ar' ? 'تحديد المنطقة الزمنية تلقائياً' : 'Automatic timezone detection'}</span>
                                </label>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {preferences.language === 'ar'
                                        ? 'يحدد التوقيت الصحيح والتوقيت الصيفي تلقائياً لجميع البلدان'
                                        : 'Automatically detects correct timezone and DST for all countries'}
                                </p>
                                {timezoneInfo && (
                                    <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded text-xs">
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                            </svg>
                                            <span>
                                                {timezoneInfo.timezone} ({timezoneInfo.abbreviation})
                                                {timezoneInfo.isDst && ' - DST Active'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legacy Egypt DST Toggle (only show when auto timezone is off) */}
                            {/* {!useAutoTimezone && (
                                <div>
                                    <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={applyEgyptDST}
                                            onChange={(e) => setApplyEgyptDST(e.target.checked)}
                                            className="h-4 w-4 accent-green-600"
                                        />
                                        <span>{preferences.language === 'ar' ? 'تطبيق التوقيت الصيفي لمصر فقط' : 'Apply Egypt summer time (DST) only'}</span>
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {preferences.language === 'ar'
                                            ? 'عند التفعيل: زيادة ساعة لأوقات الصلاة خلال أشهر الصيف. لا يؤثر على باقي الدول.'
                                            : 'When enabled: adds +1 hour to Egypt prayer times during summer months. Does not affect other countries.'}
                                    </p>
                                </div>
                            )} */}

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
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
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
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 rtl:space-x-reverse"
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

                {/* Next Prayer Countdown */}
                {nextPrayer && (
                    <motion.div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="text-center">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                                {t.nextPrayer}: {getPrayerName(nextPrayer)}
                            </h2>
                            <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold mb-2 sm:mb-3">
                                {timeUntilNext}
                            </div>
                            <p className="text-green-100 text-sm sm:text-base">
                                {t.timeRemaining}
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Prayer Times Grid */}
                {loading ? (
                    <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
                        <div className="animate-pulse">
                            <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4 sm:mb-6"></div>
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-16 sm:h-20 md:h-24 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : prayerTimes ? (
                    <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                            {t.prayerTimes}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {prayerList.map((prayer, index) => (
                                <motion.div
                                    key={prayer.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: ANIMATION_DURATIONS.SLOW, delay: index * 0.1 }}
                                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${nextPrayer === prayer.name
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    <div className="text-center space-y-3">
                                        {/* Simple icon */}
                                        <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center ${prayer.color} bg-gray-100 dark:bg-gray-700`}>
                                            {prayer.icon}
                                        </div>

                                        {/* Prayer name */}
                                        <h3 className={`font-semibold text-sm ${nextPrayer === prayer.name
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {prayer.description}
                                        </h3>

                                        {/* Prayer time */}
                                        <div className={`font-mono text-lg font-medium ${nextPrayer === prayer.name
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {prayer.time ? formatTime(prayer.time) : '--:--'}
                                        </div>

                                        {/* Next prayer indicator */}
                                        {nextPrayer === prayer.name && (
                                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                                {preferences.language === 'ar' ? 'التالية' : 'Next'}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sm:p-8 text-center" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                        <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🕌</div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {preferences.language === 'ar' ? 'أوقات الصلاة' : 'Prayer Times'}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                            {preferences.language === 'ar'
                                ? 'حدد موقعك لعرض أوقات الصلاة'
                                : 'Set your location to view prayer times'
                            }
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
} 