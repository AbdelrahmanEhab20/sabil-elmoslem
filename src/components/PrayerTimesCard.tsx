'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { fetchPrayerTimes, getCurrentLocation } from '@/utils/api';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';

export default function PrayerTimesCard() {
    const { location, setLocation, prayerTimes, setPrayerTimes, loading, setLoading, preferences } = useUser();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const [timeUntilNext, setTimeUntilNext] = useState<string>('');
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
                    const userLocation = await getCurrentLocation();
                    setLocation(userLocation);
                } catch {
                    toast.showToast({ type: 'error', message: t.errorGettingLocation });
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
                    const result = await fetchPrayerTimes(location, preferences.calculationMethod, preferences.madhab, true, false);
                    // Extract timezone info if available
                    const { ...times } = result;
                    setPrayerTimes(times);
                } catch {
                    toast.showToast({ type: 'error', message: t.errorFetchingPrayerTimes });
                } finally {
                    setLoading(false);
                }
            }
        };

        getPrayerTimes();
    }, [location, preferences.calculationMethod, preferences.madhab, preferences.language, setPrayerTimes, setLoading, t.errorFetchingPrayerTimes, toast]);

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

    const getNextPrayerName = (name: string) => {
        return getPrayerName(name);
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                <div className="animate-pulse">
                    <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4 sm:mb-6"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-12 sm:h-16 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!prayerTimes) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {t.prayerTimes}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    {t.loading}
                </p>
            </div>
        );
    }

    const prayerList = [
        {
            name: 'Fajr',
            time: prayerTimes.Fajr,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="currentColor" opacity="0.8" />
                    <path d="M17 12L18 15L21 16L18 17L17 20L16 17L13 16L16 15L17 12Z" fill="currentColor" opacity="0.6" />
                </svg>
            ),
            color: 'text-indigo-600 dark:text-indigo-400'
        },
        {
            name: 'Sunrise',
            time: prayerTimes.Sunrise,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <path d="M12 2V4M12 20V22M4 12H2M6.31412 6.31412L4.8999 4.8999M17.6859 6.31412L19.1001 4.8999M6.31412 17.69L4.8999 19.1042M17.6859 17.69L19.1001 19.1042M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: 'text-yellow-600 dark:text-yellow-400'
        },
        {
            name: 'Dhuhr',
            time: prayerTimes.Dhuhr,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" fill="currentColor" />
                    <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            ),
            color: 'text-orange-600 dark:text-orange-400'
        },
        {
            name: 'Asr',
            time: prayerTimes.Asr,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.7" />
                    <path d="M12 4V2M20 12H22M12 20V22M4 12H2M17.66 6.34L19.07 4.93M6.34 6.34L4.93 4.93M17.66 17.66L19.07 19.07M6.34 17.66L4.93 19.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                </svg>
            ),
            color: 'text-amber-600 dark:text-amber-400'
        },
        {
            name: 'Maghrib',
            time: prayerTimes.Maghrib,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18Z" fill="currentColor" opacity="0.3" />
                    <path d="M12 2V4M20.485 4.929L19.071 6.343M22 12H20M19.071 17.657L20.485 19.071M12 20V22M4.929 19.071L6.343 17.657M2 12H4M4.929 4.929L6.343 6.343" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                    <rect x="2" y="20" width="20" height="2" rx="1" fill="currentColor" opacity="0.5" />
                </svg>
            ),
            color: 'text-rose-600 dark:text-rose-400'
        },
        {
            name: 'Isha',
            time: prayerTimes.Isha,
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79Z" fill="currentColor" />
                    <circle cx="17" cy="7" r="1.5" fill="currentColor" opacity="0.8" />
                    <circle cx="19" cy="10" r="1" fill="currentColor" opacity="0.6" />
                    <circle cx="15" cy="5" r="0.8" fill="currentColor" opacity="0.7" />
                </svg>
            ),
            color: 'text-blue-600 dark:text-blue-400'
        }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {t.prayerTimes}
                </h3>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {currentTime.toLocaleDateString(preferences.language === 'ar' ? 'ar-SA' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {nextPrayer && (
                <div className="mb-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                        {t.nextPrayer}: <span className="font-semibold">{getNextPrayerName(nextPrayer)}</span>
                    </p>
                    <div className="text-xl sm:text-2xl font-mono font-bold text-green-700 dark:text-green-200">
                        {timeUntilNext}
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-200 mt-1">
                        {t.timeRemaining || 'الوقت المتبقي'}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                {prayerList.map((prayer) => (
                    <div
                        key={prayer.name}
                        className={`p-3 rounded-lg border transition-colors duration-200 ${nextPrayer === prayer.name
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                <span className={`${prayer.color} flex-shrink-0`}>{prayer.icon}</span>
                                <span className={`font-medium text-sm ${nextPrayer === prayer.name
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {getPrayerName(prayer.name)}
                                </span>
                            </div>
                            <span className={`font-mono text-sm ml-2 ${nextPrayer === prayer.name
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                {formatTime(prayer.time)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                {/* {t.loading} */}
                <p>Prayer times calculated using Aladhan API</p>
            </div>
        </div>
    );
} 