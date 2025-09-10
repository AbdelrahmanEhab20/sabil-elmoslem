'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PrayerTimesCard from '@/components/PrayerTimesCard';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { motion } from 'framer-motion';

export default function HomePageClient() {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);

    const features = [
        {
            title: t.prayerTimesTitle,
            description: t.prayerTimesDescription,
            icon: '🕌',
            href: '/prayer-times',
            color: 'bg-blue-500 hover:bg-blue-600'
        },
        {
            title: t.azkarTitle,
            description: t.azkarDescription,
            icon: '📿',
            href: '/azkar',
            color: 'bg-green-500 hover:bg-green-600'
        },
        {
            title: t.quranTitle,
            description: t.quranDescription,
            icon: '📖',
            href: '/quran',
            color: 'bg-purple-500 hover:bg-purple-600'
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div className="mb-8" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        {/* Replace text logo with image logo */}
                        <Image src="/images/logo.png" alt="Sabil Elmoslem Logo" width={80} height={80} className="mx-auto mb-4" />
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">
                            {t.welcome}
                        </h1>
                        <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
                            {t.welcomeSubtitle}
                        </p>
                    </motion.div>

                    <motion.div className="text-lg text-green-200" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                        <p className="mb-2 font-arabic text-2xl">{t.bismillah}</p>
                        {preferences.language === 'en' && <p>{t.bismillahTranslation}</p>}
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-8 sm:py-12 md:py-16">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Prayer Times Card */}
                        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
                            <PrayerTimesCard />
                        </motion.div>

                        {/* Quick Features */}
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                {t.quickAccess}
                            </h2>

                            <div className="grid grid-cols-1 gap-3">
                                {features.map((feature, idx) => (
                                    <motion.div key={feature.href} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
                                        <Link
                                            href={feature.href}
                                            className="block group"
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                                <div className="flex items-center space-x-3 rtl:space-x-reverse gap-3">
                                                    <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
                                                        {feature.icon}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200 truncate">
                                                            {feature.title}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-tight mt-1">
                                                            {feature.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {t.whatWeOffer}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            {t.whatWeOfferSubtitle}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.05 }}>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🕐</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {t.accuratePrayerTimes}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t.accuratePrayerTimesDesc}
                            </p>
                        </motion.div>

                        <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.1 }}>
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">🙏</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {t.dailyAzkar}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t.dailyAzkarDesc}
                            </p>
                        </motion.div>

                        <motion.div className="text-center" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.15 }}>
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📚</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {t.quranReader}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t.quranReaderDesc}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-green-700 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h2 className="text-3xl font-bold mb-4" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
                        {t.startJourney}
                    </motion.h2>
                    <motion.p className="text-xl text-green-100 mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                        {t.startJourneySubtitle}
                    </motion.p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/prayer-times"
                            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors duration-200"
                        >
                            {t.viewPrayerTimes}
                        </Link>
                        <Link
                            href="/azkar"
                            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors duration-200"
                        >
                            {t.readAzkar}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
} 