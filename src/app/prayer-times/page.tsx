'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { fetchPrayerTimes, getCurrentLocation, searchCityCoordinates } from '@/utils/api';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';

export default function PrayerTimesPage() {
    const { location, setLocation, prayerTimes, setPrayerTimes, loading, setLoading, preferences } = useUser();
    const [searchCity, setSearchCity] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [timeUntilNext, setTimeUntilNext] = useState<string>('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const t = useTranslations(preferences.language);
    const toast = useToast();

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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

    // Fetch prayer times when location changes
    useEffect(() => {
        const getPrayerTimes = async () => {
            if (location) {
                try {
                    setLoading(true);
                    const times = await fetchPrayerTimes(location, preferences.calculationMethod, preferences.madhab);
                    setPrayerTimes(times);
                } catch {
                    toast.showToast({ type: 'error', message: t.errorFetchingPrayerTimes });
                } finally {
                    setLoading(false);
                }
            }
        };

        getPrayerTimes();
    }, [location, preferences.calculationMethod, preferences.madhab, setPrayerTimes, setLoading, t.errorFetchingPrayerTimes, toast]);

    // Calculate next prayer and time until
    useEffect(() => {
        if (prayerTimes) {
            const prayers = [
                { name: 'Fajr', time: prayerTimes.Fajr },
                { name: 'Sunrise', time: prayerTimes.Sunrise },
                { name: 'Dhuhr', time: prayerTimes.Dhuhr },
                { name: 'Asr', time: prayerTimes.Asr },
                { name: 'Maghrib', time: prayerTimes.Maghrib },
                { name: 'Isha', time: prayerTimes.Isha }
            ];

            const now = currentTime;
            const currentTimeString = now.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });

            let next = prayers.find(prayer => prayer.time > currentTimeString);
            if (!next) {
                next = prayers[0]; // If no prayer found, next is tomorrow's Fajr
            }

            setNextPrayer(next.name);

            // Calculate time until next prayer
            const [nextHours, nextMinutes] = next.time.split(':').map(Number);
            const nextPrayerTime = new Date();
            nextPrayerTime.setHours(nextHours, nextMinutes, 0, 0);

            if (nextPrayerTime <= now) {
                nextPrayerTime.setDate(nextPrayerTime.getDate() + 1);
            }

            const diff = nextPrayerTime.getTime() - now.getTime();
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeUntilNext(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
    }, [prayerTimes, currentTime]);

    const handleLocationSearch = async () => {
        if (!searchCity.trim()) return;
        try {
            setSearchLoading(true);
            const cityLocation = await searchCityCoordinates(searchCity, preferences.language);
            setLocation(cityLocation);
            setSearchCity('');
            toast.showToast({ type: 'success', message: t.locationSet });
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : t.cityNotFound;
            toast.showToast({ type: 'error', message: errorMessage });
        } finally {
            setSearchLoading(false);
        }
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
        return date.toLocaleTimeString(preferences.language === 'ar' ? 'ar-SA' : 'en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getPrayerName = (name: string) => {
        switch (name) {
            case 'Fajr': return t.fajr;
            case 'Sunrise': return t.sunrise;
            case 'Dhuhr': return t.dhuhr;
            case 'Asr': return t.asr;
            case 'Maghrib': return t.maghrib;
            case 'Isha': return t.isha;
            default: return name;
        }
    };

    const prayerList = [
        { name: 'Fajr', time: prayerTimes?.Fajr, icon: '🌅', description: t.fajr },
        { name: 'Sunrise', time: prayerTimes?.Sunrise, icon: '☀️', description: t.sunrise },
        { name: 'Dhuhr', time: prayerTimes?.Dhuhr, icon: '🌞', description: t.dhuhr },
        { name: 'Asr', time: prayerTimes?.Asr, icon: '🌅', description: t.asr },
        { name: 'Maghrib', time: prayerTimes?.Maghrib, icon: '🌆', description: t.maghrib },
        { name: 'Isha', time: prayerTimes?.Isha, icon: '🌙', description: t.isha }
    ];

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t.prayerTimes}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t.prayerTimesDescription}
                    </p>
                </div>

                {/* Location Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t.location}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                {location.city && location.country
                                                    ? `${location.city}, ${location.country}`
                                                    : location.city
                                                        ? location.city
                                                        : preferences.language === 'ar' ? 'موقع محدد' : 'Location Set'
                                                }
                                            </span>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    {preferences.language === 'ar' ? 'البحث عن مدينة' : 'Search City'}
                                </label>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={searchCity}
                                        onChange={(e) => setSearchCity(e.target.value)}
                                        placeholder={preferences.language === 'ar' ? 'ابحث عن مدينة...' : 'Search for a city...'}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                                        disabled={searchLoading}
                                    />
                                    <button
                                        onClick={handleLocationSearch}
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
                </div>

                {/* Next Prayer Countdown */}
                {nextPrayer && (
                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg p-6 mb-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">
                                {t.nextPrayer}: {getPrayerName(nextPrayer)}
                            </h2>
                            <div className="text-4xl font-mono font-bold mb-2">
                                {timeUntilNext}
                            </div>
                            <p className="text-green-100">
                                {t.timeRemaining}
                            </p>
                        </div>
                    </div>
                )}

                {/* Prayer Times Grid */}
                {loading ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : prayerTimes ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                            {t.prayerTimes}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {prayerList.map((prayer) => (
                                <div
                                    key={prayer.name}
                                    className={`p-4 rounded-lg border transition-colors duration-200 ${nextPrayer === prayer.name
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                        }`}
                                >
                                    <div className="text-center">
                                        <div className="text-2xl mb-2">{prayer.icon}</div>
                                        <h3 className={`font-semibold mb-1 ${nextPrayer === prayer.name
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {prayer.description}
                                        </h3>
                                        <p className={`font-mono text-lg ${nextPrayer === prayer.name
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {prayer.time ? formatTime(prayer.time) : '--:--'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                        <div className="text-6xl mb-4">🕌</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {preferences.language === 'ar' ? 'أوقات الصلاة' : 'Prayer Times'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {preferences.language === 'ar'
                                ? 'حدد موقعك لعرض أوقات الصلاة'
                                : 'Set your location to view prayer times'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 