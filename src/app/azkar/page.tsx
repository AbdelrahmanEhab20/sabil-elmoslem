'use client';

import React, { useState, useEffect } from 'react';
import { fetchAzkar } from '@/utils/api';
import { Azkar } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';

export default function AzkarPage() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const [azkar, setAzkar] = useState<Azkar[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [counters, setCounters] = useState<{ [key: number]: number }>({});
    const toast = useToast();

    // Categories that should have counters (Azkar and Tasbeeh)
    const categoriesWithCounters = [
        'Morning Adhkar',
        'Evening Adhkar',
        'Post-Prayer Azkar',
        'Tasbeeh',
        'Azkar Before Sleep',
        'Azkar Upon Waking',
        'أذكار الصباح',
        'أذكار المساء',
        'أذكار بعد السلام من الصلاة المفروضة',
        'تسابيح',
        'أذكار النوم',
        'أذكار الاستيقاظ'
    ];

    // Check if a zikr should have a counter
    const shouldHaveCounter = (category: string) => {
        return categoriesWithCounters.includes(category);
    };

    // Fetch azkar on mount and when language changes
    useEffect(() => {
        const loadAzkar = async () => {
            try {
                setLoading(true);
                const azkarData = await fetchAzkar(preferences.language);
                setAzkar(azkarData);

                // Initialize counters only for categories that need them
                const initialCounters: { [key: number]: number } = {};
                azkarData.forEach(zikr => {
                    if (zikr.id && shouldHaveCounter(zikr.category)) {
                        initialCounters[zikr.id] = 0;
                    }
                });
                setCounters(initialCounters);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : t.errorLoadingAzkar;
                toast.showToast({ type: 'error', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        loadAzkar();
    }, [preferences.language, t.errorLoadingAzkar, toast]);

    // Get unique categories
    const categories = ['all', ...Array.from(new Set(azkar.map(zikr => zikr.category)))];

    // Filter azkar by category
    const filteredAzkar = selectedCategory === 'all'
        ? azkar
        : azkar.filter(zikr => zikr.category === selectedCategory);

    // Handle counter increment
    const incrementCounter = (id: number) => {
        setCounters(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
    };

    // Handle counter reset
    const resetCounter = (id: number) => {
        setCounters(prev => ({
            ...prev,
            [id]: 0
        }));
    };

    // Reset all counters
    const resetAllCounters = () => {
        const resetCounters: { [key: number]: number } = {};
        azkar.forEach(zikr => {
            if (zikr.id && shouldHaveCounter(zikr.category)) {
                resetCounters[zikr.id] = 0;
            }
        });
        setCounters(resetCounters);
    };

    // Get category display name
    const getCategoryDisplayName = (category: string) => {
        const displayNames: { [key: string]: string } = {
            'Morning Adhkar': preferences.language === 'ar' ? 'أذكار الصباح' : 'Morning Adhkar',
            'Evening Adhkar': preferences.language === 'ar' ? 'أذكار المساء' : 'Evening Adhkar',
            'Post-Prayer Azkar': preferences.language === 'ar' ? 'أذكار بعد السلام من الصلاة المفروضة' : 'Post-Prayer Azkar',
            'Tasbeeh': preferences.language === 'ar' ? 'تسابيح' : 'Tasbeeh',
            'Azkar Before Sleep': preferences.language === 'ar' ? 'أذكار النوم' : 'Azkar Before Sleep',
            'Azkar Upon Waking': preferences.language === 'ar' ? 'أذكار الاستيقاظ' : 'Azkar Upon Waking',
            'Quranic Duas': preferences.language === 'ar' ? 'أدعية قرآنية' : 'Quranic Duas',
            'Prophets\' Duas': preferences.language === 'ar' ? 'أدعية الأنبياء' : 'Prophets\' Duas'
        };
        return displayNames[category] || category;
    };

    if (loading) {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-8"></div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {t.azkar}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {t.azkarDescription}
                    </p>
                </div>

                {/* Category Filter */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${selectedCategory === category
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {category === 'all' ? (preferences.language === 'ar' ? 'جميع الأذكار' : 'All Azkar') : getCategoryDisplayName(category)}
                            </button>
                        ))}
                    </div>

                    {selectedCategory !== 'all' && (
                        <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredAzkar.length} {preferences.language === 'ar' ? 'دعاء' : 'supplication'}{filteredAzkar.length !== 1 ? (preferences.language === 'ar' ? 'ات' : 's') : ''} {preferences.language === 'ar' ? 'في هذه الفئة' : 'in this category'}
                            </p>
                            {filteredAzkar.some(zikr => shouldHaveCounter(zikr.category)) && (
                                <button
                                    onClick={resetAllCounters}
                                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                >
                                    {preferences.language === 'ar' ? 'إعادة تعيين جميع العدادات' : 'Reset All Counters'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Azkar List */}
                <div className="space-y-6">
                    {filteredAzkar.map((zikr) => {
                        if (!zikr.id) return null;

                        const hasCounter = shouldHaveCounter(zikr.category);
                        const currentCount = hasCounter ? (counters[zikr.id] || 0) : 0;
                        const targetCount = hasCounter ? (parseInt(zikr.count) || 1) : 1;
                        const isComplete = hasCounter ? (currentCount >= targetCount) : false;

                        return (
                            <div
                                key={zikr.id}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-200 ${isComplete ? 'ring-2 ring-green-500' : ''
                                    }`}
                            >
                                {/* Counter Section - Only show for Azkar and Tasbeeh */}
                                {hasCounter && (
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {currentCount}
                                                </div>
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    {preferences.language === 'ar' ? 'من' : 'of'} {zikr.count}
                                                </div>
                                            </div>
                                            <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-300"
                                                    style={{ width: `${Math.min((currentCount / targetCount) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2 rtl:space-x-reverse">
                                            <button
                                                onClick={() => incrementCounter(zikr.id!)}
                                                disabled={isComplete}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${isComplete
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200 cursor-not-allowed'
                                                    : 'bg-green-600 text-white hover:bg-green-700'
                                                    }`}
                                            >
                                                {isComplete ? (preferences.language === 'ar' ? '✓ مكتمل' : '✓ Complete') : (preferences.language === 'ar' ? 'عد' : 'Count')}
                                            </button>
                                            <button
                                                onClick={() => resetCounter(zikr.id!)}
                                                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                                            >
                                                {preferences.language === 'ar' ? 'إعادة تعيين' : 'Reset'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="mb-4">
                                    <div className={`text-2xl leading-relaxed text-gray-900 dark:text-white ${preferences.language === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                                        {zikr.content}
                                    </div>
                                </div>

                                {/* Description */}
                                {zikr.description && (
                                    <div className="mb-4">
                                        <div className="text-gray-600 dark:text-gray-400">
                                            {zikr.description}
                                        </div>
                                    </div>
                                )}

                                {/* Reference */}
                                {zikr.reference && (
                                    <div className="text-sm text-gray-500 dark:text-gray-500">
                                        <span className="font-medium">{preferences.language === 'ar' ? 'المرجع:' : 'Reference:'}</span> {zikr.reference}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredAzkar.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📿</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {t.noAzkarFound}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {t.trySelectingDifferentCategoryOrCheckBackLater}
                        </p>
                    </div>
                )}

                {/* Tips Section */}
                {/* <div className="mt-12 bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
                        {t.tipsForReadingAzkar}
                    </h3>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                        <li>• {t.readWithSincerityAndFocusOnTheMeaning}</li>
                        <li>• {t.tryToUnderstandTheArabicTextAndItsTranslation}</li>
                        <li>• {t.maintainConsistencyInYourDailyPractice}</li>
                        <li>• {t.useTheCounterToTrackYourProgress}</li>
                        <li>• {t.readAtTheRecommendedTimesMorningEvening}</li>
                    </ul>
                </div> */}
            </div>
        </div>
    );
} 