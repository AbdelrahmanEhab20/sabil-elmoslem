/**
 * Prayer-related helper functions
 * Centralized location for prayer time calculations and utilities
 */

import { ACTUAL_PRAYERS, PRAYER_NAMES } from './constants';
import { getCurrentTimeString, isValidTimeString } from './dateTime';
import type { PrayerTimes } from '@/types';
import type { Translations } from '@/utils/translations';

/**
 * Prayer time entry interface
 */
interface PrayerTimeEntry {
    name: string;
    time: string;
}

/**
 * Get list of actual prayer times (excluding Sunrise)
 */
export const getActualPrayerTimes = (prayerTimes: PrayerTimes): PrayerTimeEntry[] => {
    return ACTUAL_PRAYERS.map(prayerName => ({
        name: prayerName,
        time: prayerTimes[prayerName as keyof PrayerTimes],
    })).filter(prayer => isValidTimeString(prayer.time));
};

/**
 * Get all prayer times including Sunrise for display purposes
 */
export const getAllPrayerTimes = (prayerTimes: PrayerTimes): PrayerTimeEntry[] => {
    const allPrayers = [
        PRAYER_NAMES.FAJR,
        PRAYER_NAMES.SUNRISE,
        PRAYER_NAMES.DHUHR,
        PRAYER_NAMES.ASR,
        PRAYER_NAMES.MAGHRIB,
        PRAYER_NAMES.ISHA,
    ];
    
    return allPrayers.map(prayerName => ({
        name: prayerName,
        time: prayerTimes[prayerName as keyof PrayerTimes],
    })).filter(prayer => isValidTimeString(prayer.time));
};

/**
 * Find the next prayer time
 */
export const findNextPrayer = (
    prayerTimes: PrayerTimes,
    currentTime?: string
): PrayerTimeEntry | null => {
    const prayers = getActualPrayerTimes(prayerTimes);
    if (prayers.length === 0) return null;
    
    const currentTimeString = currentTime || getCurrentTimeString();
    
    // Find the next prayer time for today
    const nextPrayer = prayers.find(prayer => prayer.time > currentTimeString);
    
    // If no prayer found for today, return tomorrow's Fajr
    return nextPrayer || prayers[0];
};

/**
 * Check if a prayer is the next prayer
 */
export const isNextPrayer = (
    prayerName: string,
    prayerTimes: PrayerTimes,
    currentTime?: string
): boolean => {
    const nextPrayer = findNextPrayer(prayerTimes, currentTime);
    return nextPrayer?.name === prayerName;
};

/**
 * Get prayer name in the specified language
 */
export const getPrayerNameTranslated = (
    prayerName: string,
    translations: Translations
): string => {
    const translationMap: Record<string, string> = {
        [PRAYER_NAMES.FAJR]: translations.fajr,
        [PRAYER_NAMES.SUNRISE]: translations.sunrise,
        [PRAYER_NAMES.DHUHR]: translations.dhuhr,
        [PRAYER_NAMES.ASR]: translations.asr,
        [PRAYER_NAMES.MAGHRIB]: translations.maghrib,
        [PRAYER_NAMES.ISHA]: translations.isha,
    };
    
    return translationMap[prayerName] || prayerName;
};

/**
 * Validate prayer times object
 */
export const validatePrayerTimes = (prayerTimes: unknown): prayerTimes is PrayerTimes => {
    if (!prayerTimes || typeof prayerTimes !== 'object') return false;
    
    const requiredPrayers = [
        PRAYER_NAMES.FAJR,
        PRAYER_NAMES.DHUHR,
        PRAYER_NAMES.ASR,
        PRAYER_NAMES.MAGHRIB,
        PRAYER_NAMES.ISHA,
    ];
    
    const prayerObj = prayerTimes as Record<string, unknown>;
    
    return requiredPrayers.every(prayer => {
        const time = prayerObj[prayer];
        return typeof time === 'string' && isValidTimeString(time);
    });
};

/**
 * Sort prayers by time
 */
export const sortPrayersByTime = (prayers: PrayerTimeEntry[]): PrayerTimeEntry[] => {
    return [...prayers].sort((a, b) => {
        const [aHours, aMinutes] = a.time.split(':').map(Number);
        const [bHours, bMinutes] = b.time.split(':').map(Number);
        
        const aMinutesTotal = aHours * 60 + aMinutes;
        const bMinutesTotal = bHours * 60 + bMinutes;
        
        return aMinutesTotal - bMinutesTotal;
    });
};

/**
 * Get prayer time by name
 */
export const getPrayerTime = (
    prayerTimes: PrayerTimes,
    prayerName: string
): string | null => {
    const time = prayerTimes[prayerName as keyof PrayerTimes];
    return isValidTimeString(time) ? time : null;
};
