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
                    const times = await fetchPrayerTimes(location, preferences.calculationMethod, preferences.madhab, true);
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!prayerTimes) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t.prayerTimes}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    {t.loading}
                </p>
            </div>
        );
    }

    const prayerList = [
        { name: 'Fajr', time: prayerTimes.Fajr, icon: '🌅' },
        { name: 'Sunrise', time: prayerTimes.Sunrise, icon: '☀️' },
        { name: 'Dhuhr', time: prayerTimes.Dhuhr, icon: '🌞' },
        { name: 'Asr', time: prayerTimes.Asr, icon: '🌅' },
        { name: 'Maghrib', time: prayerTimes.Maghrib, icon: '🌆' },
        { name: 'Isha', time: prayerTimes.Isha, icon: '🌃' }
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t.prayerTimes}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTime.toLocaleDateString(preferences.language === 'ar' ? 'ar-SA' : 'en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            {nextPrayer && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-1">
                        {t.nextPrayer}: <span className="font-semibold">{getNextPrayerName(nextPrayer)}</span>
                    </p>
                    <div className="text-2xl font-mono font-bold text-green-700 dark:text-green-200">
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
                                <span className="text-lg">{prayer.icon}</span>
                                <span className={`font-medium ${nextPrayer === prayer.name
                                    ? 'text-green-800 dark:text-green-200'
                                    : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {getPrayerName(prayer.name)}
                                </span>
                            </div>
                            <span className={`font-mono text-sm ${nextPrayer === prayer.name
                                ? 'text-green-800 dark:text-green-200'
                                : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                <span className="inline-block w-full text-center">{formatTime(prayer.time)}</span>
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