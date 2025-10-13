'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ToastProvider';
import { useTranslations } from '@/utils/translations';
import { Azkar } from '@/types';
import CustomModal from '@/components/CustomModal';

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
    const [searchQuery, setSearchQuery] = useState('');
    const [showCompletedOnly, setShowCompletedOnly] = useState(false);

    // Add a list of general duaas for congratulation
    const generalDuaas = useMemo(() => [
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
    ], []);

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

    // Get current time-based azkar category for smart defaults
    const getCurrentAzkarCategory = useCallback(() => {
        const hour = new Date().getHours();

        // Morning azkar (5 AM - 11 AM)
        if (hour >= 5 && hour < 11) {
            return preferences.language === 'ar' ? 'أذكار الصباح' : 'Morning Adhkar';
        }
        // Evening azkar (5 PM - 9 PM)
        else if (hour >= 17 && hour < 21) {
            return preferences.language === 'ar' ? 'أذكار المساء' : 'Evening Adhkar';
        }
        // Night azkar (9 PM - 5 AM)
        else if (hour >= 21 || hour < 5) {
            return preferences.language === 'ar' ? 'أذكار النوم' : 'Azkar Before Sleep';
        }
        // Default to post-prayer azkar during day
        else {
            return preferences.language === 'ar' ? 'أذكار بعد السلام من الصلاة المفروضة' : 'Post-Prayer Azkar';
        }
    }, [preferences.language]);

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
    const categories = useMemo(() => {
        const uniqueCategories = Array.from(new Set(azkar.map(zikr => zikr.category)));
        // Sort categories to show time-based ones first
        return uniqueCategories.sort((a, b) => {
            const timeBasedOrder = [
                'أذكار الصباح', 'Morning Adhkar',
                'أذكار المساء', 'Evening Adhkar',
                'أذكار النوم', 'Azkar Before Sleep',
                'أذكار الاستيقاظ', 'Azkar Upon Waking',
                'أذكار بعد السلام من الصلاة المفروضة', 'Post-Prayer Azkar'
            ];

            const indexA = timeBasedOrder.indexOf(a);
            const indexB = timeBasedOrder.indexOf(b);

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });
    }, [azkar]);

    // Filter azkar by category and search
    const filteredAzkar = useMemo(() => {
        let filtered = selectedCategory === ''
            ? azkar
            : azkar.filter(zikr => zikr.category === selectedCategory);

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(zikr =>
                zikr.content.toLowerCase().includes(query) ||
                zikr.description.toLowerCase().includes(query) ||
                zikr.category.toLowerCase().includes(query)
            );
        }

        // Apply completion filter
        if (showCompletedOnly) {
            filtered = filtered.filter(zikr => {
                if (!zikr.id || !shouldHaveCounter(zikr.category)) return false;
                const currentCount = counters[zikr.id] || 0;
                const targetCount = parseInt(zikr.count) || 1;
                return currentCount >= targetCount;
            });
        }

        return filtered;
    }, [azkar, selectedCategory, searchQuery, showCompletedOnly, counters, shouldHaveCounter]);

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

    // Set smart default category when azkar loads
    useEffect(() => {
        if (categories.length > 0 && selectedCategory === '') {
            const smartDefault = getCurrentAzkarCategory();
            const categoryExists = categories.includes(smartDefault);
            setSelectedCategory(categoryExists ? smartDefault : categories[0]);
            setHasShownCongrats(false);
            setRandomDuaa(null);
        }
    }, [categories, selectedCategory, getCurrentAzkarCategory]);

    // Get category display name
    const getCategoryDisplayName = (category: string) => {
        const displayNames: { [key: string]: string } = {
            'Morning Adhkar': preferences.language === 'ar' ? 'أذكار الصباح' : 'Morning Adhkar',
            'Evening Adhkar': preferences.language === 'ar' ? 'أذكار المساء' : 'Evening Adhkar',
            'Post-Prayer Azkar': preferences.language === 'ar' ? 'أذكار بعد الصلاة' : 'Post-Prayer Azkar',
            'Tasbeeh': preferences.language === 'ar' ? 'تسابيح' : 'Tasbeeh',
            'Azkar Before Sleep': preferences.language === 'ar' ? 'أذكار النوم' : 'Before Sleep',
            'Azkar Upon Waking': preferences.language === 'ar' ? 'أذكار الاستيقاظ' : 'Upon Waking',
            'Quranic Duas': preferences.language === 'ar' ? 'أدعية قرآنية' : 'Quranic Duas',
            "Prophets' Duas": preferences.language === 'ar' ? 'أدعية الأنبياء' : "Prophets' Duas",
            'Dua Khatm al-Quran': preferences.language === 'ar' ? 'دعاء ختم القرآن' : 'Completion of Quran',
            'دعاء ختم القرآن الكريم': preferences.language === 'ar' ? 'دعاء ختم القرآن' : 'Completion of Quran',
            'أذكار الصباح': preferences.language === 'ar' ? 'أذكار الصباح' : 'Morning Adhkar',
            'أذكار المساء': preferences.language === 'ar' ? 'أذكار المساء' : 'Evening Adhkar',
            'أذكار بعد السلام من الصلاة المفروضة': preferences.language === 'ar' ? 'أذكار بعد الصلاة' : 'Post-Prayer Azkar',
            'أذكار النوم': preferences.language === 'ar' ? 'أذكار النوم' : 'Before Sleep',
            'أذكار الاستيقاظ': preferences.language === 'ar' ? 'أذكار الاستيقاظ' : 'Upon Waking',
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

    // Get category progress
    const getCategoryProgress = useMemo(() => {
        if (!selectedCategory || filteredAzkar.length === 0) return { completed: 0, total: 0, percentage: 0 };

        const azkarWithCounters = filteredAzkar.filter(zikr => zikr.id && shouldHaveCounter(zikr.category));
        if (azkarWithCounters.length === 0) return { completed: 0, total: 0, percentage: 0 };

        const completed = azkarWithCounters.filter(zikr => {
            const currentCount = counters[zikr.id!] || 0;
            const targetCount = parseInt(zikr.count) || 1;
            return currentCount >= targetCount;
        }).length;

        const percentage = Math.round((completed / azkarWithCounters.length) * 100);

        return { completed, total: azkarWithCounters.length, percentage };
    }, [selectedCategory, filteredAzkar, counters, shouldHaveCounter]);

    if (loading) {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                        {t.azkar}
                    </motion.h1>
                    <motion.p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                        {t.azkarDescription}
                    </motion.p>
                </div>

                {/* Search and Filters */}
                <motion.div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3 }}>
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={preferences.language === 'ar' ? 'ابحث في الأذكار...' : 'Search azkar...'}
                                className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${selectedCategory === ''
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {preferences.language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                            </button>
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

                        {/* Stats and Controls */}
                        {selectedCategory && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-0">
                                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {filteredAzkar.length} {preferences.language === 'ar' ? (filteredAzkar.length === 1 ? 'دعاء' : 'أدعية') : `item${filteredAzkar.length !== 1 ? 's' : ''}`}
                                    </p>
                                    {getCategoryProgress.total > 0 && (
                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${getCategoryProgress.percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                                {getCategoryProgress.percentage}%
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                    <label className="flex items-center space-x-2 rtl:space-x-reverse text-sm">
                                        <input
                                            type="checkbox"
                                            checked={showCompletedOnly}
                                            onChange={(e) => setShowCompletedOnly(e.target.checked)}
                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                        />
                                        {/* <span className="text-gray-700 dark:text-gray-300">
                                            {preferences.language === 'ar' ? 'المكتملة فقط' : 'Completed only'}
                                        </span> */}
                                    </label>

                                    {filteredAzkar.some(zikr => shouldHaveCounter(zikr.category)) && (
                                        <button
                                            onClick={resetAllCounters}
                                            className="flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 text-sm text-red-600 hover:text-white hover:bg-red-600 dark:text-red-400 dark:hover:bg-red-500 transition-all duration-200 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-600"
                                            title={preferences.language === 'ar' ? 'إعادة تعيين جميع العدادات' : 'Reset all counters'}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span>{preferences.language === 'ar' ? 'إعادة تعيين الكل' : 'Reset All'}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Azkar List */}
                <div className="space-y-6">
                    {filteredAzkar.map((zikr) => {
                        if (!zikr.id) return null;

                        const hasCounter = shouldHaveCounter(zikr.category);
                        const currentCount = hasCounter ? (counters[zikr.id] || 0) : 0;
                        const targetCount = hasCounter ? (parseInt(zikr.count) || 1) : 1;
                        const isComplete = hasCounter ? (currentCount >= targetCount) : false;

                        return (
                            <motion.div
                                key={zikr.id}
                                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-200 ${isComplete ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/10' : ''
                                    }`}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Counter Section */}
                                {hasCounter && (
                                    <div className="mb-6">
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {preferences.language === 'ar' ? 'التقدم' : 'Progress'}
                                                </span>
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {currentCount} {preferences.language === 'ar' ? 'من' : 'of'} {zikr.count}
                                                </span>
                                            </div>
                                            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ease-out ${isComplete
                                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                        : 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                        }`}
                                                    style={{ width: `${Math.min((currentCount / targetCount) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => incrementCounter(zikr.id!)}
                                                disabled={isComplete}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg ${isComplete
                                                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-200 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-green-500/25'
                                                    }`}
                                            >
                                                {isComplete ? (
                                                    <>
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        <span>{preferences.language === 'ar' ? 'مكتمل' : 'Complete'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                        </svg>
                                                        <span>{preferences.language === 'ar' ? 'عد' : 'Count'}</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => resetCounter(zikr.id!)}
                                                className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 hover:from-red-100 hover:to-red-200 hover:text-red-700 dark:hover:from-red-900/30 dark:hover:to-red-800/30 dark:hover:text-red-200 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500"
                                                title={preferences.language === 'ar' ? 'إعادة تعيين هذا الذكر' : 'Reset this dhikr'}
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span className="hidden sm:inline">{preferences.language === 'ar' ? 'إعادة تعيين' : 'Reset'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="mb-4">
                                    <div className={`text-xl sm:text-2xl leading-relaxed text-gray-900 dark:text-white ${preferences.language === 'ar' ? 'text-right font-arabic' : 'text-left'}`}>
                                        {zikr.content}
                                    </div>
                                </div>

                                {/* Description */}
                                {zikr.description && (
                                    <div className="mb-4">
                                        <div className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {zikr.description}
                                        </div>
                                    </div>
                                )}

                                {/* Reference and Count */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 dark:text-gray-400 space-y-2 sm:space-y-0">
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        {zikr.reference && (
                                            <span className="flex items-center space-x-1 rtl:space-x-reverse">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{zikr.reference}</span>
                                            </span>
                                        )}
                                        {hasCounter && parseInt(zikr.count) > 1 && (
                                            <span className="flex items-center space-x-1 rtl:space-x-reverse">
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                                                </svg>
                                                <span>
                                                    {preferences.language === 'ar'
                                                        ? `${zikr.count} مرات`
                                                        : `${zikr.count} times`
                                                    }
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                        {getCategoryDisplayName(zikr.category)}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredAzkar.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📿</div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {searchQuery ?
                                (preferences.language === 'ar' ? 'لا توجد نتائج' : 'No results found') :
                                (preferences.language === 'ar' ? 'لا توجد أذكار' : 'No azkar found')
                            }
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery ?
                                (preferences.language === 'ar' ? 'جرب البحث بكلمات مختلفة' : 'Try searching with different keywords') :
                                (preferences.language === 'ar' ? 'جرب اختيار فئة مختلفة' : 'Try selecting a different category')
                            }
                        </p>
                    </div>
                )}

                {/* Completion Modal */}
                <CustomModal
                    isOpen={showCongrats}
                    onClose={handleCloseCongrats}
                    title={preferences.language === 'ar'
                        ? 'بَارَكَ اللّٰهُ فِيكَ'
                        : 'Bāraka Allāhu Fīk'}
                >
                    <div className="text-lg text-gray-700 dark:text-gray-200 mb-4 text-center">
                        {preferences.language === 'ar'
                            ? 'لقد أكملت جميع الأذكار في هذه الفئة. جزاك الله خيرًا وبارك فيك.'
                            : 'You have completed all adhkar in this category. May Allah reward you and bless you!'}
                    </div>
                    {randomDuaa && (
                        <div className="mb-4 text-center">
                            <div className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
                                {preferences.language === 'ar' ? 'دُعَاءٌ لَكَ:' : 'A Duʿāʾ for You:'}
                            </div>
                            <div className="text-lg text-gray-900 dark:text-white mb-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
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
                        className="w-full mt-2 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-200"
                    >
                        {preferences.language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                </CustomModal>
            </div>
        </div>
    );
} 