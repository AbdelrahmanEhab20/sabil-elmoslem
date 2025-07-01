'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ToastProvider';
import { useTranslations } from '@/utils/translations';
import { Azkar } from '@/types';
import { Dialog } from '@headlessui/react';

export default function AzkarPage() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const toast = useToast();
    const [azkar, setAzkar] = useState<Azkar[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [counters, setCounters] = useState<{ [key: number]: number }>({});
    const [showCongrats, setShowCongrats] = useState(false);
    const [randomDuaa, setRandomDuaa] = useState<{ ar: string, en: string } | null>(null);
    const [hasShownCongrats, setHasShownCongrats] = useState(false);

    // Add a list of general duaas for congratulation (move up)
    const generalDuaas = [
        {
            ar: 'اللهم اجعل هذا اليوم مباركًا لنا، واغفر لنا ذنوبنا، وارزقنا السعادة في الدنيا والآخرة.',
            en: 'O Allah, make this day blessed for us, forgive our sins, and grant us happiness in this life and the Hereafter.'
        },
        {
            ar: 'اللهم احفظنا بحفظك، ووفقنا لطاعتك، وبارك لنا في أعمارنا وأعمالنا.',
            en: 'O Allah, protect us with Your protection, guide us to Your obedience, and bless our lives and deeds.'
        },
        {
            ar: 'اللهم ارزقنا الإخلاص في القول والعمل، واملأ قلوبنا بنور الإيمان.',
            en: 'O Allah, grant us sincerity in word and deed, and fill our hearts with the light of faith.'
        },
        {
            ar: 'اللهم اجعلنا من الذاكرين الشاكرين، ووفقنا لما تحب وترضى.',
            en: 'O Allah, make us among those who remember and thank You, and grant us success in what You love and are pleased with.'
        },
        {
            ar: 'اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا وجلاء أحزاننا.',
            en: 'O Allah, make the Quran the spring of our hearts, the light of our chests, and the remover of our sorrows.'
        }
    ];

    // Memoize shouldHaveCounter function to prevent unnecessary re-renders
    const shouldHaveCounter = useCallback((category: string) => {
        // Quranic duas, Prophets' duas, and Dua Khatm al-Quran don't need counters as they are supplications recited as needed
        const categoriesWithoutCounters = [
            'أدعية قرآنية',
            'أدعية الأنبياء',
            'Quranic Duas',
            "Prophets' Duas",
            'Dua Khatm al-Quran',
            'دعاء ختم القرآن الكريم',
        ];
        return !categoriesWithoutCounters.includes(category);
    }, []);

    // Helper to check if a category is an "azkar" category (not duaas-only)
    const isAzkarCategory = useCallback((category: string) => {
        const duaasOnlyCategories = [
            'أدعية قرآنية',
            'أدعية الأنبياء',
            'Quranic Duas',
            "Prophets' Duas",
            'Dua Khatm al-Quran',
            'دعاء ختم القرآن الكريم',
        ];
        return !duaasOnlyCategories.includes(category);
    }, []);

    // Fetch azkar on mount and when language changes
    useEffect(() => {
        const loadAzkar = async () => {
            setLoading(true);
            try {
                const { fetchAzkar } = await import('@/utils/api');
                const data = await fetchAzkar(preferences.language);
                setAzkar(data);

                // Initialize counters only for categories that need them
                const initialCounters: { [key: number]: number } = {};
                data.forEach(zikr => {
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
    }, [preferences.language, t.errorLoadingAzkar, toast, shouldHaveCounter]);

    // Get unique categories
    const categories = Array.from(new Set(azkar.map(zikr => zikr.category)));

    // Filter azkar by category
    const filteredAzkar = selectedCategory === ''
        ? azkar
        : azkar.filter(zikr => zikr.category === selectedCategory);

    // Helper to check if category is complete
    const isCategoryComplete = useMemo(() => {
        return (
            filteredAzkar.length > 0 &&
            isAzkarCategory(selectedCategory) &&
            filteredAzkar.every(zikr => {
                if (!zikr.id) return true;
                const hasCounter = shouldHaveCounter(zikr.category);
                if (!hasCounter) return true;
                const currentCount = counters[zikr.id] || 0;
                const targetCount = parseInt(zikr.count) || 1;
                return currentCount >= targetCount;
            })
        );
    }, [filteredAzkar, counters, shouldHaveCounter, isAzkarCategory, selectedCategory]);

    // Effect to show modal only once per completion
    useEffect(() => {
        if (isCategoryComplete && !hasShownCongrats) {
            setRandomDuaa(generalDuaas[Math.floor(Math.random() * generalDuaas.length)]);
            setShowCongrats(true);
            setHasShownCongrats(true);
        }
        if (!isCategoryComplete) {
            setShowCongrats(false);
            setHasShownCongrats(false);
            setRandomDuaa(null);
        }
    }, [isCategoryComplete, hasShownCongrats, generalDuaas]);

    const handleCloseCongrats = () => {
        setShowCongrats(false);
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
        setHasShownCongrats(false);
        setRandomDuaa(null);
    };

    // Handle counter reset
    const resetCounter = (id: number) => {
        setCounters(prev => ({
            ...prev,
            [id]: 0
        }));
        setHasShownCongrats(false);
        setRandomDuaa(null);
    };

    // Set first category as default when azkar loads
    useEffect(() => {
        if (categories.length > 0 && selectedCategory === '') {
            setSelectedCategory(categories[0]);
            setHasShownCongrats(false);
            setRandomDuaa(null);
        }
    }, [categories, selectedCategory]);

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
            "Prophets' Duas": preferences.language === 'ar' ? 'أدعية الأنبياء' : "Prophets' Duas",
            'Dua Khatm al-Quran': preferences.language === 'ar' ? 'دعاء ختم القرآن الكريم' : 'Dua Khatm al-Quran',
            'دعاء ختم القرآن الكريم': preferences.language === 'ar' ? 'دعاء ختم القرآن الكريم' : 'Dua Khatm al-Quran',
        };
        return displayNames[category] || category;
    };

    // Handle counter increment
    const incrementCounter = (id: number) => {
        setCounters(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
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
                                {getCategoryDisplayName(category)}
                            </button>
                        ))}
                    </div>

                    {selectedCategory && (
                        <div className="mt-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {filteredAzkar.length} {preferences.language === 'ar' ? (filteredAzkar.length === 1 ? 'دعاء' : 'أدعية') : `supplication${filteredAzkar.length !== 1 ? 's' : ''}`} {preferences.language === 'ar' ? 'في هذه الفئة' : 'in this category'}
                            </p>
                            {filteredAzkar.some(zikr => shouldHaveCounter(zikr.category)) && (
                                <button
                                    onClick={resetAllCounters}
                                    className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:bg-red-500 transition-all duration-200 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-600"
                                    title={preferences.language === 'ar' ? 'إعادة تعيين جميع العدادات في هذه الفئة' : 'Reset all counters in this category'}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>{preferences.language === 'ar' ? 'إعادة تعيين الكل' : 'Reset All'}</span>
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
                                {/* Counter Section - Show for all azkar */}
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
                                            {targetCount > 1 && (
                                                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-green-500 transition-all duration-300"
                                                        style={{ width: `${Math.min((currentCount / targetCount) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            )}
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
                                                className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500"
                                                title={preferences.language === 'ar' ? 'إعادة تعيين هذا الذكر' : 'Reset this dhikr'}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
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

                {/* Sweet Alert Modal */}
                <Dialog open={showCongrats} onClose={handleCloseCongrats} className="relative z-50">
                    <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Dialog.Panel className="mx-auto max-w-md rounded-xl bg-white dark:bg-gray-900 p-8 shadow-2xl border border-green-200 dark:border-green-700">
                            <Dialog.Title className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2 text-center">
                                {preferences.language === 'ar'
                                    ? 'بَارَكَ اللّٰهُ فِيكَ'
                                    : 'Bāraka Allāhu Fīk'}
                            </Dialog.Title>
                            <div className="text-lg text-gray-700 dark:text-gray-200 mb-4 text-center">
                                {preferences.language === 'ar'
                                    ? 'لقد أكملت جميع الأذكار في هذه الفئة. جزاك الله خيرًا وبارك فيك.'
                                    : 'You have completed all adhkar in this category. May Allah reward you and bless you!'}
                            </div>
                            {randomDuaa && (
                                <div className="mb-4 text-center">
                                    <div className="text-xl font-semibold text-green-800 dark:text-green-200 mb-1">
                                        {preferences.language === 'ar' ? 'دُعَاءٌ لَكَ:' : 'A Duʿāʾ for You:'}
                                    </div>
                                    <div className="text-lg text-gray-900 dark:text-white mb-1">
                                        {preferences.language === 'ar' ? randomDuaa.ar : randomDuaa.en}
                                    </div>
                                </div>
                            )}
                            <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
                                {preferences.language === 'ar'
                                    ? 'تذكّر أن تداوم على الذكر والشكر لله دائمًا.'
                                    : 'Remember to keep remembering and thanking Allah always.'}
                            </div>
                            <button
                                onClick={handleCloseCongrats}
                                className="w-full mt-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
                            >
                                {preferences.language === 'ar' ? 'إغلاق' : 'Close'}
                            </button>
                        </Dialog.Panel>
                    </div>
                </Dialog>
            </div>
        </div>
    );
} 