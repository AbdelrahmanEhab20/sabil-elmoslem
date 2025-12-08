'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { fetchQuranSurahs, fetchQuranAyahs } from '@/utils/api';
import { QuranSurah, QuranAyah } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';
import AudioPlayer from '@/components/AudioPlayer';
import { QURAN_RECITERS, getAyahAudioUrl } from '@/data/reciters';
import { Play, Pause, Volume2 } from 'lucide-react';

// Storage keys for preferences
const STORAGE_KEYS = {
    FONT_SIZE: 'quran-font-size',
    RECITER: 'quran-reciter',
} as const;

// Helper functions for localStorage with lazy initialization
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

const getStoredReciter = (): number => {
    if (typeof window === 'undefined') return 1;
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.RECITER);
        if (saved) {
            const reciterId = parseInt(saved);
            if (QURAN_RECITERS.some(r => r.id === reciterId)) {
                return reciterId;
            }
        }
    } catch (error) {
        console.warn('Failed to load reciter from localStorage:', error);
    }
    return 1;
};

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

    // Use lazy initialization to read from localStorage only once, avoiding re-renders
    const [fontSize, setFontSize] = useState<'lg' | 'xl' | '2xl' | '3xl' | '4xl'>(getStoredFontSize);
    const [selectedReciter, setSelectedReciter] = useState(getStoredReciter);

    // Track if initial mount is complete to prevent saving defaults on first render
    const isInitialMount = useRef(true);

    // Audio state
    const [playingAyah, setPlayingAyah] = useState<number | null>(null);
    const [isAutoPlay, setIsAutoPlay] = useState(false);

    // Refs for auto-scroll
    const ayahRefs = useRef<Map<number, HTMLDivElement>>(new Map());

    // Save reciter to localStorage (only after initial mount)
    useEffect(() => {
        if (isInitialMount.current) return;
        try {
            localStorage.setItem(STORAGE_KEYS.RECITER, selectedReciter.toString());
        } catch (error) {
            console.warn('Failed to save reciter to localStorage:', error);
        }
    }, [selectedReciter]);

    // Auto-scroll to playing ayah
    useEffect(() => {
        if (playingAyah !== null) {
            const ayahElement = ayahRefs.current.get(playingAyah);
            if (ayahElement) {
                ayahElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }, [playingAyah]);

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

    // Fetch surahs on mount
    useEffect(() => {
        const loadSurahs = async () => {
            try {
                setLoading(true);
                const surahsData = await fetchQuranSurahs();
                setSurahs(surahsData);
                // Always start with surah list - user chooses which surah to read
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : t.errorLoadingQuran;
                toastRef.current.showToast({ type: 'error', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        loadSurahs();
    }, [t.errorLoadingQuran]);

    // Fetch ayahs when selectedSurah changes
    useEffect(() => {
        const loadAyahs = async () => {
            if (selectedSurah) {
                try {
                    setSurahLoading(true);
                    // Clear refs and reset audio state when switching surahs
                    ayahRefs.current.clear();
                    setPlayingAyah(null);
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
        setPlayingAyah(null); // Stop any playing audio
    };

    const handleBackToList = () => {
        setSelectedSurah(null);
        setAyahs([]);
        setSearchTerm(''); // Clear search when going back to list
        setView('surah-list');
        setPlayingAyah(null); // Stop any playing audio
    };

    // Audio control functions
    const handlePlayAyah = useCallback((ayahNumber: number) => {
        if (playingAyah === ayahNumber) {
            setPlayingAyah(null);
        } else {
            setPlayingAyah(ayahNumber);
        }
    }, [playingAyah]);

    const handleAudioEnded = useCallback(() => {
        if (isAutoPlay && selectedSurah && playingAyah !== null) {
            // Find next ayah
            const currentIndex = ayahs.findIndex(a => a.numberInSurah === playingAyah);
            if (currentIndex !== -1 && currentIndex < ayahs.length - 1) {
                setPlayingAyah(ayahs[currentIndex + 1].numberInSurah);
            } else {
                setPlayingAyah(null);
                setIsAutoPlay(false);
            }
        } else {
            setPlayingAyah(null);
        }
    }, [isAutoPlay, selectedSurah, playingAyah, ayahs]);

    const handlePlayAll = useCallback(() => {
        if (ayahs.length > 0) {
            setIsAutoPlay(true);
            setPlayingAyah(ayahs[0].numberInSurah);
        }
    }, [ayahs]);

    const handleStopAll = useCallback(() => {
        setIsAutoPlay(false);
        setPlayingAyah(null);
    }, []);

    const getAudioUrl = useCallback((ayahNumberInSurah: number) => {
        if (!selectedSurah) return '';
        return getAyahAudioUrl(selectedSurah.number, ayahNumberInSurah, selectedReciter);
    }, [selectedSurah, selectedReciter]);

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

    const isArabic = preferences.language === 'ar';

    return (
        <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900">
            {/* Hero Header - Only show on surah list view */}
            {view === 'surah-list' && (
                <section className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 text-white py-12 md:py-16 overflow-hidden">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 8.5L51.5 30L30 51.5L8.5 30L30 8.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }} />
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                        <motion.div
                            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 backdrop-blur-sm"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </motion.div>
                        <motion.h1
                            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isArabic ? 'font-arabic-display' : ''}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {isArabic ? 'القرآن الكريم' : 'The Holy Quran'}
                        </motion.h1>
                        <motion.p
                            className={`text-lg md:text-xl text-purple-100 max-w-2xl mx-auto ${isArabic ? 'font-arabic-body' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            {isArabic ? 'اقرأ وتأمل في كلام الله' : 'Read and reflect upon the words of Allah'}
                        </motion.p>
                    </div>

                    {/* Bottom wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                            <path d="M0 30L60 25C120 20 240 10 360 15C480 20 600 40 720 45C840 50 960 40 1080 30C1200 20 1320 10 1380 5L1440 0V60H0V30Z" className="fill-gray-50 dark:fill-gray-900" />
                        </svg>
                    </div>
                </section>
            )}

            {/* Sidebar Toggle Button for Mobile */}
            <button
                className="md:hidden fixed top-20 left-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-xl hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 transition-all duration-200 rtl:left-auto rtl:right-4"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={isArabic ? 'فتح قائمة السور' : 'Open Surah List'}
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
                        lg:static lg:translate-x-0 lg:w-72 lg:h-[calc(100vh-5rem)] lg:rounded-2xl lg:shadow-xl lg:border lg:border-gray-100 lg:dark:border-gray-700
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                    style={{ direction: isArabic ? 'rtl' : 'ltr' }}
                    aria-label={isArabic ? 'قائمة السور' : 'Surah List'}
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
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
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
                                            ? 'bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg transform scale-[1.02]'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-900 dark:text-white hover:shadow-md'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                                        ${selectedSurah?.number === surah.number
                                            ? 'bg-white/20 text-white'
                                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
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
                        {view === 'surah-list' ? (
                            <>
                                {/* Search Bar - Only show on desktop when sidebar is visible */}
                                <motion.div
                                    className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-8"
                                    initial={{ opacity: 0, y: 8 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4 }}
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
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                            />
                                        </div>
                                        <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-sm font-medium text-purple-700 dark:text-purple-300 whitespace-nowrap">
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
                                            className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-700"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                                                    <span className="text-lg font-bold text-white">
                                                        {surah.number}
                                                    </span>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRevelationTypeColor(surah.revelationType)}`}>
                                                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
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
                                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 mb-6 sm:mb-8"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4 }}
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
                                                                ? 'bg-purple-600 text-white shadow-lg transform scale-105'
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

                                    {/* Audio Controls - Compact and Clean */}
                                    <div className="pt-4">
                                        <div className="bg-white dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                                            <div className="flex flex-wrap items-center gap-3">
                                                {/* Volume Icon */}
                                                <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />

                                                {/* Reciter Selector - Compact */}
                                                <div className="relative">
                                                    <select
                                                        value={selectedReciter}
                                                        onChange={(e) => {
                                                            setSelectedReciter(Number(e.target.value));
                                                            setPlayingAyah(null);
                                                        }}
                                                        className="appearance-none bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 pr-8 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                                                    >
                                                        {QURAN_RECITERS.map((reciter) => (
                                                            <option key={reciter.id} value={reciter.id}>
                                                                {preferences.language === 'ar' ? reciter.nameAr : reciter.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>

                                                {/* Play/Stop Button */}
                                                {playingAyah === null ? (
                                                    <button
                                                        onClick={handlePlayAll}
                                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                        <span className="hidden sm:inline">{preferences.language === 'ar' ? 'تشغيل' : 'Play'}</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={handleStopAll}
                                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm shadow-sm"
                                                    >
                                                        <Pause className="w-4 h-4" />
                                                        <span className="hidden sm:inline">{preferences.language === 'ar' ? 'إيقاف' : 'Stop'}</span>
                                                    </button>
                                                )}

                                                {/* Auto-play Toggle */}
                                                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer ml-auto">
                                                    <input
                                                        type="checkbox"
                                                        checked={isAutoPlay}
                                                        onChange={(e) => setIsAutoPlay(e.target.checked)}
                                                        className="w-4 h-4 accent-purple-600 rounded"
                                                    />
                                                    <span className="hidden sm:inline">{preferences.language === 'ar' ? 'تشغيل تلقائي' : 'Auto-play'}</span>
                                                    <span className="sm:hidden">{preferences.language === 'ar' ? 'تلقائي' : 'Auto'}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Bismillah Header for non-Fatiha surahs - Enhanced */}
                                {selectedSurah && selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                                    <motion.div
                                        className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl shadow-xl p-8 sm:p-12 mb-8 border border-purple-100 dark:border-purple-800"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="text-center">
                                            <div className="text-3xl sm:text-4xl lg:text-5xl leading-relaxed text-gray-900 dark:text-white font-arabic mb-6">
                                                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
                                            </div>
                                            <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-violet-500 mx-auto rounded-full"></div>
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
                                                    ref={(el) => {
                                                        if (el) ayahRefs.current.set(ayah.numberInSurah, el);
                                                    }}
                                                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl p-6 sm:p-8 transition-all duration-300 border ${playingAyah === ayah.numberInSurah
                                                        ? 'border-purple-500 ring-2 ring-purple-500/20'
                                                        : 'border-gray-100 dark:border-gray-700'
                                                        }`}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.35 }}
                                                >
                                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-md">
                                                                <span className="text-sm font-bold text-white">
                                                                    {ayah.numberInSurah}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                                {preferences.language === 'ar' ? 'آية' : 'Ayah'} {ayah.numberInSurah}
                                                            </span>
                                                            {/* Play button for individual ayah */}
                                                            <button
                                                                onClick={() => handlePlayAyah(ayah.numberInSurah)}
                                                                className={`p-2 rounded-lg transition-all duration-200 ${playingAyah === ayah.numberInSurah
                                                                    ? 'bg-blue-600 text-white'
                                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'
                                                                    }`}
                                                                aria-label={playingAyah === ayah.numberInSurah ? 'Pause' : 'Play'}
                                                            >
                                                                {playingAyah === ayah.numberInSurah ? (
                                                                    <Pause className="w-4 h-4" />
                                                                ) : (
                                                                    <Play className="w-4 h-4" />
                                                                )}
                                                            </button>
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

                                                    {/* Audio Player - shows when this ayah is playing */}
                                                    {playingAyah === ayah.numberInSurah && (
                                                        <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                                                            <AudioPlayer
                                                                src={getAudioUrl(ayah.numberInSurah)}
                                                                onEnded={handleAudioEnded}
                                                                autoPlay={true}
                                                                showNavigation={ayahs.length > 1}
                                                                onPrevious={ayah.numberInSurah > 1 ? () => handlePlayAyah(ayah.numberInSurah - 1) : undefined}
                                                                onNext={ayah.numberInSurah < ayahs.length ? () => handlePlayAyah(ayah.numberInSurah + 1) : undefined}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Arabic Text - Enhanced */}
                                                    <div className="mb-6">
                                                        <div className={`font-arabic text-right ${fontSize === 'lg' ? 'text-lg sm:text-xl' : fontSize === 'xl' ? 'text-xl sm:text-2xl' : fontSize === '2xl' ? 'text-2xl sm:text-3xl' : fontSize === '3xl' ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'} leading-loose sm:leading-relaxed text-gray-900 dark:text-white`}>
                                                            {ayahText}
                                                        </div>
                                                    </div>

                                                    {/* Translation - Enhanced */}
                                                    {preferences.language === 'en' && ayah.translation && (
                                                        <div className="text-left text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-r-4 border-purple-500">
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