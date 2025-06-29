import { PrayerTimes, Location, Azkar, QuranSurah, QuranAyah, HijriDate } from '@/types';

// Prayer Times API (Aladhan)
export const fetchPrayerTimes = async (
    location: Location,
    method: number = 1,
    madhab: number = 1
): Promise<PrayerTimes> => {
    const date = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

    const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}&madhab=${madhab}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to fetch prayer times');
        }

        const data = await response.json();
        return data.data.timings;
    } catch {
        console.error('Error fetching prayer times');
        throw new Error('Failed to fetch prayer times');
    }
};

// Hijri Date API
export const fetchHijriDate = async (): Promise<HijriDate> => {
    const date = new Date().toLocaleDateString('en-CA');
    const url = `https://api.aladhan.com/v1/gToH/${date}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to fetch Hijri date');
        }

        const data = await response.json();
        return data.data.hijri;
    } catch {
        console.error('Error fetching Hijri date');
        throw new Error('Failed to fetch Hijri date');
    }
};

// Quran Surahs API
export const fetchQuranSurahs = async (): Promise<QuranSurah[]> => {
    const url = 'https://api.alquran.cloud/v1/surah';

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to fetch Quran surahs');
        }

        const data = await response.json();
        return data.data;
    } catch {
        console.error('Error fetching Quran surahs');
        throw new Error('Failed to fetch Quran surahs');
    }
};

// Quran Ayahs API
export const fetchQuranAyahs = async (surahNumber: number): Promise<QuranAyah[]> => {
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('Failed to fetch Quran ayahs');
        }

        const data = await response.json();
        return data.data.ayahs;
    } catch {
        console.error('Error fetching Quran ayahs');
        throw new Error('Failed to fetch Quran ayahs');
    }
};

// Azkar data (using local JSON files)
export const fetchAzkar = async (language: 'en' | 'ar' = 'en'): Promise<Azkar[]> => {
    try {
        // Import the data directly since we're in a client-side context
        let data;
        if (language === 'ar') {
            data = await import('@/data/azkar.json');
        } else {
            data = await import('@/data/azkar-en.json');
        }

        // Flatten all categories into a single array and add IDs
        const flattenedAzkar: Azkar[] = [];
        let idCounter = 1;

        Object.entries(data.default).forEach(([categoryName, azkarList]) => {
            if (Array.isArray(azkarList)) {
                azkarList.forEach(azkar => {
                    flattenedAzkar.push({
                        ...azkar,
                        id: idCounter++,
                        category: categoryName
                    });
                });
            }
        });

        return flattenedAzkar;
    } catch {
        throw new Error(language === 'ar' ? 'فشل في جلب الأذكار' : 'Failed to fetch Azkar');
    }
};

// Get user's current location
export const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            }
        );
    });
};

// Search for city coordinates (using a simple geocoding service)
export const searchCityCoordinates = async (cityName: string, language: string = 'en'): Promise<Location> => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        const msg = language === 'ar' ? 'مفتاح واجهة برمجة التطبيقات غير متوفر. يرجى الاتصال بالدعم.' : 'API key is missing. Please contact support.';
        throw new Error(msg);
    }
    try {
        const response = await fetch(
            `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}&lang=${language}`
        );

        if (!response.ok) {
            const msg = language === 'ar' ? 'فشل في جلب إحداثيات المدينة' : 'Failed to fetch city coordinates';
            throw new Error(msg);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            const msg = language === 'ar' ? 'لم يتم العثور على المدينة' : 'City not found';
            throw new Error(msg);
        }

        return {
            latitude: data[0].lat,
            longitude: data[0].lon,
            city: data[0].name,
            country: data[0].country
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : (language === 'ar' ? 'حدث خطأ أثناء البحث عن المدينة' : 'Error searching city');
        throw new Error(errorMessage);
    }
}; 