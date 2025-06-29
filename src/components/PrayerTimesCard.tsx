'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { fetchPrayerTimes, getCurrentLocation } from '@/utils/api';
import { PrayerTimes } from '@/types';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';

const PrayerTimesCard: React.FC = () => {
    const { location, setLocation, prayerTimes, setPrayerTimes, loading, setLoading, preferences } = useUser();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [nextPrayer, setNextPrayer] = useState<string | null>(null);
    const t = useTranslations(preferences.language);
    const toast = useToast();

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    // Get location and prayer times on mount
    useEffect(() => {
        const initializeLocation = async () => {
            if (!location) {
                try {
                    setLoading(true);
                    const userLocation = await getCurrentLocation();
                    setLocation(userLocation);
                } catch (error) {
                    let errorMsg = 'Unknown error';
                    let errorCode = '';
                    if (error && typeof error === 'object') {
                        errorMsg = (error as any).message || errorMsg;
                        errorCode = (error as any).code !== undefined ? ` (code: ${(error as any).code})` : '';
                    }
                    console.error(`Error getting location: ${errorMsg}${errorCode}`, error);
                    toast.showToast({ type: 'error', message: t.errorFetchingPrayerTimes });
                } finally {
                    setLoading(false);
                }
            }
        };

        initializeLocation();
    }, [location, setLocation, setLoading, toast, t]);

    // Fetch prayer times when location changes
    useEffect(() => {
        const getPrayerTimes = async () => {
            if (location) {
                try {
                    setLoading(true);
                    const times = await fetchPrayerTimes(location);
                    setPrayerTimes(times);
                } catch (error) {
                    console.error('Error fetching prayer times:', error);
                    toast.showToast({ type: 'error', message: t.errorFetchingPrayerTimes });
                } finally {
                    setLoading(false);
                }
            }
        };

        getPrayerTimes();
    }, [location, setPrayerTimes, setLoading, toast, t]);

    // Calculate next prayer
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
        }
    }, [prayerTimes, currentTime]);

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
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200">
                        {t.nextPrayer}: <span className="font-semibold">{getNextPrayerName(nextPrayer)}</span>
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
};

export default PrayerTimesCard; 