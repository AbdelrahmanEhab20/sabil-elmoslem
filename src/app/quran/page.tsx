'use client';

import React, { useState, useEffect } from 'react';
import { fetchQuranSurahs, fetchQuranAyahs } from '@/utils/api';
import { QuranSurah, QuranAyah } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { useToast } from '@/components/ToastProvider';

export default function QuranPage() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const toast = useToast();
    const [surahs, setSurahs] = useState<QuranSurah[]>([]);
    const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
    const [ayahs, setAyahs] = useState<QuranAyah[]>([]);
    const [loading, setLoading] = useState(true);
    const [surahLoading, setSurahLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [view, setView] = useState<'surah-list' | 'ayah-view'>('surah-list');
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        surah.englishNameTranslation.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="min-h-screen py-8 flex">
            {/* Sidebar Toggle Button for Mobile */}
            <button
                className="md:hidden fixed top-20 left-4 z-50 bg-green-600 text-white p-2 rounded-full shadow-lg focus:outline-none rtl:left-auto rtl:right-4"
                onClick={() => setSidebarOpen(true)}
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
            <div className="flex-1">
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
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {surah.englishNameTranslation}
                                        </p>
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
                            <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8 border-b border-gray-200 dark:border-gray-700">
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
                                                {selectedSurah?.englishNameTranslation} • {selectedSurah?.numberOfAyahs} {preferences.language === 'ar' ? 'آية' : 'verses'}
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
                            </div>

                            {/* Ayahs */}
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
                                    {ayahs.map((ayah) => (
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

                                            <div className="text-right text-2xl leading-relaxed text-gray-900 dark:text-white font-arabic mb-4">
                                                {ayah.text}
                                            </div>

                                            {ayah.sajda && (
                                                <div className="mb-4 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                    <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
                                                        {preferences.language === 'ar' ? 'سجدة' : 'Sajda'} - {preferences.language === 'ar' ? 'آية سجدة' : 'Prostration Verse'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
} 