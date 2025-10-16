import { PrayerTimes, Location, Azkar, QuranSurah, QuranAyah, HijriDate } from '@/types';
// import { TajweedAyah } from '@/types'; // HASHED FOR NOW
import { ApiError, NetworkError, LocationError, ValidationError, retry, withErrorHandling } from './errorHandling';

// Enhanced API Configuration with multiple providers
const API_CONFIG = {
    // Prayer Times APIs (multiple providers for reliability)
    ALADHAN_BASE_URL: 'https://api.aladhan.com/v1',
    ISLAMICFINDER_BASE_URL: 'https://www.islamicfinder.us/index.php/api',

    // Location and Geocoding APIs
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/geo/1.0',
    MAPBOX_BASE_URL: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
    NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',

    // Timezone API for accurate DST handling
    WORLDTIME_BASE_URL: 'https://worldtimeapi.org/api',
    TIMEZONE_DB_BASE_URL: 'http://api.timezonedb.com/v2.1',

    // Quran API
    ALQURAN_BASE_URL: 'https://api.alquran.cloud/v1',
    QURAN_COM_BASE_URL: 'https://api.quran.com/api/v4',

    // Configuration
    TIMEOUT: 15000, // 15 seconds for better reliability
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    LOCATION_ACCURACY_THRESHOLD: 1000, // meters
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



// Advanced timezone and DST detection
interface TimezoneInfo {
    timezone: string;
    utcOffset: number;
    isDst: boolean;
    dstOffset: number;
    abbreviation: string;
    countryCode?: string;
}

// Minimal shapes for Quran.com responses (to avoid `any`)
interface QuranComChapter {
    id: number;
    name_arabic?: string;
    name_simple?: string;
    translated_name?: { name?: string };
    verses_count?: number;
    revelation_place?: string;
}

interface QuranComVerse {
    id: number;
    text_uthmani?: string;
    text_imlaei_simple?: string;
    text_indopak?: string;
    translations?: Array<{ text: string }>;
    verse_number?: number;
    verse_key?: string;
    juz_number?: number;
    manzil_number?: number;
    page_number?: number;
    ruku_number?: number;
    rub_el_hizb_number?: number;
    hizb_number?: number;
    sajdah_number?: number | null;
}

// Get timezone information for a location
const getTimezoneInfo = async (location: Location): Promise<TimezoneInfo | null> => {
    try {
        // Try WorldTimeAPI first (more reliable for DST)
        const url = `${API_CONFIG.WORLDTIME_BASE_URL}/timezone/Etc/GMT${location.longitude > 0 ? '-' : '+'}${Math.abs(Math.round(location.longitude / 15))}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            const data = await response.json();
            return {
                timezone: data.timezone,
                utcOffset: parseInt(data.utc_offset.replace(':', '')) / 100,
                isDst: data.dst,
                dstOffset: data.dst_offset || 0,
                abbreviation: data.abbreviation
            };
        }

        // Fallback to browser's timezone detection
        const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const now = new Date();
        const januaryOffset = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
        const julyOffset = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
        const currentOffset = now.getTimezoneOffset();

        return {
            timezone: browserTz,
            utcOffset: -currentOffset / 60,
            isDst: currentOffset !== januaryOffset,
            dstOffset: Math.abs(januaryOffset - julyOffset) / 60,
            abbreviation: now.toLocaleTimeString('en', { timeZoneName: 'short' }).split(' ')[2] || 'UTC'
        };
    } catch (error) {
        console.warn('Failed to get timezone info:', error);
        return null;
    }
};



// Legacy DST adjustment for backward compatibility
const adjustTimeForDST = (timeString: string, location: Location, applyEgyptDST: boolean = false): string => {
    if (!applyEgyptDST) return timeString;

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

// Enhanced Prayer Times API with automatic timezone and DST handling
export const fetchPrayerTimes = withErrorHandling(async (
    location: Location,
    method: number = 1,
    madhab: number = 1,
    useAutoTimezone: boolean = false,
    applyEgyptDST: boolean = true // Legacy parameter for backward compatibility
): Promise<PrayerTimes & { timezoneInfo?: TimezoneInfo }> => {
    const date = new Date().toLocaleDateString('en-CA');
    const cacheKey = `prayer-times-${location.latitude.toFixed(4)}-${location.longitude.toFixed(4)}-${method}-${madhab}-${date}-auto-${useAutoTimezone}-dst-${applyEgyptDST}`;

    // Check cache first
    const cached = getCachedData<PrayerTimes & { timezoneInfo?: TimezoneInfo }>(cacheKey);
    if (cached) {
        return cached;
    }

    // Get timezone information for the location
    let timezoneInfo: TimezoneInfo | null = null;
    if (useAutoTimezone) {
        timezoneInfo = await getTimezoneInfo(location);
    }

    // Try multiple prayer time APIs for better reliability
    const prayerTimesProviders = [
        // Primary: Aladhan API with timezone support
        async () => {
            const timezone = timezoneInfo ? timezoneInfo.timezone : 'auto';
            const url = `${API_CONFIG.ALADHAN_BASE_URL}/timings/${date}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}&madhab=${madhab}&timezone=${timezone}`;
            const response = await apiFetch(url);
            const data = await response.json();

            if (!data.data?.timings) {
                throw new ApiError('Invalid prayer times data received from Aladhan API', 422);
            }

            return data.data.timings;
        },

        // Fallback: Simple coordinate-based calculation
        async () => {
            const url = `${API_CONFIG.ALADHAN_BASE_URL}/timings/${date}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}&madhab=${madhab}`;
            const response = await apiFetch(url);
            const data = await response.json();

            if (!data.data?.timings) {
                throw new ApiError('Invalid prayer times data received from fallback API', 422);
            }

            return data.data.timings;
        }
    ];

    return retry(async () => {
        let prayerTimes: PrayerTimes | null = null;
        let lastError: Error | null = null;

        // Try each provider until one succeeds
        for (const provider of prayerTimesProviders) {
            try {
                prayerTimes = await provider();
                break;
            } catch (error) {
                lastError = error as Error;
                console.warn('Prayer times provider failed, trying next:', error);
            }
        }

        if (!prayerTimes) {
            throw lastError || new ApiError('All prayer times providers failed', 503);
        }

        // Apply timezone adjustments if needed
        let adjustedPrayerTimes: PrayerTimes;

        if (useAutoTimezone && timezoneInfo) {
            // Use automatic timezone adjustment
            adjustedPrayerTimes = {
                Fajr: prayerTimes.Fajr,
                Sunrise: prayerTimes.Sunrise,
                Dhuhr: prayerTimes.Dhuhr,
                Asr: prayerTimes.Asr,
                Maghrib: prayerTimes.Maghrib,
                Isha: prayerTimes.Isha,
                Imsak: prayerTimes.Imsak,
                Midnight: prayerTimes.Midnight,
                Firstthird: prayerTimes.Firstthird,
                Lastthird: prayerTimes.Lastthird,
            };
        } else if (applyEgyptDST) {
            // Use legacy Egypt DST adjustment
            adjustedPrayerTimes = {
                Fajr: adjustTimeForDST(prayerTimes.Fajr, location, applyEgyptDST),
                Sunrise: adjustTimeForDST(prayerTimes.Sunrise, location, applyEgyptDST),
                Dhuhr: adjustTimeForDST(prayerTimes.Dhuhr, location, applyEgyptDST),
                Asr: adjustTimeForDST(prayerTimes.Asr, location, applyEgyptDST),
                Maghrib: adjustTimeForDST(prayerTimes.Maghrib, location, applyEgyptDST),
                Isha: adjustTimeForDST(prayerTimes.Isha, location, applyEgyptDST),
                Imsak: adjustTimeForDST(prayerTimes.Imsak, location, applyEgyptDST),
                Midnight: adjustTimeForDST(prayerTimes.Midnight, location, applyEgyptDST),
                Firstthird: adjustTimeForDST(prayerTimes.Firstthird, location, applyEgyptDST),
                Lastthird: adjustTimeForDST(prayerTimes.Lastthird, location, applyEgyptDST),
            };
        } else {
            // No adjustment
            adjustedPrayerTimes = {
                Fajr: prayerTimes.Fajr,
                Sunrise: prayerTimes.Sunrise,
                Dhuhr: prayerTimes.Dhuhr,
                Asr: prayerTimes.Asr,
                Maghrib: prayerTimes.Maghrib,
                Isha: prayerTimes.Isha,
                Imsak: prayerTimes.Imsak,
                Midnight: prayerTimes.Midnight,
                Firstthird: prayerTimes.Firstthird,
                Lastthird: prayerTimes.Lastthird,
            };
        }

        const result = {
            ...adjustedPrayerTimes,
            ...(timezoneInfo && { timezoneInfo })
        };

        // Cache the result for 10 minutes (longer since we have better reliability)
        setCachedData(cacheKey, result, 10 * 60 * 1000);

        return result;
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

    // Use Quran.com API for reliable chapter metadata
    const url = `${API_CONFIG.QURAN_COM_BASE_URL}/chapters?language=en`;

    return retry(async () => {
        const response = await apiFetch(url);
        const data = await response.json();

        if (!Array.isArray(data.chapters)) {
            throw new ApiError('Invalid Quran surahs data received', 422);
        }

        const surahs: QuranSurah[] = data.chapters.map((chapter: QuranComChapter) => ({
            number: chapter.id,
            name: chapter.name_arabic || chapter.name_simple || '',
            englishName: chapter.name_simple || '',
            englishNameTranslation: chapter.translated_name?.name || '',
            numberOfAyahs: chapter.verses_count || 0,
            revelationType: (chapter.revelation_place || '').toLowerCase() === 'meccan' ? 'Meccan' : 'Medinan'
        }));

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

    // Quran.com: Uthmani text + Sahih International translation (id 20)
    const url = `${API_CONFIG.QURAN_COM_BASE_URL}/verses/by_chapter/${surahNumber}?language=en&fields=text_uthmani,juz_number,page_number,hizb_number,rub_el_hizb_number,manzil_number,ruku_number,sajdah_number&translations=20&per_page=all`;

    return retry(async () => {
        const response = await apiFetch(url);
        const data = await response.json();

        if (!Array.isArray(data.verses)) {
            throw new ApiError('Invalid Quran ayahs data received', 422);
        }

        const ayahs: QuranAyah[] = data.verses.map((v: QuranComVerse) => ({
            number: v.id,
            text: v.text_uthmani || v.text_imlaei_simple || v.text_indopak || '',
            translation: Array.isArray(v.translations) && v.translations[0] ? v.translations[0].text : '',
            numberInSurah: v.verse_number || (typeof v.verse_key === 'string' ? parseInt(v.verse_key.split(':')[1], 10) : 0),
            juz: v.juz_number || 0,
            manzil: v.manzil_number || 0,
            page: v.page_number || 0,
            ruku: v.ruku_number || 0,
            hizbQuarter: v.rub_el_hizb_number || v.hizb_number || 0,
            sajda: Boolean(v.sajdah_number)
        }));

        // Cache for 24 hours
        setCachedData(cacheKey, ayahs, 24 * 60 * 60 * 1000);

        return ayahs;
    }, API_CONFIG.RETRY_ATTEMPTS, API_CONFIG.RETRY_DELAY);
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

// Enhanced location detection with multiple fallbacks
export const getCurrentLocation = async (): Promise<Location> => {
    // Try HTML5 Geolocation first
    try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new LocationError('Geolocation is not supported by this browser'));
                return;
            }

            const options: PositionOptions = {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 2 * 60 * 1000 // 2 minutes for better accuracy
            };

            const successHandler = (position: GeolocationPosition) => {
                resolve(position);
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

        // Get additional location information using reverse geocoding
        const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        };

        // Try to get city and country information
        try {
            const locationDetails = await reverseGeocode(location);
            return { ...location, ...locationDetails };
        } catch (error) {
            console.warn('Failed to get location details:', error);
            return location;
        }

    } catch (error) {
        // Fallback to IP-based location
        console.warn('HTML5 Geolocation failed, trying IP-based location:', error);

        try {
            return await getLocationFromIP();
        } catch {
            // If all methods fail, throw the original geolocation error
            throw error;
        }
    }
};

// Get location from IP address as fallback
const getLocationFromIP = async (): Promise<Location> => {
    try {
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new ApiError('Failed to get location from IP', response.status);
        }

        const data = await response.json();

        if (!data.latitude || !data.longitude) {
            throw new LocationError('Invalid location data from IP service');
        }

        return {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            city: data.city,
            country: data.country_name,
            countryCode: data.country_code,
            timezone: data.timezone
        };
    } catch {
        throw new LocationError('Failed to determine location from IP address');
    }
};

// Reverse geocoding to get location details
const reverseGeocode = async (location: Location): Promise<Partial<Location>> => {
    try {
        // Try OpenWeatherMap first (if API key available)
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        if (apiKey) {
            const url = `${API_CONFIG.OPENWEATHER_BASE_URL}/reverse?lat=${location.latitude}&lon=${location.longitude}&limit=1&appid=${apiKey}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const place = data[0];
                    return {
                        city: place.name,
                        country: place.country,
                        state: place.state
                    };
                }
            }
        }

        // Fallback to Nominatim (OpenStreetMap)
        const nominatimUrl = `${API_CONFIG.NOMINATIM_BASE_URL}/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json&addressdetails=1`;
        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'Sabil-Elmoslem-App/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const address = data.address || {};

            return {
                city: address.city || address.town || address.village || address.hamlet,
                country: address.country,
                countryCode: address.country_code?.toUpperCase(),
                state: address.state || address.province
            };
        }

        return {};
    } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        return {};
    }
};

// Enhanced city search with multiple providers and autocomplete
export const searchCityCoordinates = withErrorHandling(async (
    cityName: string,
    language: string = 'en'
): Promise<Location> => {
    if (!cityName.trim()) {
        throw new ValidationError('City name is required', 'cityName');
    }

    const searchProviders = [
        // Primary: OpenWeatherMap (if API key available)
        async () => {
            const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
            if (!apiKey) throw new Error('OpenWeatherMap API key not available');

            const url = `${API_CONFIG.OPENWEATHER_BASE_URL}/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${apiKey}&lang=${language}`;
            const response = await apiFetch(url);
            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                throw new ApiError('City not found in OpenWeatherMap', 404);
            }

            const cityData = data[0];
            return {
                latitude: cityData.lat,
                longitude: cityData.lon,
                city: cityData.name,
                country: cityData.country,
                state: cityData.state
            };
        },

        // Fallback: Nominatim (OpenStreetMap)
        async () => {
            const url = `${API_CONFIG.NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(cityName)}&format=json&limit=1&addressdetails=1&accept-language=${language}`;
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Sabil-Elmoslem-App/1.0'
                }
            });

            if (!response.ok) {
                throw new ApiError('Nominatim search failed', response.status);
            }

            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
                throw new ApiError('City not found in Nominatim', 404);
            }

            const place = data[0];
            const address = place.address || {};

            return {
                latitude: parseFloat(place.lat),
                longitude: parseFloat(place.lon),
                city: address.city || address.town || address.village || place.display_name.split(',')[0],
                country: address.country,
                countryCode: address.country_code?.toUpperCase(),
                state: address.state || address.province
            };
        }
    ];

    return retry(async () => {
        let lastError: Error | null = null;

        // Try each provider until one succeeds
        for (const provider of searchProviders) {
            try {
                const result = await provider();
                if (result.latitude && result.longitude) {
                    return result;
                }
            } catch (error) {
                lastError = error as Error;
                console.warn('City search provider failed, trying next:', error);
            }
        }

        // If all providers fail, throw appropriate error
        const msg = language === 'ar' ? 'لم يتم العثور على المدينة' : 'City not found';
        throw new ApiError(msg, 404, 'CITY_NOT_FOUND', { cityName, lastError: lastError?.message });
    }, API_CONFIG.RETRY_ATTEMPTS, API_CONFIG.RETRY_DELAY);
}, 'searchCityCoordinates');

// City autocomplete suggestions
export const getCitySuggestions = withErrorHandling(async (
    query: string,
    language: string = 'en',
    limit: number = 5
): Promise<Array<{ name: string; country: string; coordinates: [number, number] }>> => {
    if (!query.trim() || query.length < 2) {
        return [];
    }

    try {
        // Try OpenWeatherMap first (if API key available)
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
        if (apiKey) {
            const url = `${API_CONFIG.OPENWEATHER_BASE_URL}/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${apiKey}&lang=${language}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    return data.map(city => ({
                        name: city.name,
                        country: city.country,
                        state: city.state,
                        coordinates: [city.lat, city.lon] as [number, number]
                    }));
                }
            }
        }

        // Fallback to Nominatim
        const nominatimUrl = `${API_CONFIG.NOMINATIM_BASE_URL}/search?q=${encodeURIComponent(query)}&format=json&limit=${limit}&addressdetails=1&accept-language=${language}`;
        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'Sabil-Elmoslem-App/1.0'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data)) {
                return data.map(place => {
                    const address = place.address || {};
                    return {
                        name: address.city || address.town || address.village || place.display_name.split(',')[0],
                        country: address.country || '',
                        state: address.state || address.province,
                        coordinates: [parseFloat(place.lat), parseFloat(place.lon)] as [number, number]
                    };
                }).filter(city => city.name && city.coordinates[0] && city.coordinates[1]);
            }
        }

        return [];
    } catch (error) {
        console.warn('Failed to get city suggestions:', error);
        return [];
    }
}, 'getCitySuggestions');

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