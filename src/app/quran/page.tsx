'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { fetchQuranSurahs, fetchQuranAyahs } from '@/utils/api';
import { QuranSurah, QuranAyah } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';

// Storage keys for reading progress
const STORAGE_KEYS = {
    LAST_SURAH: 'quran-last-surah',
    FONT_SIZE: 'quran-font-size',
} as const;

export default function QuranPage() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const toast = useToast();
    const toastRef = useRef(toast);
    toastRef.current = toast;
    const [surahs, setSurahs] = useState<QuranSurah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
    const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
    const [loading, setLoading] = useState(true);
    const [surahLoading, setSurahLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'surah-list' | 'ayah-view'>('surah-list');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [fontSize, setFontSize] = useState<'lg' | 'xl' | '2xl' | '3xl' | '4xl'>('2xl');
    const [hasRestoredProgress, setHasRestoredProgress] = useState(false);

    // Load saved font size from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                const savedFontSize = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
                if (savedFontSize && ['lg', 'xl', '2xl', '3xl', '4xl'].includes(savedFontSize)) {
                    setFontSize(savedFontSize as typeof fontSize);
                }
            } catch (error) {
                console.warn('Failed to load font size from localStorage:', error);
            }
        }
    }, []);

    // Save font size to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);
            } catch (error) {
                console.warn('Failed to save font size to localStorage:', error);
            }
        }
    }, [fontSize]);

    // Save last read surah to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedSurah) {
            try {
                localStorage.setItem(STORAGE_KEYS.LAST_SURAH, JSON.stringify({
                    number: selectedSurah.number,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('Failed to save reading progress to localStorage:', error);
            }
        }
    }, [selectedSurah]);

    // Fetch surahs on mount
    useEffect(() => {
        const loadSurahs = async () => {
            try {
                setLoading(true);
                const surahsData = await fetchQuranSurahs();
                setSurahs(surahsData);

                // Restore last read surah if available (only once)
                if (!hasRestoredProgress && typeof window !== 'undefined') {
                    try {
                        const savedProgress = localStorage.getItem(STORAGE_KEYS.LAST_SURAH);
                        if (savedProgress) {
                            const { number } = JSON.parse(savedProgress);
                            const lastSurah = surahsData.find(s => s.number === number);
                            if (lastSurah) {
                                setSelectedSurah(lastSurah);
                                setView('ayah-view');
                            }
                        }
                    } catch (error) {
                        console.warn('Failed to restore reading progress:', error);
                    }
                    setHasRestoredProgress(true);
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : t.errorLoadingQuran;
                toastRef.current.showToast({ type: 'error', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        loadSurahs();
    }, [t.errorLoadingQuran, hasRestoredProgress]);

    // Fetch ayahs when selectedSurah changes
    useEffect(() => {
        const loadAyahs = async () => {
            if (selectedSurah) {
                try {
                    setSurahLoading(true);
                    const ayahsData = await fetchQuranAyahs(selectedSurah.number);
                    setAyahs(ayahsData);
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : t.errorLoadingQuran;
                    toastRef.current.showToast({ type: 'error', message: errorMessage });
                } finally {
                    setSurahLoading(false);
                }
            }
        };
        loadAyahs();
    }, [selectedSurah, t.errorLoadingQuran]);

    // Normalize Arabic text by removing tashkeel (diacritics) for flexible search
    const normalizeArabic = (text: string): string => {
        return text
            .normalize('NFD')
            .replace(/[\u064B-\u065F\u0670]/g, '') // Remove Arabic diacritics
            .replace(/[\u0640]/g, '') // Remove tatweel
            .normalize('NFC');
    };

    // Filter surahs by search term - supports Arabic with/without tashkeel
    const filteredSurahs = surahs.filter(surah => {
        if (!searchTerm.trim()) return true;

        const normalizedSearch = normalizeArabic(searchTerm.toLowerCase());
        const normalizedSurahName = normalizeArabic(surah.name.toLowerCase());

        return (
            normalizedSurahName.includes(normalizedSearch) ||
            surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            surah.number.toString().includes(searchTerm)
        );
    });

    const handleSurahSelect = (surah: QuranSurah) => {
        setSelectedSurah(surah);
        setSearchTerm(''); // Clear search when selecting a surah
        setView('ayah-view');
    };

    const handleBackToList = () => {
        setSelectedSurah(null);
        setAyahs([]);
        setSearchTerm(''); // Clear search when going back to list
        setView('surah-list');
    };

    // Normalize and strip possible Bismillah variants from ayah text
    const stripBismillah = (text: string): string => {
        // Common Bismillah variants in Uthmani/Indopak scripts
        const variants = [
            'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
            'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ',
            'بِسْمِ اللَّهِ الرَّحِيمِ الرَّحْمٰنِ',
        ];
        const trimmed = text.trim();
        for (const v of variants) {
            if (trimmed.startsWith(v)) {
                return trimmed.slice(v.length).trim();
            }
        }
        // Fallback heuristic: if begins with "بِس" and contains "ٱلل" within first 20 chars
        if (/^\s*بِس/.test(trimmed) && trimmed.slice(0, 24).includes('ٱلل')) {
            return trimmed.replace(/^\s*بِس[\s\S]*?الرَّحِيمِ\s*/u, '').trim();
        }
        return text;
    };

    const getRevelationTypeColor = (type: string) => {
        return type === 'Meccan' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
    };

    // Prevent background scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
        // Clean up on unmount
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [sidebarOpen]);

    if (loading) {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-8"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                <div key={i} className="h-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Sidebar Toggle Button for Mobile */}
            <button
                className="md:hidden fixed top-20 left-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-xl hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 transition-all duration-200 rtl:left-auto rtl:right-4"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={preferences.language === 'ar' ? 'فتح قائمة السور' : 'Open Surah List'}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <div className="py-6 sm:py-8 lg:py-10 flex w-full gap-4 lg:gap-6">
                {/* Sidebar: Surah List - Enhanced Design */}
                <aside
                    className={`
                        fixed top-0 left-0 h-full w-80 sm:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-2xl p-6 overflow-y-auto z-40 transition-transform duration-300 ease-in-out
                        lg:static lg:translate-x-0 lg:w-72 lg:h-[calc(100vh-5rem)] lg:rounded-2xl lg:shadow-xl lg:border-0
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{ direction: preferences.language === 'ar' ? 'rtl' : 'ltr' }}
                    aria-label={preferences.language === 'ar' ? 'قائمة السور' : 'Surah List'}
                >
                    {/* Sidebar Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {preferences.language === 'ar' ? 'السور' : 'Surahs'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {surahs.length} {preferences.language === 'ar' ? 'سورة' : 'surahs'}
                            </p>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 dark:text-gray-400 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors"
                            aria-label={preferences.language === 'ar' ? 'إغلاق القائمة' : 'Close list'}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Sidebar Search (when in surah list view) */}
                    {view === 'surah-list' && (
                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={preferences.language === 'ar' ? 'ابحث...' : 'Search...'}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                            />
                        </div>
                    )}

                    {/* Surah List - Enhanced */}
                    <ul className="space-y-1">
                        {surahs.map((surah) => (
                            <li key={surah.number}>
                                <button
                                    onClick={() => { handleSurahSelect(surah); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                                        ${selectedSurah?.number === surah.number
                                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-[1.02]'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                                        ${selectedSurah?.number === surah.number
                                            ? 'bg-white/20 text-white'
                                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                        }`}>
                                        {surah.number}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`font-arabic text-lg sm:text-xl font-semibold truncate ${selectedSurah?.number === surah.number ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                            {surah.name}
                                        </div>
                                        <div className={`text-xs sm:text-sm truncate ${selectedSurah?.number === surah.number ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                            {surah.englishName}
                                        </div>
                                    </div>
                                    {selectedSurah?.number === surah.number && (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 w-full min-w-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header - Only show on surah list view */}
                        {view === 'surah-list' && (
                            <div className="text-center mb-8 sm:mb-10 pt-4 sm:pt-6">
                                <motion.h1
                                    className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35 }}
                                >
                                    <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-500 bg-clip-text text-transparent">
                                        {preferences.language === 'ar' ? 'القرآن الكريم' : 'The Holy Quran'}
                                    </span>
                                </motion.h1>
                                <motion.p
                                    className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 font-medium"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {preferences.language === 'ar' ? 'اقرأ وتأمل في كلام الله' : 'Read and reflect upon the words of Allah'}
                                </motion.p>
                            </div>
                        )}

                        {view === 'surah-list' ? (
                            <>
                                {/* Search Bar - Only show on desktop when sidebar is visible */}
                                <motion.div
                                    className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
                                    initial={{ opacity: 0, y: 6 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder={preferences.language === 'ar' ? 'ابحث عن السور...' : 'Search surahs...'}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                                            />
                                        </div>
                                        <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm font-medium text-green-700 dark:text-green-300 whitespace-nowrap">
                                            {filteredSurahs.length} {preferences.language === 'ar' ? 'من' : 'of'} {surahs.length}
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Surah Grid - Enhanced */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {filteredSurahs.map((surah) => (
                                        <motion.button
                                            key={surah.number}
                                            onClick={() => handleSurahSelect(surah)}
                                            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-700"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                                    <span className="text-lg font-bold text-white">
                                                        {surah.number}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRevelationTypeColor(surah.revelationType)}`}>
                                                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                                                {surah.englishName}
                                            </h3>
                                            <p className="text-2xl sm:text-3xl text-gray-900 dark:text-white mb-4 font-arabic font-semibold leading-relaxed">
                                                {surah.name}
                                            </p>
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    {surah.numberOfAyahs} {preferences.language === 'ar' ? 'آية' : 'verses'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                    Juz {Math.ceil(surah.number / 10)}
                                                </span>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Empty State */}
                                {filteredSurahs.length === 0 && (
                                    <motion.div
                                        className="text-center py-16 sm:py-20"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-7xl mb-6">📖</div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                            {preferences.language === 'ar' ? 'لم يتم العثور على سور' : 'No Surahs Found'}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                                            {preferences.language === 'ar' ? 'حاول تعديل مصطلحات البحث.' : 'Try adjusting your search terms.'}
                                        </p>
                                    </motion.div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Ayah View Header - Enhanced */}
                                <motion.div
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 mb-6 sm:mb-8"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={handleBackToList}
                                                className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                                                aria-label={preferences.language === 'ar' ? 'العودة إلى السور' : 'Back to Surahs'}
                                            >
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <div>
                                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                                    {selectedSurah?.englishName}
                                                </h2>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-gray-600 dark:text-gray-400">
                                                        {selectedSurah?.numberOfAyahs} {preferences.language === 'ar' ? 'آية' : 'verses'}
                                                    </p>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRevelationTypeColor(selectedSurah?.revelationType || '')}`}>
                                                        {selectedSurah?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right sm:text-left">
                                            <p className="text-3xl sm:text-4xl lg:text-5xl font-arabic font-bold text-gray-900 dark:text-white mb-2 leading-relaxed">
                                                {selectedSurah?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Font Size Control - Enhanced */}
                                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 sm:p-5 shadow-sm border border-green-100 dark:border-green-800">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                                <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                                    {preferences.language === 'ar' ? 'حجم الخط' : 'Font Size'}
                                                </span>
                                                <div className="flex items-center gap-2 flex-wrap">
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
                                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${fontSize === size.key
                                                                ? 'bg-green-600 text-white shadow-lg transform scale-105'
                                                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-green-300'
                                                                }`}
                                                        >
                                                            {size.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Bismillah Header for non-Fatiha surahs - Enhanced */}
                                {selectedSurah && selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                                    <motion.div
                                        className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-xl p-8 sm:p-12 mb-8 border border-green-100 dark:border-green-800"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl sm:text-4xl lg:text-5xl leading-relaxed text-gray-900 dark:text-white font-arabic mb-6">
                                                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
                                            </div>
                                            <div className="w-24 h-1.5 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto rounded-full"></div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Ayahs - Enhanced */}
                                {surahLoading ? (
                                    <div className="animate-pulse space-y-6">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
                                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                                                <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6 sm:space-y-8">
                                        {ayahs.map((ayah) => {
                                            let ayahText = ayah.text;

                                            // Handle Bismillah logic:
                                            // 1. Al-Fatiha (Surah 1): Keep Bismillah as first ayah
                                            // 2. At-Tawba (Surah 9): No Bismillah at all
                                            // 3. All other surahs: Remove Bismillah from first ayah
                                            if (selectedSurah && selectedSurah.number === 1) {
                                                // Al-Fatiha: Keep Bismillah as is (first ayah)
                                            } else if (selectedSurah && selectedSurah.number === 9) {
                                                // At-Tawba: No Bismillah logic needed
                                            } else if (selectedSurah && ayah.numberInSurah === 1) {
                                                // All other surahs: Remove Bismillah from first ayah (robust for multiple variants)
                                                ayahText = stripBismillah(ayahText);
                                            }

                                            // Skip rendering if this is a Bismillah-only ayah (shouldn't happen with current logic)
                                            if (selectedSurah && selectedSurah.number !== 1 && ayah.numberInSurah === 1 && ayahText.trim() === '') {
                                                return null;
                                            }

                                            return (
                                                <motion.div
                                                    key={ayah.number}
                                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-6 sm:p-8 transition-all duration-300 border border-gray-100 dark:border-gray-700"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                                                <span className="text-sm font-bold text-white">
                                                                    {ayah.numberInSurah}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                {preferences.language === 'ar' ? 'آية' : 'Ayah'} {ayah.numberInSurah}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {preferences.language === 'ar' ? 'جزء' : 'Juz'} {ayah.juz}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Arabic Text - Enhanced */}
                                                    <div className="mb-6">
                                                        <div className={`font-arabic text-right ${fontSize === 'lg' ? 'text-lg sm:text-xl' : fontSize === 'xl' ? 'text-xl sm:text-2xl' : fontSize === '2xl' ? 'text-2xl sm:text-3xl' : fontSize === '3xl' ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'} leading-loose sm:leading-relaxed text-gray-900 dark:text-white`}>
                                                            {ayahText}
                                                        </div>
                                                    </div>

                                                    {/* Translation - Enhanced */}
                                                    {preferences.language === 'en' && ayah.translation && (
                                                        <div className="text-left text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-r-4 border-green-500">
                                                            {ayah.translation}
                                                        </div>
                                                    )}

                                                    {/* Sajda indicator - Enhanced */}
                                                    {ayah.sajda && (
                                                        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                                            <div className="flex items-center gap-2">
                                                                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                                                                    {preferences.language === 'ar' ? 'سجدة' : 'Sajda'} - {preferences.language === 'ar' ? 'آية سجدة' : 'Prostration Verse'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 