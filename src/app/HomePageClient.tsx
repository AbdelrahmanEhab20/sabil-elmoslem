'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PrayerTimesCard from '@/components/PrayerTimesCard';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { motion } from 'framer-motion';

// Islamic decorative star component
const IslamicStar = ({ className = "", size = 24 }: { className?: string; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 0L13.5 8.5L22 10L13.5 11.5L12 20L10.5 11.5L2 10L10.5 8.5L12 0Z" />
    </svg>
);

// Crescent moon component
const CrescentMoon = ({ className = "" }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
    </svg>
);

export default function HomePageClient() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const isArabic = preferences.language === 'ar';

    const features = [
        {
            title: t.prayerTimesTitle,
            description: t.prayerTimesDescription,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                    <circle cx="12" cy="12" r="10" />
                </svg>
            ),
            href: '/prayer-times',
            gradient: 'from-blue-500 to-indigo-600'
        },
        {
            title: t.azkarTitle,
            description: t.azkarDescription,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            href: '/azkar',
            gradient: 'from-emerald-500 to-teal-600'
        },
        {
            title: t.quranTitle,
            description: t.quranDescription,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            href: '/quran',
            gradient: 'from-purple-500 to-violet-600'
        },
        {
            title: t.qiblaTitle,
            description: t.qiblaDescription,
            icon: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4" strokeLinecap="round" />
                    <path d="M12 8l3 4-3 4-3-4 3-4z" fill="currentColor" />
                </svg>
            ),
            href: '/qibla',
            gradient: 'from-amber-500 to-orange-600'
        }
    ];

    // Stagger animation for children
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section - Enhanced with Islamic patterns */}
            <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-700 text-white py-16 md:py-24 relative overflow-hidden">
                {/* Radial gradient overlays */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                {/* Decorative background elements */}
                <div className="absolute inset-0 islamic-pattern opacity-30" />
                <div className="absolute inset-0 islamic-stars" />
                
                {/* Floating decorative elements */}
                <motion.div 
                    className="absolute top-10 left-10 text-white/10"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                >
                    <IslamicStar size={60} />
                </motion.div>
                <motion.div 
                    className="absolute bottom-20 right-10 text-white/10"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                >
                    <IslamicStar size={80} />
                </motion.div>
                <motion.div 
                    className="absolute top-1/4 right-1/4 text-white/5"
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <CrescentMoon className="w-20 h-20" />
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div 
                        className="mb-8" 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        {/* Logo with glow effect */}
                        <motion.div 
                            className="relative inline-block mb-6"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse-glow" />
                            <Image 
                                src="/images/logo.png" 
                                alt="Sabil Elmoslem Logo" 
                                width={100} 
                                height={100} 
                                className="relative mx-auto drop-shadow-2xl"
                                priority
                            />
                        </motion.div>
                        
                        {/* Main heading with enhanced Arabic typography */}
                        <motion.h1 
                            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight ${isArabic ? 'font-arabic-display' : ''}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            {t.welcome}
                        </motion.h1>
                        
                        {/* Subtitle with improved styling */}
                        <motion.p 
                            className={`text-lg md:text-xl lg:text-2xl text-green-100/90 max-w-3xl mx-auto leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            {t.welcomeSubtitle}
                        </motion.p>
                    </motion.div>

                    {/* Bismillah with elegant styling */}
                    <motion.div 
                        className="mt-10"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="inline-block relative">
                            {/* Decorative lines */}
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-green-300/50" />
                                <IslamicStar size={12} className="text-green-300/60" />
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-green-300/50" />
                            </div>
                            
                            <p className="font-quran text-2xl md:text-3xl lg:text-4xl text-white drop-shadow-lg arabic-diacritics">
                                {t.bismillah}
                            </p>
                            
                            {preferences.language === 'en' && (
                                <p className="text-green-200/80 mt-3 text-base md:text-lg italic">
                                    {t.bismillahTranslation}
                                </p>
                            )}
                            
                            {/* Bottom decorative line */}
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-green-300/50" />
                                <IslamicStar size={12} className="text-green-300/60" />
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-green-300/50" />
                            </div>
                        </div>
                    </motion.div>
                </div>
                
                {/* Bottom wave decoration */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path 
                            d="M0 50L48 45.8C96 41.7 192 33.3 288 37.5C384 41.7 480 58.3 576 62.5C672 66.7 768 58.3 864 50C960 41.7 1056 33.3 1152 35.4C1248 37.5 1344 50 1392 56.3L1440 62.5V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" 
                            className="fill-gray-50 dark:fill-gray-900"
                        />
                    </svg>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-10 sm:py-14 md:py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
                        {/* Prayer Times Card */}
                        <motion.div 
                            className="lg:col-span-2" 
                            initial={{ opacity: 0, x: -20 }} 
                            whileInView={{ opacity: 1, x: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 0.5 }}
                        >
                            <PrayerTimesCard />
                        </motion.div>

                        {/* Quick Features */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            <h2 className={`text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3 ${isArabic ? 'font-arabic-display' : ''}`}>
                                <span className="inline-block w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full" />
                                {t.quickAccess}
                            </h2>

                            <div className="grid grid-cols-1 gap-4">
                                {features.map((feature, idx) => (
                                    <motion.div 
                                        key={feature.href} 
                                        variants={itemVariants}
                                        transition={{ duration: 0.4, delay: idx * 0.08 }}
                                    >
                                        <Link
                                            href={feature.href}
                                            className="block group"
                                        >
                                            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700">
                                                {/* Gradient accent bar */}
                                                <div className={`absolute top-0 ${isArabic ? 'right-0' : 'left-0'} w-1 h-full bg-gradient-to-b ${feature.gradient} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                                
                                                <div className="p-4 sm:p-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg flex-shrink-0`}>
                                                            {feature.icon}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className={`text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 ${isArabic ? 'font-arabic-display' : ''}`}>
                                                                {feature.title}
                                                            </h3>
                                                            <p className={`text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-1 ${isArabic ? 'font-arabic-body' : ''}`}>
                                                                {feature.description}
                                                            </p>
                                                        </div>
                                                        {/* Arrow indicator */}
                                                        <div className={`text-gray-400 group-hover:text-green-500 transition-all duration-300 ${isArabic ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`}>
                                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 bg-white dark:bg-gray-800 relative overflow-hidden">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-5 dark:opacity-[0.02]">
                    <div className="absolute inset-0" style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2316a34a' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0zm0 5L35 20L20 35L5 20L20 5z'/%3E%3C/g%3E%3C/svg%3E")` 
                    }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div 
                        className="text-center mb-14" 
                        initial={{ opacity: 0, y: 15 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.5 }}
                    >
                        {/* Section badge */}
                        <motion.div 
                            className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            <IslamicStar size={14} />
                            {isArabic ? 'خدماتنا' : 'Our Services'}
                        </motion.div>
                        
                        <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-5 ${isArabic ? 'font-arabic-display' : ''}`}>
                            {t.whatWeOffer}
                        </h2>
                        <p className={`text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}>
                            {t.whatWeOfferSubtitle}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
                        {/* Feature 1 - Prayer Times */}
                        <motion.div 
                            className="group relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 text-center border border-blue-100 dark:border-blue-800/30 hover:shadow-xl hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-500 hover:-translate-y-2"
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-300/50 dark:shadow-blue-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v6l4 2" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-3 ${isArabic ? 'font-arabic-display' : ''}`}>
                                {t.accuratePrayerTimes}
                            </h3>
                            <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}>
                                {t.accuratePrayerTimesDesc}
                            </p>
                        </motion.div>

                        {/* Feature 2 - Daily Azkar */}
                        <motion.div 
                            className="group relative bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-8 text-center border border-emerald-100 dark:border-emerald-800/30 hover:shadow-xl hover:shadow-emerald-200/30 dark:hover:shadow-emerald-900/20 transition-all duration-500 hover:-translate-y-2"
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-300/50 dark:shadow-emerald-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-3 ${isArabic ? 'font-arabic-display' : ''}`}>
                                {t.dailyAzkar}
                            </h3>
                            <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}>
                                {t.dailyAzkarDesc}
                            </p>
                        </motion.div>

                        {/* Feature 3 - Quran Reader */}
                        <motion.div 
                            className="group relative bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-8 text-center border border-purple-100 dark:border-purple-800/30 hover:shadow-xl hover:shadow-purple-200/30 dark:hover:shadow-purple-900/20 transition-all duration-500 hover:-translate-y-2"
                            initial={{ opacity: 0, y: 20 }} 
                            whileInView={{ opacity: 1, y: 0 }} 
                            viewport={{ once: true }} 
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="relative mb-6">
                                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-300/50 dark:shadow-purple-900/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                    <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M8 7h8M8 11h8M8 15h4" strokeLinecap="round" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className={`text-xl font-bold text-gray-900 dark:text-white mb-3 ${isArabic ? 'font-arabic-display' : ''}`}>
                                {t.quranReader}
                            </h3>
                            <p className={`text-gray-600 dark:text-gray-400 leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}>
                                {t.quranReaderDesc}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-20 md:py-28 relative overflow-hidden bg-gradient-to-br from-green-700 via-green-600 to-emerald-700">
                {/* Enhanced gradient background overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08)_0%,transparent_50%)]" />
                <div className="absolute inset-0 islamic-pattern opacity-20" />
                
                {/* Decorative floating elements */}
                <motion.div 
                    className="absolute top-10 right-20 text-white/10"
                    animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                >
                    <IslamicStar size={50} />
                </motion.div>
                <motion.div 
                    className="absolute bottom-10 left-20 text-white/10"
                    animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                >
                    <IslamicStar size={40} />
                </motion.div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    {/* Decorative top ornament */}
                    <motion.div 
                        className="flex items-center justify-center gap-3 mb-8"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
                        <IslamicStar size={16} className="text-white/70" />
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
                    </motion.div>

                    <motion.h2 
                        className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-5 text-white drop-shadow-lg ${isArabic ? 'font-arabic-display' : ''}`}
                        initial={{ opacity: 0, y: 15 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.5 }}
                    >
                        {t.startJourney}
                    </motion.h2>
                    <motion.p 
                        className={`text-lg md:text-xl text-green-100/90 mb-10 max-w-2xl mx-auto leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}
                        initial={{ opacity: 0 }} 
                        whileInView={{ opacity: 1 }} 
                        viewport={{ once: true }} 
                        transition={{ delay: 0.15, duration: 0.5 }}
                    >
                        {t.startJourneySubtitle}
                    </motion.p>
                    
                    <motion.div 
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25, duration: 0.5 }}
                    >
                        <Link
                            href="/prayer-times"
                            className={`group relative bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 ${isArabic ? 'font-arabic-display' : ''}`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 6v6l4 2" strokeLinecap="round" />
                            </svg>
                            {t.viewPrayerTimes}
                        </Link>
                        <Link
                            href="/azkar"
                            className={`group relative border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-700 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 backdrop-blur-sm ${isArabic ? 'font-arabic-display' : ''}`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {t.readAzkar}
                        </Link>
                    </motion.div>

                    {/* Decorative bottom ornament */}
                    <motion.div 
                        className="flex items-center justify-center gap-3 mt-10"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/40" />
                        <IslamicStar size={10} className="text-white/50" />
                        <div className="h-px w-16 bg-white/40" />
                        <IslamicStar size={10} className="text-white/50" />
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/40" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
} 