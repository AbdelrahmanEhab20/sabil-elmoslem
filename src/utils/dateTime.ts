/**
 * Date and Time utility functions
 * Centralized location for all date/time related operations
 */

import { EGYPT_BOUNDARIES, TIME_FORMATS } from './constants';
import type { Location } from '@/types';

/**
 * Check if a location is within Egypt boundaries
 */
export const isLocationInEgypt = (location: Location): boolean => {
    return (
        location.latitude >= EGYPT_BOUNDARIES.MIN_LATITUDE &&
        location.latitude <= EGYPT_BOUNDARIES.MAX_LATITUDE &&
        location.longitude >= EGYPT_BOUNDARIES.MIN_LONGITUDE &&
        location.longitude <= EGYPT_BOUNDARIES.MAX_LONGITUDE
    );
};

/**
 * Note: Egypt DST functions have been removed as summer time is cancelled in Egypt.
 * All timezone handling is now automatic via the API providers.
 */

/**
 * Format time string for display
 */
export const formatTimeForDisplay = (
    timeString: string,
    locale: string = 'en-US',
    use12Hour: boolean = true
): string => {
    if (!timeString) return '--:--';
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0);
    
    const format = use12Hour ? TIME_FORMATS.HOUR_MINUTE_12 : TIME_FORMATS.HOUR_MINUTE_24;
    const formatted = date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', format);
    
    return formatted;
};

/**
 * Get current time as HH:MM string in 24-hour format
 */
export const getCurrentTimeString = (): string => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', TIME_FORMATS.HOUR_MINUTE_24);
};

/**
 * Calculate time difference between two times
 */
export const calculateTimeDifference = (targetTime: string, currentTime?: Date): {
    hours: number;
    minutes: number;
    seconds: number;
    totalMilliseconds: number;
} => {
    const now = currentTime || new Date();
    const [targetHours, targetMinutes] = targetTime.split(':').map(Number);
    
    const targetDateTime = new Date();
    targetDateTime.setHours(targetHours, targetMinutes, 0, 0);
    
    // If target time is earlier than current time, it's for tomorrow
    if (targetDateTime <= now) {
        targetDateTime.setDate(targetDateTime.getDate() + 1);
    }
    
    const totalMilliseconds = targetDateTime.getTime() - now.getTime();
    const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((totalMilliseconds % (1000 * 60)) / 1000);
    
    return {
        hours,
        minutes,
        seconds,
        totalMilliseconds,
    };
};

/**
 * Format time difference as HH:MM:SS string with locale-aware numerals
 */
export const formatTimeDifference = (
    hours: number,
    minutes: number,
    seconds: number,
    locale: string = 'en'
): string => {
    // Use locale-aware number formatting
    const numberFormatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
    });

    const formattedHours = numberFormatter.format(hours);
    const formattedMinutes = numberFormatter.format(minutes);
    const formattedSeconds = numberFormatter.format(seconds);

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

/**
 * Check if a time string is valid
 */
export const isValidTimeString = (timeString: string): boolean => {
    if (!timeString || typeof timeString !== 'string') return false;
    
    const timeParts = timeString.split(':');
    if (timeParts.length !== 2) return false;
    
    const [hours, minutes] = timeParts.map(Number);
    return (
        !isNaN(hours) &&
        !isNaN(minutes) &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
    );
};

/**
 * Get localized date string
 */
export const getLocalizedDateString = (
    date: Date,
    locale: string,
    options?: Intl.DateTimeFormatOptions
): string => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };
    
    const formatOptions = options || defaultOptions;
    const localeString = locale === 'ar' ? 'ar-SA' : 'en-US';
    
    return date.toLocaleDateString(localeString, formatOptions);
};
