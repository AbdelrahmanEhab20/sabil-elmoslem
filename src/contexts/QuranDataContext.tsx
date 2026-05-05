'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { QuranAyah, QuranSurah } from '@/types';
import { fetchQuranAyahs, fetchQuranSurahs } from '@/utils/api';

type LoadStatus = 'idle' | 'loading' | 'success' | 'error';
const SURAH_LIST_STORAGE_KEY = 'quran-surah-list-v1';

interface QuranDataContextValue {
  surahs: QuranSurah[];
  surahListStatus: LoadStatus;
  surahListError: string | null;
  loadSurahs: (signal?: AbortSignal) => Promise<QuranSurah[]>;
  loadSurahAyahs: (surahNumber: number, signal?: AbortSignal) => Promise<QuranAyah[]>;
}

const QuranDataContext = createContext<QuranDataContextValue | null>(null);

export function QuranDataProvider({ children }: { children: React.ReactNode }) {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [surahListStatus, setSurahListStatus] = useState<LoadStatus>('idle');
  const [surahListError, setSurahListError] = useState<string | null>(null);
  const ayahsCacheRef = useRef<Map<number, QuranAyah[]>>(new Map());

  const loadSurahs = useCallback(async (signal?: AbortSignal) => {
    if (surahs.length > 0) return surahs;

    setSurahListStatus('loading');
    setSurahListError(null);
    try {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(SURAH_LIST_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached) as QuranSurah[];
          if (Array.isArray(parsed) && parsed.length === 114) {
            setSurahs(parsed);
            setSurahListStatus('success');
            return parsed;
          }
        }
      }

      const list = await fetchQuranSurahs(signal);
      setSurahs(list);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SURAH_LIST_STORAGE_KEY, JSON.stringify(list));
      }
      setSurahListStatus('success');
      return list;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      const message = error instanceof Error ? error.message : 'Failed to load surah list';
      setSurahListError(message);
      setSurahListStatus('error');
      throw error;
    }
  }, [surahs]);

  const loadSurahAyahs = useCallback(async (surahNumber: number, signal?: AbortSignal) => {
    const cached = ayahsCacheRef.current.get(surahNumber);
    if (cached) return cached;

    const ayahs = await fetchQuranAyahs(surahNumber, signal);
    ayahsCacheRef.current.set(surahNumber, ayahs);
    return ayahs;
  }, []);

  const value = useMemo(
    () => ({ surahs, surahListStatus, surahListError, loadSurahs, loadSurahAyahs }),
    [surahs, surahListStatus, surahListError, loadSurahs, loadSurahAyahs]
  );

  return <QuranDataContext.Provider value={value}>{children}</QuranDataContext.Provider>;
}

export function useQuranData() {
  const context = useContext(QuranDataContext);
  if (!context) {
    throw new Error('useQuranData must be used within QuranDataProvider');
  }
  return context;
}
