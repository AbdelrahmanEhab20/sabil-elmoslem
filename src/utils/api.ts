import { PrayerTimes, Location, Azkar, QuranSurah, QuranAyah, HijriDate } from '@/types';
// import { TajweedAyah } from '@/types'; // HASHED FOR NOW
import { ApiError, NetworkError, LocationError, ValidationError, retry, withErrorHandling } from './errorHandling';

// API Configuration
const API_CONFIG = {
    ALADHAN_BASE_URL: 'https://api.aladhan.com/v1',
    ALQURAN_BASE_URL: 'https://api.alquran.cloud/v1',
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/geo/1.0',
    TIMEOUT: 10000, // 10 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Enhanced fetch wrapper with error handling
const apiFetch = async (url: string, options?: RequestInit): Promise<Response> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new ApiError(
                `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                response.statusText
            );
        }

        return response;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new NetworkError('Network connection failed', error);
        }

        throw new NetworkError('Request failed', error as Error);
    }
};

// Cache utility for API responses
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

const getCachedData = <T>(key: string): T | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data as T;
    }
    cache.delete(key);
    return null;
};

const setCachedData = <T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void => {
    cache.set(key, { data, timestamp: Date.now(), ttl });
};



// Simple DST adjustment for Egypt and other regions
const adjustTimeForDST = (timeString: string, location: Location): string => {
    try {
        // Check if location is in Egypt (Cairo region)
        const isEgypt = location.latitude >= 22 && location.latitude <= 32 &&
            location.longitude >= 25 && location.longitude <= 37;

        if (!isEgypt) {
            return timeString; // No adjustment for non-Egypt locations
        }

        // Check if it's summer time (DST) in Egypt
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // 1-12
        const isSummerTime = currentMonth >= 4 && currentMonth <= 10; // April to October

        if (!isSummerTime) {
            return timeString; // No adjustment during winter time
        }

        // Add 1 hour for summer time
        const [hours, minutes] = timeString.split(':').map(Number);
        const adjustedHours = (hours + 1) % 24;

        return `${adjustedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
        console.warn('Error adjusting time for DST:', error);
        return timeString; // Return original time if adjustment fails
    }
};

// Prayer Times API with enhanced error handling and DST support
export const fetchPrayerTimes = withErrorHandling(async (
    location: Location,
    method: number = 1,
    madhab: number = 1
): Promise<PrayerTimes> => {
    const date = new Date().toLocaleDateString('en-CA');
    const cacheKey = `prayer-times-${location.latitude}-${location.longitude}-${method}-${madhab}-${date}`;

    // Check cache first
    const cached = getCachedData<PrayerTimes>(cacheKey);
    if (cached) {
        return cached;
    }

    const url = `${API_CONFIG.ALADHAN_BASE_URL}/timings/${date}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}&madhab=${madhab}`;

    return retry(async () => {
        const response = await apiFetch(url);
        const data = await response.json();

        if (!data.data?.timings) {
            throw new ApiError('Invalid prayer times data received', 422);
        }

        const prayerTimes = data.data.timings;

        // Apply DST adjustment for Egypt
        const adjustedPrayerTimes: PrayerTimes = {
            Fajr: adjustTimeForDST(prayerTimes.Fajr, location),
            Sunrise: adjustTimeForDST(prayerTimes.Sunrise, location),
            Dhuhr: adjustTimeForDST(prayerTimes.Dhuhr, location),
            Asr: adjustTimeForDST(prayerTimes.Asr, location),
            Maghrib: adjustTimeForDST(prayerTimes.Maghrib, location),
            Isha: adjustTimeForDST(prayerTimes.Isha, location),
            Imsak: adjustTimeForDST(prayerTimes.Imsak, location),
            Midnight: adjustTimeForDST(prayerTimes.Midnight, location),
            Firstthird: adjustTimeForDST(prayerTimes.Firstthird, location),
            Lastthird: adjustTimeForDST(prayerTimes.Lastthird, location),
        };

        // Cache the result for 5 minutes
        setCachedData(cacheKey, adjustedPrayerTimes, 5 * 60 * 1000);

        return adjustedPrayerTimes;
    }, API_CONFIG.RETRY_ATTEMPTS, API_CONFIG.RETRY_DELAY);
}, 'fetchPrayerTimes');

// Hijri Date API
export const fetchHijriDate = withErrorHandling(async (): Promise<HijriDate> => {
    const date = new Date().toLocaleDateString('en-CA');
    const cacheKey = `hijri-date-${date}`;

    const cached = getCachedData<HijriDate>(cacheKey);
    if (cached) {
        return cached;
    }

    const url = `${API_CONFIG.ALADHAN_BASE_URL}/gToH/${date}`;

    return retry(async () => {
        const response = await apiFetch(url);
        const data = await response.json();

        if (!data.data?.hijri) {
            throw new ApiError('Invalid Hijri date data received', 422);
        }

        const hijriDate = data.data.hijri;

        // Cache for 1 hour since Hijri date doesn't change frequently
        setCachedData(cacheKey, hijriDate, 60 * 60 * 1000);

        return hijriDate;
    }, API_CONFIG.RETRY_ATTEMPTS, API_CONFIG.RETRY_DELAY);
}, 'fetchHijriDate');

// Quran Surahs API
export const fetchQuranSurahs = withErrorHandling(async (): Promise<QuranSurah[]> => {
    const cacheKey = 'quran-surahs';

    const cached = getCachedData<QuranSurah[]>(cacheKey);
    if (cached) {
        return cached;
    }

    const url = `${API_CONFIG.ALQURAN_BASE_URL}/surah`;

    return retry(async () => {
        const response = await apiFetch(url);
        const data = await response.json();

        if (!Array.isArray(data.data)) {
            throw new ApiError('Invalid Quran surahs data received', 422);
        }

        const surahs = data.data;

        // Cache for 24 hours since Quran data rarely changes
        setCachedData(cacheKey, surahs, 24 * 60 * 60 * 1000);

        return surahs;
    }, API_CONFIG.RETRY_ATTEMPTS, API_CONFIG.RETRY_DELAY);
}, 'fetchQuranSurahs');

// Quran Ayahs API with English translations
export const fetchQuranAyahs = withErrorHandling(async (surahNumber: number): Promise<QuranAyah[]> => {
    const cacheKey = `quran-ayahs-${surahNumber}`;

    const cached = getCachedData<QuranAyah[]>(cacheKey);
    if (cached) {
        return cached;
    }

    // Fetch both Arabic text and English translation
    const [arabicResponse, englishResponse] = await Promise.all([
        apiFetch(`${API_CONFIG.ALQURAN_BASE_URL}/surah/${surahNumber}`),
        apiFetch(`${API_CONFIG.ALQURAN_BASE_URL}/surah/${surahNumber}/en.sahih`)
    ]);

    const [arabicData, englishData] = await Promise.all([
        arabicResponse.json(),
        englishResponse.json()
    ]);

    if (!arabicData.data?.ayahs || !Array.isArray(arabicData.data.ayahs)) {
        throw new ApiError('Invalid Quran ayahs data received', 422);
    }

    if (!englishData.data?.ayahs || !Array.isArray(englishData.data.ayahs)) {
        throw new ApiError('Invalid Quran translation data received', 422);
    }

    // Combine Arabic text with English translations
    const ayahs = arabicData.data.ayahs.map((ayah: Record<string, unknown>, index: number) => ({
        ...ayah,
        translation: englishData.data.ayahs[index]?.text || ''
    }));

    // Cache for 24 hours
    setCachedData(cacheKey, ayahs, 24 * 60 * 60 * 1000);

    return ayahs;
}, 'fetchQuranAyahs');

// Fetch Quran ayahs with Tajweed processing - HASHED FOR NOW
// export const fetchQuranAyahsWithTajweed = withErrorHandling(async (surahNumber: number): Promise<TajweedAyah[]> => {
//     const cacheKey = `quran-tajweed-ayahs-${surahNumber}`;

//     const cached = getCachedData<TajweedAyah[]>(cacheKey);
//     if (cached) {
//         return cached;
//     }

//     // Fetch Arabic text and English translation
//     const [arabicResponse, englishResponse] = await Promise.all([
//         apiFetch(`${API_CONFIG.ALQURAN_BASE_URL}/surah/${surahNumber}`),
//         apiFetch(`${API_CONFIG.ALQURAN_BASE_URL}/surah/${surahNumber}/en.sahih`)
//     ]);

//     const [arabicData, englishData] = await Promise.all([
//         arabicResponse.json(),
//         englishResponse.json()
//     ]);

//     if (!arabicData.data?.ayahs || !Array.isArray(arabicData.data.ayahs)) {
//         throw new ApiError('Invalid Quran ayahs data received', 422);
//     }

//     if (!englishData.data?.ayahs || !Array.isArray(englishData.data.ayahs)) {
//         throw new ApiError('Invalid Quran translation data received', 422);
//     }

//     // Create Tajweed processor
//     const { createTajweedProcessor } = await import('./tajweedProcessor');
//     const processor = await createTajweedProcessor();

//     // Process each ayah with Tajweed
//     const tajweedAyahs: TajweedAyah[] = arabicData.data.ayahs.map((ayah: Record<string, unknown>, index: number) => {
//         const ayahText = ayah.text as string;
//         const words = processor.processText(ayahText);

//         // Create HTML with colored spans
//         const tajweedText = words.map(word => {
//             if (word.tajweedRules.length === 0) {
//                 return word.text;
//             }
//             const color = word.tajweedRules[0].color;
//             return `<span style="color: ${color}; font-weight: 600; text-shadow: 0 0 1px ${color}40;">${word.text}</span>`;
//         }).join(' ');

//         return {
//             ...ayah,
//             translation: englishData.data.ayahs[index]?.text || '',
//             words,
//             tajweedText,
//             tajweedRules: Array.from(new Set(words.flatMap(word => word.tajweedRules)))
//         } as TajweedAyah;
//     });

//     // Cache for 24 hours
//     setCachedData(cacheKey, tajweedAyahs, 24 * 60 * 60 * 1000);

//     return tajweedAyahs;
// }, 'fetchQuranAyahsWithTajweed');

// Azkar data with enhanced error handling
export const fetchAzkar = withErrorHandling(async (language: 'en' | 'ar' = 'en'): Promise<Azkar[]> => {
    const cacheKey = `azkar-${language}`;

    const cached = getCachedData<Azkar[]>(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        let data;
        if (language === 'ar') {
            data = await import('@/data/azkar.json');
        } else {
            data = await import('@/data/azkar-en.json');
        }

        if (!data.default || typeof data.default !== 'object') {
            throw new ApiError('Invalid Azkar data format', 422);
        }

        // Flatten all categories into a single array and add IDs
        const flattenedAzkar: Azkar[] = [];
        let idCounter = 1;

        Object.entries(data.default).forEach(([categoryName, azkarList]) => {
            if (Array.isArray(azkarList)) {
                azkarList.forEach(azkar => {
                    if (azkar && typeof azkar === 'object') {
                        flattenedAzkar.push({
                            ...azkar,
                            id: idCounter++,
                            category: categoryName
                        } as Azkar);
                    }
                });
            }
        });

        // Cache for 1 hour
        setCachedData(cacheKey, flattenedAzkar, 60 * 60 * 1000);

        return flattenedAzkar;
    } catch (error) {
        const message = language === 'ar' ? 'فشل في جلب الأذكار' : 'Failed to fetch Azkar';
        throw new ApiError(message, 500, 'AZKAR_LOAD_ERROR', { language, error });
    }
}, 'fetchAzkar');

// Enhanced location handling
export const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new LocationError('Geolocation is not supported by this browser'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5 * 60 * 1000 // 5 minutes
        };

        const successHandler = (position: GeolocationPosition) => {
            resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        };

        const errorHandler = (error: GeolocationPositionError) => {
            let message: string;
            let code: number;

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = 'Location access denied. Please allow location access in your browser settings.';
                    code = 1;
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = 'Location information is unavailable.';
                    code = 2;
                    break;
                case error.TIMEOUT:
                    message = 'Location request timed out.';
                    code = 3;
                    break;
                default:
                    message = 'An unknown error occurred while getting location.';
                    code = 0;
            }

            reject(new LocationError(message, code));
        };

        navigator.geolocation.getCurrentPosition(successHandler, errorHandler, options);
    });
};

// Enhanced city search with better error handling
export const searchCityCoordinates = withErrorHandling(async (
    cityName: string,
    language: string = 'en'
): Promise<Location> => {
    if (!cityName.trim()) {
        throw new ValidationError('City name is required', 'cityName');
    }

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
        const msg = language === 'ar'
            ? 'مفتاح واجهة برمجة التطبيقات غير متوفر. يرجى الاتصال بالدعم.'
            : 'API key is missing. Please contact support.';
        throw new ApiError(msg, 500, 'MISSING_API_KEY');
    }

    const url = `${API_CONFIG.OPENWEATHER_BASE_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}&lang=${language}`;

    return retry(async () => {
        const response = await apiFetch(url);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            const msg = language === 'ar' ? 'لم يتم العثور على المدينة' : 'City not found';
            throw new ApiError(msg, 404, 'CITY_NOT_FOUND', { cityName });
        }

        const cityData = data[0];
        if (!cityData.lat || !cityData.lon) {
            throw new ApiError('Invalid city coordinates received', 422, 'INVALID_COORDINATES');
        }

        return {
            latitude: cityData.lat,
            longitude: cityData.lon,
            city: cityData.name,
            country: cityData.country
        };
    }, API_CONFIG.RETRY_ATTEMPTS, API_CONFIG.RETRY_DELAY);
}, 'searchCityCoordinates');

// Cache management utilities
export const clearApiCache = (pattern?: string): void => {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    } else {
        cache.clear();
    }
};

export const getCacheStats = () => {
    return {
        size: cache.size,
        keys: Array.from(cache.keys()),
        entries: Array.from(cache.entries()).map(([key, value]) => ({
            key,
            age: Date.now() - value.timestamp,
            ttl: value.ttl
        }))
    };
}; 