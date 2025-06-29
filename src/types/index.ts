export interface PrayerTimes {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
}

export interface Azkar {
    id?: number;
    category: string;
    count: string;
    description: string;
    reference: string;
    content: string;
}

export interface AzkarCategory {
    [categoryName: string]: Azkar[];
}

export interface QuranSurah {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
}

export interface QuranAyah {
    number: number;
    text: string;
    numberInSurah: number;
    juz: number;
    manzil: number;
    page: number;
    ruku: number;
    hizbQuarter: number;
    sajda: boolean;
}

export interface UserPreferences {
    calculationMethod: number;
    madhab: number;
    theme: 'light' | 'dark';
    language: 'en' | 'ar';
}

export interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: {
        en: string;
        ar: string;
    };
    month: {
        number: number;
        en: string;
        ar: string;
    };
    year: string;
    designation: {
        abbreviated: string;
        expanded: string;
    };
    holidays?: string[];
} 