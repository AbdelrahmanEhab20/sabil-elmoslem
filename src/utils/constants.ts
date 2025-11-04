/**
 * Application-wide constants
 * Centralized location for all constant values used across the application
 */

// Location boundaries for Egypt
export const EGYPT_BOUNDARIES = {
    MIN_LATITUDE: 22,
    MAX_LATITUDE: 32,
    MIN_LONGITUDE: 25,
    MAX_LONGITUDE: 37,
} as const;

// Note: Egypt DST has been cancelled. All timezone handling is now automatic.

// Prayer names mapping
export const PRAYER_NAMES = {
    FAJR: 'Fajr',
    SUNRISE: 'Sunrise',
    DHUHR: 'Dhuhr',
    ASR: 'Asr',
    MAGHRIB: 'Maghrib',
    ISHA: 'Isha',
} as const;

// Only actual prayer times (excluding Sunrise)
export const ACTUAL_PRAYERS = [
    PRAYER_NAMES.FAJR,
    PRAYER_NAMES.DHUHR,
    PRAYER_NAMES.ASR,
    PRAYER_NAMES.MAGHRIB,
    PRAYER_NAMES.ISHA,
] as const;

// Time formats
export const TIME_FORMATS = {
    HOUR_MINUTE_24: {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    } as const,
    HOUR_MINUTE_12: {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    } as const,
} as const;

// Animation durations (in seconds)
export const ANIMATION_DURATIONS = {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.4,
} as const;

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
    PRAYER_TIMES: 1000 * 60 * 60, // 1 hour
    LOCATION: 1000 * 60 * 30,     // 30 minutes
    AZKAR: 1000 * 60 * 60 * 24,   // 24 hours
} as const;

// Default values
export const DEFAULTS = {
    CALCULATION_METHOD: 'MWL',
    MADHAB: 'Shafi',
    LANGUAGE: 'ar',
    USE_AUTO_TIMEZONE: true,
} as const;

// API endpoints and configuration
export const API_ENDPOINTS = {
    ALADHAN_BASE: 'https://api.aladhan.com/v1',
    ISLAMICFINDER_BASE: 'https://api.islamicfinder.us/v1',
    OPENWEATHER_BASE: 'https://api.openweathermap.org',
    MAPBOX_BASE: 'https://api.mapbox.com',
    NOMINATIM_BASE: 'https://nominatim.openstreetmap.org',
    WORLDTIME_BASE: 'https://worldtimeapi.org/api',
    TIMEZONE_DB_BASE: 'https://api.timezonedb.com/v2.1',
    IP_API: 'https://ipapi.co/json',
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed',
    API_ERROR: 'API request failed',
    LOCATION_ERROR: 'Failed to get location',
    VALIDATION_ERROR: 'Invalid input data',
    TIMEOUT_ERROR: 'Request timeout',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    LOCATION_SET: 'Location updated successfully',
    DATA_LOADED: 'Data loaded successfully',
    SETTINGS_SAVED: 'Settings saved successfully',
} as const;
