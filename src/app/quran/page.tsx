'use client';

import React, { useState, useEffect } from 'react';
import { fetchQuranSurahs, fetchQuranAyahs } from '@/utils/api';
import { QuranSurah, QuranAyah } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';
// import TajweedRulesBar from '@/components/TajweedRulesBar';
// import TajweedText from '@/components/TajweedText';

export default function QuranPage() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const toast = useToast();
    const [surahs, setSurahs] = useState<QuranSurah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
    const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
    // const [tajweedRules, setTajweedRules] = useState<TajweedRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [surahLoading, setSurahLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'surah-list' | 'ayah-view'>('surah-list');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // const [showTajweed, setShowTajweed] = useState(true);
    const [fontSize, setFontSize] = useState<'lg' | 'xl' | '2xl' | '3xl' | '4xl'>('2xl');

    // Load Tajweed rules - HASHED FOR NOW
    // useEffect(() => {
    //     const loadTajweedRules = async () => {
    //         try {
    //             const rulesData = await import('@/data/tajweed-rules.json');
    //             setTajweedRules(rulesData.rules);
    //         } catch (error) {
    //             console.error('Failed to load Tajweed rules:', error);
    //         }
    //     };
    //     loadTajweedRules();
    // }, []);

    // Fetch surahs on mount
    useEffect(() => {
        const loadSurahs = async () => {
            try {
                setLoading(true);
                const surahsData = await fetchQuranSurahs();
                setSurahs(surahsData);
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : t.errorLoadingQuran;
                toast.showToast({ type: 'error', message: errorMessage });
            } finally {
                setLoading(false);
            }
        };

        loadSurahs();
    }, [t.errorLoadingQuran, toast]);

    // Fetch ayahs when selectedSurah changes - SIMPLIFIED VERSION
    useEffect(() => {
        const loadAyahs = async () => {
            if (selectedSurah) {
                try {
                    setSurahLoading(true);
                    const ayahsData = await fetchQuranAyahs(selectedSurah.number);
                    setAyahs(ayahsData);
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : t.errorLoadingQuran;
                    toast.showToast({ type: 'error', message: errorMessage });
                } finally {
                    setSurahLoading(false);
                }
            }
        };
        loadAyahs();
    }, [selectedSurah, t.errorLoadingQuran, toast]);

    // Filter surahs by search term
    const filteredSurahs = surahs.filter(surah =>
        surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.englishName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        surah.number.toString().includes(searchTerm)
    );

    const handleSurahSelect = (surah: QuranSurah) => {
        setSelectedSurah(surah);
        setView('ayah-view');
    };

    const handleBackToList = () => {
        setSelectedSurah(null);
        setAyahs([]);
        setView('surah-list');
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
        <div className="min-h-screen relative bg-gray-50 dark:bg-gray-900">
            {/* Tajweed Rules Bar - HASHED FOR NOW */}
            {/* {view === 'ayah-view' && showTajweed && (
                <TajweedRulesBar rules={tajweedRules} className="tajweed-rules-bar" />
            )} */}

            {/* Floating Toggle Button for Tajweed Bar - HASHED FOR NOW */}
            {/* <button
                className={`fixed z-[1200] bottom-6 right-6 rtl:right-auto rtl:left-6 bg-green-600 text-white shadow-lg rounded-full p-4 flex items-center justify-center transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 dark:focus:ring-green-800 ${view !== 'ayah-view' ? 'hidden' : ''}`}
                style={{ display: view === 'ayah-view' ? 'flex' : 'none' }}
                onClick={() => setShowTajweed((prev) => !prev)}
                aria-label={showTajweed ? (preferences.language === 'ar' ? 'إخفاء شريط التجويد' : 'Hide Tajweed Bar') : (preferences.language === 'ar' ? 'إظهار شريط التجويد' : 'Show Tajweed Bar')}
            >
                {showTajweed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
            </button> */}

            {/* Add top padding to offset sticky bar - REMOVED SINCE NO TAJWEED BAR */}
            <div className="py-8 flex w-full">
                {/* Sidebar Toggle Button for Mobile */}
                <button
                    className="md:hidden fixed top-20 left-4 z-50 bg-green-600 text-white p-2 rounded-full shadow-lg focus:outline-none rtl:left-auto rtl:right-4"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label={preferences.language === 'ar' ? 'فتح قائمة السور' : 'Open Surah List'}
                >
                    <span className="text-xl">☰</span>
                </button>

                {/* Sidebar: Surah List */}
                <aside
                    className={`
                        fixed top-0 left-0 h-full w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto z-40 transition-transform duration-300
                        md:static md:translate-x-0 md:block md:h-[80vh] md:rounded-lg md:shadow-lg md:mr-6 rtl:md:mr-0 rtl:md:ml-6
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        md:transform-none
                    `}
                    style={{ direction: preferences.language === 'ar' ? 'rtl' : 'ltr' }}
                    aria-label={preferences.language === 'ar' ? 'قائمة السور' : 'Surah List'}
                >
                    {/* Close button for mobile */}
                    <div className="flex justify-between items-center mb-4 md:hidden">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {preferences.language === 'ar' ? 'قائمة السور' : 'Surah List'}
                        </h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="text-gray-700 dark:text-gray-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                            aria-label={preferences.language === 'ar' ? 'إغلاق القائمة' : 'Close list'}
                        >
                            ×
                        </button>
                    </div>

                    {/* Surah List */}
                    <ul className="space-y-1">
                        {surahs.map((surah) => (
                            <li key={surah.number}>
                                <button
                                    onClick={() => { handleSurahSelect(surah); setSidebarOpen(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-150
                                        ${selectedSurah?.number === surah.number ? 'bg-green-600 text-white' : 'hover:bg-green-100 dark:hover:bg-green-900/20 text-gray-900 dark:text-white'}`}
                                >
                                    <span className="font-arabic text-lg">{surah.name}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{surah.englishName}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Overlay for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Main Content */}
                <div className="flex-1 w-full">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                                {preferences.language === 'ar' ? 'القرآن الكريم' : 'The Holy Quran'}
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                {preferences.language === 'ar' ? 'اقرأ وتأمل في كلام الله' : 'Read and reflect upon the words of Allah'}
                            </p>
                        </div>

                        {view === 'surah-list' ? (
                            <>
                                {/* Search Bar */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder={preferences.language === 'ar' ? 'ابحث عن السور بالاسم أو الترجمة أو الرقم...' : 'Search surahs by name, translation, or number...'}
                                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            {filteredSurahs.length} {preferences.language === 'ar' ? 'من' : 'of'} {surahs.length} {preferences.language === 'ar' ? 'سورة' : 'surahs'}
                                        </div>
                                    </div>
                                </div>

                                {/* Surah Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredSurahs.map((surah) => (
                                        <button
                                            key={surah.number}
                                            onClick={() => handleSurahSelect(surah)}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {surah.number}
                                                    </span>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRevelationTypeColor(surah.revelationType)}`}>
                                                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                {surah.englishName}
                                            </h3>
                                            <p className="text-lg text-gray-700 dark:text-gray-300 mb-3 font-arabic">
                                                {surah.name}
                                            </p>
                                            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                                                <span>{surah.numberOfAyahs} {preferences.language === 'ar' ? 'آية' : 'verses'}</span>
                                                <span>Juz {Math.ceil(surah.number / 10)}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Empty State */}
                                {filteredSurahs.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📖</div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                            {preferences.language === 'ar' ? 'لم يتم العثور على سور' : 'No Surahs Found'}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {preferences.language === 'ar' ? 'حاول تعديل مصطلحات البحث.' : 'Try adjusting your search terms.'}
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Ayah View Header */}
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4 rtl:space-x-reverse">
                                            <button
                                                onClick={handleBackToList}
                                                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                                            >
                                                {preferences.language === 'ar' ? '← العودة إلى السور' : '← Back to Surahs'}
                                            </button>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                                    {selectedSurah?.englishName}
                                                </h2>
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    {selectedSurah?.numberOfAyahs} {preferences.language === 'ar' ? 'آية' : 'verses'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-arabic text-gray-900 dark:text-white">
                                                {selectedSurah?.name}
                                            </p>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRevelationTypeColor(selectedSurah?.revelationType || '')}`}>
                                                {selectedSurah?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Font Size Control - SIMPLIFIED VERSION */}
                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 shadow-sm border border-green-100 dark:border-green-800">
                                            <div className="flex items-center justify-end rtl:justify-start">
                                                <span className="text-lg font-semibold text-gray-900 dark:text-white mr-3 rtl:mr-0 rtl:ml-3">
                                                    {preferences.language === 'ar' ? 'حجم الخط' : 'Font Size'}
                                                </span>
                                                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                    <button
                                                        onClick={() => setFontSize('lg')}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${fontSize === 'lg' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                                                    >
                                                        S
                                                    </button>
                                                    <button
                                                        onClick={() => setFontSize('xl')}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${fontSize === 'xl' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                                                    >
                                                        M
                                                    </button>
                                                    <button
                                                        onClick={() => setFontSize('2xl')}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${fontSize === '2xl' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                                                    >
                                                        L
                                                    </button>
                                                    <button
                                                        onClick={() => setFontSize('3xl')}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${fontSize === '3xl' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                                                    >
                                                        XL
                                                    </button>
                                                    <button
                                                        onClick={() => setFontSize('4xl')}
                                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${fontSize === '4xl' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                                                    >
                                                        XXL
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bismillah Header for non-Fatiha surahs */}
                                {selectedSurah && selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
                                        <div className="text-center">
                                            <div className="text-3xl leading-relaxed text-gray-900 dark:text-white font-arabic mb-4">
                                                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ
                                            </div>
                                            <div className="w-16 h-1 bg-green-500 mx-auto rounded-full"></div>
                                        </div>
                                    </div>
                                )}

                                {/* Ayahs - SIMPLIFIED VERSION */}
                                {surahLoading ? (
                                    <div className="animate-pulse space-y-4">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-4"></div>
                                                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
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
                                                // All other surahs: Remove Bismillah from first ayah
                                                if (ayahText.startsWith("بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ")) {
                                                    ayahText = ayahText.split("بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ").join('');
                                                }
                                            }

                                            // Skip rendering if this is a Bismillah-only ayah (shouldn't happen with current logic)
                                            if (selectedSurah && selectedSurah.number !== 1 && ayah.numberInSurah === 1 && ayahText.trim() === '') {
                                                return null;
                                            }

                                            return (
                                                <div key={ayah.number} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                                                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                                                    {ayah.numberInSurah}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {preferences.language === 'ar' ? 'آية' : 'Ayah'} {ayah.numberInSurah}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {preferences.language === 'ar' ? 'جزء' : 'Juz'} {ayah.juz}
                                                        </div>
                                                    </div>

                                                    {/* Arabic Text - SIMPLIFIED VERSION */}
                                                    <div className="mb-4">
                                                        <div className={`font-arabic text-right ${fontSize === 'lg' ? 'text-lg' : fontSize === 'xl' ? 'text-xl' : fontSize === '2xl' ? 'text-2xl' : fontSize === '3xl' ? 'text-3xl' : 'text-4xl'} leading-relaxed text-gray-900 dark:text-white`}>
                                                            {ayahText}
                                                        </div>
                                                    </div>

                                                    {/* Translation */}
                                                    {preferences.language === 'en' && ayah.translation && (
                                                        <div className="text-left text-lg leading-relaxed text-gray-700 dark:text-gray-300 mb-4 border-l-4 border-green-500 pl-4">
                                                            {ayah.translation}
                                                        </div>
                                                    )}

                                                    {/* Sajda indicator */}
                                                    {ayah.sajda && (
                                                        <div className="mb-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
                                                                {preferences.language === 'ar' ? 'سجدة' : 'Sajda'} - {preferences.language === 'ar' ? 'آية سجدة' : 'Prostration Verse'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
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