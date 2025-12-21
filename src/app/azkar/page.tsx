'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/components/ToastProvider';
import { useTranslations } from '@/utils/translations';
import { Azkar } from '@/types';
import CustomModal from '@/components/CustomModal';
import { Search, Check, Plus, RotateCcw, BadgeCheck, ListOrdered, Type, ChevronDown, Grid3X3, RefreshCw } from 'lucide-react';

// Storage key for font size preference
const STORAGE_KEYS = {
    FONT_SIZE: 'azkar-font-size',
} as const;

// Helper function for localStorage with lazy initialization
const getStoredFontSize = (): 'lg' | 'xl' | '2xl' | '3xl' | '4xl' => {
    if (typeof window === 'undefined') return '2xl';
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
        if (saved && ['lg', 'xl', '2xl', '3xl', '4xl'].includes(saved)) {
            return saved as 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
        }
    } catch (error) {
        console.warn('Failed to load font size from localStorage:', error);
    }
    return '2xl';
};

export default function AzkarPage() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const toast = useToast();
    const toastRef = useRef(toast);
    toastRef.current = toast;
    const [azkar, setAzkar] = useState<Azkar[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [counters, setCounters] = useState<{ [key: number]: number }>({});
    const [countersInitialized, setCountersInitialized] = useState(false);
    const [showCongrats, setShowCongrats] = useState(false);
    const [randomDuaa, setRandomDuaa] = useState<{ ar: string, en: string } | null>(null);
    const [hasShownCongrats, setHasShownCongrats] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResetAllModal, setShowResetAllModal] = useState(false);

    // Font size state with lazy initialization from localStorage
    const [fontSize, setFontSize] = useState<'lg' | 'xl' | '2xl' | '3xl' | '4xl'>(getStoredFontSize);

    // Track if initial mount is complete to prevent saving defaults on first render
    const isInitialMount = useRef(true);

    // Save font size to localStorage (only after initial mount)
    useEffect(() => {
        if (isInitialMount.current) return;
        try {
            localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
        } catch (error) {
            console.warn('Failed to save font size to localStorage:', error);
        }
    }, [fontSize]);

    // Mark initial mount as complete after first render
    useEffect(() => {
        isInitialMount.current = false;
    }, []);

    // Storage key for counters - includes date to reset daily
    const getCountersStorageKey = useCallback(() => {
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        return `azkar-counters-${today}`;
    }, []);

    // Load counters from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(getCountersStorageKey());
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCounters(parsed);
                }
            } catch (error) {
                console.warn('Failed to load azkar counters from localStorage:', error);
            }
            setCountersInitialized(true);
        }
    }, [getCountersStorageKey]);

    // Save counters to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined' && countersInitialized && Object.keys(counters).length > 0) {
            try {
                localStorage.setItem(getCountersStorageKey(), JSON.stringify(counters));
            } catch (error) {
                console.warn('Failed to save azkar counters to localStorage:', error);
            }
        }
    }, [counters, countersInitialized, getCountersStorageKey]);

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
                // Merge with existing counters from localStorage (preserve progress)
                setCounters(prevCounters => {
                    const mergedCounters: { [key: number]: number } = {};
                    data.forEach(zikr => {
                        if (zikr.id && shouldHaveCounter(zikr.category)) {
                            // Keep existing counter value if it exists, otherwise start at 0
                            mergedCounters[zikr.id] = prevCounters[zikr.id] ?? 0;
                        }
                    });
                    return mergedCounters;
                });
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : t.errorLoadingAzkar;
                toastRef.current.showToast({ type: 'error', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        loadAzkar();
    }, [preferences.language, t.errorLoadingAzkar, shouldHaveCounter]);

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

        return filtered;
    }, [azkar, selectedCategory, searchQuery]);

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

    //

    // Handle counter reset
    const resetCounter = (id: number) => {
        setCounters(prev => ({
            ...prev,
            [id]: 0
        }));
        setHasShownCongrats(false);
        setRandomDuaa(null);
    };

    // Handle reset all counters
    const resetAllCounters = () => {
        // Reset all counters to empty object
        setCounters({});

        // Clear localStorage for today's counters
        if (typeof window !== 'undefined') {
            try {
                localStorage.removeItem(getCountersStorageKey());
            } catch (error) {
                console.warn('Failed to clear counters from localStorage:', error);
            }
        }

        // Reset congrats state
        setHasShownCongrats(false);
        setRandomDuaa(null);
        setShowCongrats(false);

        // Close confirmation modal
        setShowResetAllModal(false);

        // Show success toast
        toastRef.current.showToast({
            type: 'success',
            message: preferences.language === 'ar'
                ? 'تم إعادة تعيين جميع العدادات بنجاح'
                : 'All counters have been reset successfully'
        });
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

    const isArabic = preferences.language === 'ar';

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Header */}
            <section className="relative bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 text-white py-12 md:py-16 overflow-hidden">
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 8.5L51.5 30L30 51.5L8.5 30L30 8.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }} />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </motion.div>
                    <motion.h1
                        className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isArabic ? 'font-arabic-display' : ''}`}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        {t.azkar}
                    </motion.h1>
                    <motion.p
                        className={`text-lg md:text-xl text-green-100 max-w-2xl mx-auto ${isArabic ? 'font-arabic-body' : ''}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.15 }}
                    >
                        {t.azkarDescription}
                    </motion.p>
                </div>

                {/* Bottom wave */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 30L60 25C120 20 240 10 360 15C480 20 600 40 720 45C840 50 960 40 1080 30C1200 20 1320 10 1380 5L1440 0V60H0V30Z" className="fill-gray-50 dark:fill-gray-900" />
                    </svg>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Search and Filters */}
                <motion.div
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5 sm:p-7 mb-8"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={preferences.language === 'ar' ? 'ابحث في الأذكار...' : 'Search azkar...'}
                                className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>

                        {/* Category Filter - Dropdown on mobile, buttons on desktop */}
                        {/* Mobile: Dropdown Select */}
                        <div className="sm:hidden">
                            <div className="relative">
                                <div className="flex items-center gap-2 mb-2">
                                    <Grid3X3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {preferences.language === 'ar' ? 'اختر الفئة' : 'Select Category'}
                                    </span>
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-gray-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
                                    >
                                        <option value="">{preferences.language === 'ar' ? 'جميع الفئات' : 'All Categories'}</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {getCategoryDisplayName(category)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Desktop: Button Pills */}
                        <div className="hidden sm:block">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${selectedCategory === ''
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {preferences.language === 'ar' ? 'جميع الفئات' : 'All Categories'}
                                </button>
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200 ${selectedCategory === category
                                            ? 'bg-emerald-600 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {getCategoryDisplayName(category)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats and Controls */}
                        {selectedCategory && (
                            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                    {filteredAzkar.length} {preferences.language === 'ar' ? (filteredAzkar.length === 1 ? 'دعاء' : 'أدعية') : `item${filteredAzkar.length !== 1 ? 's' : ''}`}
                                </p>
                                {getCategoryProgress.total > 0 && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 sm:w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getCategoryProgress.percentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
                                            {getCategoryProgress.percentage}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Font Size Control */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 shadow-sm border border-emerald-100 dark:border-emerald-800">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Type className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                        <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            {preferences.language === 'ar' ? 'حجم الخط' : 'Font Size'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        {[
                                            { key: 'lg', label: 'S' },
                                            { key: 'xl', label: 'M' },
                                            { key: '2xl', label: 'L' },
                                            { key: '3xl', label: 'XL' },
                                            { key: '4xl', label: 'XXL' }
                                        ].map((size) => (
                                            <button
                                                key={size.key}
                                                onClick={() => setFontSize(size.key as typeof fontSize)}
                                                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${fontSize === size.key
                                                    ? 'bg-emerald-600 text-white shadow-lg'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-emerald-300'
                                                    }`}
                                            >
                                                {size.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reset All Counters Control */}
                        {Object.keys(counters).length > 0 && (
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 shadow-sm border border-red-100 dark:border-red-800">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <RefreshCw className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                            <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                {preferences.language === 'ar' ? 'إعادة تعيين العدادات' : 'Reset All Counters'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setShowResetAllModal(true)}
                                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-white dark:bg-gray-700 text-red-600 dark:text-red-400 border-2 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-500"
                                        >
                                            {preferences.language === 'ar' ? 'إعادة تعيين الكل' : 'Reset All'}
                                        </button>
                                    </div>
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
                                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl ${isComplete ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' : ''
                                    }`}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3 }}
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
                                                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
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
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${isComplete
                                                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/30 dark:to-green-800/30 dark:text-green-200 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
                                                    }`}
                                            >
                                                {isComplete ? (
                                                    <>
                                                        <Check className="w-6 h-6" aria-hidden="true" />
                                                        <span>{preferences.language === 'ar' ? 'مكتمل' : 'Complete'}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-6 h-6" aria-hidden="true" />
                                                        <span>{preferences.language === 'ar' ? 'عد' : 'Count'}</span>
                                                    </>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => resetCounter(zikr.id!)}
                                                className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200 hover:from-red-100 hover:to-red-200 hover:text-red-700 dark:hover:from-red-900/30 dark:hover:to-red-800/30 dark:hover:text-red-200 border-2 border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-500"
                                                title={preferences.language === 'ar' ? 'إعادة تعيين هذا الذكر' : 'Reset this dhikr'}
                                            >
                                                <RotateCcw className="w-6 h-6" aria-hidden="true" />
                                                <span className="hidden sm:inline">{preferences.language === 'ar' ? 'إعادة تعيين' : 'Reset'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Content */}
                                <div className="mb-4 overflow-hidden">
                                    <div className={`leading-loose sm:leading-relaxed text-gray-900 dark:text-white break-words ${isArabic ? 'text-right font-arabic' : 'text-left'} ${fontSize === 'lg' ? 'text-base sm:text-lg md:text-xl' : fontSize === 'xl' ? 'text-lg sm:text-xl md:text-2xl' : fontSize === '2xl' ? 'text-xl sm:text-2xl md:text-3xl' : fontSize === '3xl' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'}`}>
                                        {zikr.content}
                                    </div>
                                </div>

                                {/* Description */}
                                {zikr.description && (
                                    <div className="mb-4 overflow-hidden">
                                        <div className={`text-gray-600 dark:text-gray-400 leading-relaxed break-words ${isArabic ? 'font-arabic-body text-right' : 'text-left'} ${fontSize === 'lg' ? 'text-xs sm:text-sm md:text-base' : fontSize === 'xl' ? 'text-sm sm:text-base md:text-lg' : fontSize === '2xl' ? 'text-base sm:text-lg md:text-xl' : fontSize === '3xl' ? 'text-lg sm:text-xl md:text-2xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
                                            {zikr.description}
                                        </div>
                                    </div>
                                )}

                                {/* Reference and Count */}
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {zikr.reference && (
                                            <span className="flex items-center gap-1">
                                                <BadgeCheck className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                                <span className="truncate max-w-[150px] sm:max-w-none">{zikr.reference}</span>
                                            </span>
                                        )}
                                        {hasCounter && parseInt(zikr.count) > 1 && (
                                            <span className="flex items-center gap-1">
                                                <ListOrdered className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                                                <span className="whitespace-nowrap">
                                                    {preferences.language === 'ar'
                                                        ? `${zikr.count} مرات`
                                                        : `${zikr.count} times`
                                                    }
                                                </span>
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
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
                            <div className="text-xl font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                                {preferences.language === 'ar' ? 'دُعَاءٌ لَكَ:' : 'A Duʿāʾ for You:'}
                            </div>
                            <div className="text-lg text-gray-900 dark:text-white mb-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
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
                        className="w-full mt-2 px-4 py-3 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors duration-200"
                    >
                        {preferences.language === 'ar' ? 'إغلاق' : 'Close'}
                    </button>
                </CustomModal>

                {/* Reset All Counters Confirmation Modal */}
                <CustomModal
                    isOpen={showResetAllModal}
                    onClose={() => setShowResetAllModal(false)}
                    title={preferences.language === 'ar'
                        ? 'تأكيد إعادة التعيين'
                        : 'Confirm Reset'}
                >
                    <div className="text-lg text-gray-700 dark:text-gray-200 mb-4 text-center">
                        {preferences.language === 'ar'
                            ? 'هل أنت متأكد من إعادة تعيين جميع العدادات؟ سيتم حذف جميع التقدم المحفوظ.'
                            : 'Are you sure you want to reset all counters? All saved progress will be lost.'}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <button
                            onClick={() => setShowResetAllModal(false)}
                            className="flex-1 px-4 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                            {preferences.language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            onClick={resetAllCounters}
                            className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-200"
                        >
                            {preferences.language === 'ar' ? 'إعادة التعيين' : 'Reset All'}
                        </button>
                    </div>
                </CustomModal>
            </div>
        </div>
    );
} 