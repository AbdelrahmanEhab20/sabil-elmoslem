'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QiblaCompassProps {
    userLatitude: number;
    userLongitude: number;
    language: 'en' | 'ar';
}

// Kaaba coordinates in Mecca
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

/**
 * Calculate Qibla direction using the great circle formula
 * Returns the bearing in degrees from North (0-360)
 */
const calculateQiblaDirection = (lat: number, lon: number): number => {
    // Convert to radians
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (KAABA_LATITUDE * Math.PI) / 180;
    const Δλ = ((KAABA_LONGITUDE - lon) * Math.PI) / 180;

    // Great circle formula for initial bearing
    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);

    let θ = Math.atan2(y, x);
    
    // Convert to degrees
    θ = (θ * 180) / Math.PI;
    
    // Normalize to 0-360
    return (θ + 360) % 360;
};

/**
 * Calculate distance to Kaaba in kilometers using Haversine formula
 */
const calculateDistanceToKaaba = (lat: number, lon: number): number => {
    const R = 6371; // Earth's radius in km
    const φ1 = (lat * Math.PI) / 180;
    const φ2 = (KAABA_LATITUDE * Math.PI) / 180;
    const Δφ = ((KAABA_LATITUDE - lat) * Math.PI) / 180;
    const Δλ = ((KAABA_LONGITUDE - lon) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

const QiblaCompass: React.FC<QiblaCompassProps> = ({ userLatitude, userLongitude, language }) => {
    const [compassHeading, setCompassHeading] = useState<number | null>(null);
    const [qiblaDirection, setQiblaDirection] = useState<number>(0);
    const [distanceToKaaba, setDistanceToKaaba] = useState<number>(0);
    const [hasCompass, setHasCompass] = useState<boolean>(false);
    const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
    const [manualRotation, setManualRotation] = useState<number>(0);
    const [permissionStatus, setPermissionStatus] = useState<'unknown' | 'granted' | 'denied' | 'not-supported'>('unknown');
    const [showInstructions, setShowInstructions] = useState<boolean>(true);
    
    const compassRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);
    const lastAngle = useRef<number>(0);

    // Calculate Qibla direction and distance on mount and when location changes
    useEffect(() => {
        const direction = calculateQiblaDirection(userLatitude, userLongitude);
        const distance = calculateDistanceToKaaba(userLatitude, userLongitude);
        setQiblaDirection(direction);
        setDistanceToKaaba(distance);
    }, [userLatitude, userLongitude]);

    // Handle device orientation for compass
    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        // iOS uses webkitCompassHeading, Android uses alpha
        let heading: number | null = null;

        if ('webkitCompassHeading' in event && typeof (event as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading === 'number') {
            // iOS provides compass heading directly
            heading = (event as DeviceOrientationEvent & { webkitCompassHeading: number }).webkitCompassHeading;
        } else if (event.alpha !== null) {
            // Android: alpha is the compass direction (0-360)
            // alpha = 0 when pointing north
            heading = 360 - event.alpha;
        }

        if (heading !== null) {
            setCompassHeading(heading);
            setHasCompass(true);
            setIsCalibrating(false);
        }
    }, []);

    // Request permission and start compass (for iOS 13+)
    const requestCompassPermission = async () => {
        setIsCalibrating(true);
        
        // Check if DeviceOrientationEvent is available
        if (typeof DeviceOrientationEvent === 'undefined') {
            setPermissionStatus('not-supported');
            setHasCompass(false);
            setIsCalibrating(false);
            return;
        }

        // iOS 13+ requires permission
        if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function') {
            try {
                const permission = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
                if (permission === 'granted') {
                    setPermissionStatus('granted');
                    window.addEventListener('deviceorientation', handleOrientation, true);
                } else {
                    setPermissionStatus('denied');
                    setHasCompass(false);
                }
            } catch {
                setPermissionStatus('denied');
                setHasCompass(false);
            }
        } else {
            // Non-iOS or older iOS - just add the listener
            setPermissionStatus('granted');
            window.addEventListener('deviceorientation', handleOrientation, true);
            
            // Check if we get data after a short delay
            setTimeout(() => {
                if (compassHeading === null) {
                    setHasCompass(false);
                    setPermissionStatus('not-supported');
                }
                setIsCalibrating(false);
            }, 2000);
        }
    };

    // Try to start compass on mount
    useEffect(() => {
        // Check if we're on a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // For non-iOS devices, try adding the listener directly
            if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission !== 'function') {
                window.addEventListener('deviceorientation', handleOrientation, true);
                
                // Check after a delay
                const timeoutId = setTimeout(() => {
                    if (compassHeading === null) {
                        setHasCompass(false);
                        setPermissionStatus('not-supported');
                    }
                }, 2000);

                return () => {
                    clearTimeout(timeoutId);
                    window.removeEventListener('deviceorientation', handleOrientation, true);
                };
            }
        } else {
            setHasCompass(false);
            setPermissionStatus('not-supported');
        }

        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [handleOrientation, compassHeading]);

    // Manual compass rotation handlers
    const getAngleFromCenter = (clientX: number, clientY: number): number => {
        if (!compassRef.current) return 0;
        const rect = compassRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
        return angle + 90; // Adjust so 0 is at the top
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (hasCompass && compassHeading !== null) return;
        isDragging.current = true;
        lastAngle.current = getAngleFromCenter(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const currentAngle = getAngleFromCenter(e.clientX, e.clientY);
        const delta = currentAngle - lastAngle.current;
        setManualRotation(prev => (prev + delta + 360) % 360);
        lastAngle.current = currentAngle;
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (hasCompass && compassHeading !== null) return;
        if (e.touches.length === 1) {
            isDragging.current = true;
            lastAngle.current = getAngleFromCenter(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging.current || e.touches.length !== 1) return;
        const currentAngle = getAngleFromCenter(e.touches[0].clientX, e.touches[0].clientY);
        const delta = currentAngle - lastAngle.current;
        setManualRotation(prev => (prev + delta + 360) % 360);
        lastAngle.current = currentAngle;
    };

    const handleTouchEnd = () => {
        isDragging.current = false;
    };

    // Calculate the rotation needed to point to Qibla
    const getQiblaRotation = (): number => {
        if (hasCompass && compassHeading !== null) {
            // With device compass: rotate compass opposite to heading, Qibla arrow points to Qibla
            return qiblaDirection - compassHeading;
        }
        // Manual mode: use manual rotation
        return qiblaDirection - manualRotation;
    };

    const formatDistance = (km: number): string => {
        if (km < 1) {
            return language === 'ar' ? `${Math.round(km * 1000)} متر` : `${Math.round(km * 1000)} m`;
        }
        return language === 'ar' ? `${Math.round(km).toLocaleString('ar-EG')} كم` : `${Math.round(km).toLocaleString()} km`;
    };

    const getCardinalDirection = (degrees: number): string => {
        const directions = language === 'ar' 
            ? ['شمال', 'شمال شرق', 'شرق', 'جنوب شرق', 'جنوب', 'جنوب غرب', 'غرب', 'شمال غرب']
            : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            {/* Qibla Info */}
            <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-2xl">🕋</span>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {language === 'ar' ? 'اتجاه القبلة' : 'Qibla Direction'}
                    </h3>
                </div>
                <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {Math.round(qiblaDirection)}° {getCardinalDirection(qiblaDirection)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'المسافة إلى الكعبة:' : 'Distance to Kaaba:'} {formatDistance(distanceToKaaba)}
                </p>
            </div>

            {/* Compass */}
            <div className="relative">
                {/* Outer ring with degree markers */}
                <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                    {/* Degree markers */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
                        {/* Main circle */}
                        <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-200 dark:text-gray-700" />
                        
                        {/* Degree ticks */}
                        {Array.from({ length: 72 }, (_, i) => {
                            const angle = i * 5;
                            const isMajor = angle % 30 === 0;
                            const isCardinal = angle % 90 === 0;
                            const innerRadius = isCardinal ? 115 : isMajor ? 125 : 132;
                            const outerRadius = 140;
                            const x1 = 150 + innerRadius * Math.sin((angle * Math.PI) / 180);
                            const y1 = 150 - innerRadius * Math.cos((angle * Math.PI) / 180);
                            const x2 = 150 + outerRadius * Math.sin((angle * Math.PI) / 180);
                            const y2 = 150 - outerRadius * Math.cos((angle * Math.PI) / 180);
                            
                            return (
                                <line
                                    key={angle}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="currentColor"
                                    strokeWidth={isCardinal ? 3 : isMajor ? 2 : 1}
                                    className={isCardinal ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}
                                />
                            );
                        })}

                        {/* Cardinal direction labels */}
                        {[
                            { angle: 0, label: language === 'ar' ? 'ش' : 'N', color: 'text-red-500' },
                            { angle: 90, label: language === 'ar' ? 'شر' : 'E', color: 'text-gray-600 dark:text-gray-300' },
                            { angle: 180, label: language === 'ar' ? 'ج' : 'S', color: 'text-gray-600 dark:text-gray-300' },
                            { angle: 270, label: language === 'ar' ? 'غ' : 'W', color: 'text-gray-600 dark:text-gray-300' },
                        ].map(({ angle, label, color }) => {
                            const radius = 100;
                            const x = 150 + radius * Math.sin((angle * Math.PI) / 180);
                            const y = 150 - radius * Math.cos((angle * Math.PI) / 180);
                            return (
                                <text
                                    key={angle}
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className={`font-bold text-lg ${color}`}
                                    fill="currentColor"
                                >
                                    {label}
                                </text>
                            );
                        })}
                    </svg>

                    {/* Rotating compass face */}
                    <motion.div
                        ref={compassRef}
                        className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-xl border-4 border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing"
                        style={{ touchAction: 'none' }}
                        animate={{ 
                            rotate: hasCompass && compassHeading !== null 
                                ? -compassHeading 
                                : -manualRotation 
                        }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {/* Compass rose pattern */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                            {/* Inner decorative circles */}
                            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" opacity="0.5" />
                            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300 dark:text-gray-600" opacity="0.3" />
                            
                            {/* North arrow (red) */}
                            <polygon
                                points="100,20 108,90 100,80 92,90"
                                fill="#EF4444"
                                stroke="#DC2626"
                                strokeWidth="1"
                            />
                            {/* South arrow */}
                            <polygon
                                points="100,180 108,110 100,120 92,110"
                                fill="#6B7280"
                                stroke="#4B5563"
                                strokeWidth="1"
                            />
                            
                            {/* Center decoration */}
                            <circle cx="100" cy="100" r="12" fill="currentColor" className="text-gray-600 dark:text-gray-400" />
                            <circle cx="100" cy="100" r="6" fill="currentColor" className="text-gray-100 dark:text-gray-800" />
                        </svg>
                    </motion.div>

                    {/* Qibla indicator (fixed, points to Qibla) */}
                    <motion.div
                        className="absolute inset-8 pointer-events-none"
                        animate={{ rotate: getQiblaRotation() }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    >
                        <svg className="w-full h-full" viewBox="0 0 200 200">
                            {/* Qibla arrow */}
                            <defs>
                                <linearGradient id="qiblaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#F59E0B" />
                                    <stop offset="100%" stopColor="#D97706" />
                                </linearGradient>
                                <filter id="qiblaShadow" x="-20%" y="-20%" width="140%" height="140%">
                                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
                                </filter>
                            </defs>
                            
                            {/* Qibla direction arrow */}
                            <g filter="url(#qiblaShadow)">
                                <polygon
                                    points="100,15 115,45 108,45 108,95 92,95 92,45 85,45"
                                    fill="url(#qiblaGradient)"
                                />
                            </g>
                            
                            {/* Kaaba icon at the tip */}
                            <g transform="translate(100, 8)">
                                <rect x="-8" y="-8" width="16" height="16" fill="#1F2937" rx="2" />
                                <rect x="-6" y="2" width="12" height="3" fill="#FCD34D" />
                            </g>
                        </svg>
                    </motion.div>

                    {/* Current heading indicator (fixed at top) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-amber-500" />
                    </div>
                </div>
            </div>

            {/* Compass mode indicator & controls */}
            <div className="text-center space-y-3">
                <AnimatePresence mode="wait">
                    {isCalibrating ? (
                        <motion.div
                            key="calibrating"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400"
                        >
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>{language === 'ar' ? 'جاري المعايرة...' : 'Calibrating...'}</span>
                        </motion.div>
                    ) : hasCompass && compassHeading !== null ? (
                        <motion.div
                            key="compass-active"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-medium">
                                    {language === 'ar' ? 'البوصلة نشطة' : 'Compass Active'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {language === 'ar' 
                                    ? 'وجّه جهازك نحو السهم البرتقالي للصلاة'
                                    : 'Point your device toward the golden arrow to pray'}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="manual-mode"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {permissionStatus === 'not-supported' ? (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {language === 'ar' 
                                        ? 'البوصلة غير متوفرة. أدر البوصلة يدوياً لمطابقة الشمال.'
                                        : 'Compass not available. Rotate the compass manually to match North.'}
                                </p>
                            ) : permissionStatus === 'denied' ? (
                                <p className="text-sm text-red-500">
                                    {language === 'ar' 
                                        ? 'تم رفض إذن البوصلة. يرجى تفعيله من الإعدادات.'
                                        : 'Compass permission denied. Please enable it in settings.'}
                                </p>
                            ) : (
                                <>
                                    <button
                                        onClick={requestCompassPermission}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {language === 'ar' ? 'تفعيل البوصلة' : 'Enable Compass'}
                                    </button>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {language === 'ar' 
                                            ? 'أو أدر البوصلة يدوياً لمطابقة الشمال'
                                            : 'Or rotate the compass manually to match North'}
                                    </p>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Instructions */}
            <AnimatePresence>
                {showInstructions && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-sm"
                    >
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                    <span className="text-blue-500 text-xl">💡</span>
                                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                        <p className="font-medium">
                                            {language === 'ar' ? 'كيفية الاستخدام:' : 'How to use:'}
                                        </p>
                                        <ul className={`list-disc ${language === 'ar' ? 'mr-4' : 'ml-4'} space-y-1 text-blue-700 dark:text-blue-300`}>
                                            <li>{language === 'ar' ? 'السهم البرتقالي يشير دائماً إلى القبلة' : 'Golden arrow always points to Qibla'}</li>
                                            <li>{language === 'ar' ? 'على الهاتف: فعّل البوصلة للتوجيه التلقائي' : 'On mobile: Enable compass for auto-orientation'}</li>
                                            <li>{language === 'ar' ? 'يدوياً: أدر البوصلة حتى يشير السهم الأحمر للشمال' : 'Manual: Rotate until red arrow points North'}</li>
                                        </ul>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowInstructions(false)}
                                    className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manual rotation display for desktop/manual mode */}
            {(!hasCompass || compassHeading === null) && (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                    <span>{language === 'ar' ? 'التدوير اليدوي:' : 'Manual rotation:'} </span>
                    <span className="font-mono font-medium">{Math.round(manualRotation)}°</span>
                </div>
            )}
        </div>
    );
};

export default QiblaCompass;

