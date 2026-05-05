'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import { Clock3, HandCoins, BookOpen, Compass, Info, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const currentYear = new Date().getFullYear();
    const isArabic = preferences.language === 'ar';

    const quickLinks = [
        { href: '/prayer-times', label: t.prayerTimes, icon: Clock3 },
        { href: '/azkar', label: t.azkar, icon: HandCoins },
        { href: '/quran', label: t.quran, icon: BookOpen },
        { href: '/qibla', label: t.qibla, icon: Compass },
    ];

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-white relative overflow-hidden">
            {/* Decorative top border */}
            <div className="h-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500" />
            
            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0zm0 8.5L51.5 30L30 51.5L8.5 30L30 8.5z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
                    {/* Brand & About Section */}
                    <div className="md:col-span-5">
                        <div className="flex items-center gap-3 mb-5">
                            <Image 
                                src="/images/logo.png" 
                                alt="Sabil Elmoslem" 
                                width={44} 
                                height={44}
                                className="rounded-xl"
                            />
                            <div>
                                <h3 className={`text-xl font-bold text-white ${isArabic ? 'font-arabic-display' : ''}`}>
                                    {t.islamicSite}
                                </h3>
                                <p className="text-xs text-gray-400">
                                    {isArabic ? 'منصة إسلامية شاملة' : 'Comprehensive Islamic Platform'}
                                </p>
                            </div>
                        </div>
                        <p className={`text-gray-400 text-sm leading-relaxed mb-6 max-w-md ${isArabic ? 'font-arabic-body' : ''}`}>
                            {t.welcomeSubtitle}
                        </p>
                        
                        {/* Social/Contact placeholder - can be expanded later */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1.5 rounded-full">
                                🌐 {isArabic ? 'مجاني ومفتوح المصدر' : 'Free & Open Source'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-3">
                        <h3 className={`text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5 ${isArabic ? 'font-arabic-display' : ''}`}>
                            {t.quickLinks}
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                <li key={link.href}>
                                    <Link 
                                        href={link.href} 
                                        className="group flex items-center gap-2.5 text-gray-300 hover:text-white transition-colors duration-200"
                                    >
                                        <Icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" aria-hidden="true" />
                                        <span className={`text-sm ${isArabic ? 'font-arabic-body' : ''}`}>
                                            {link.label}
                                        </span>
                                    </Link>
                                </li>
                            )})}
                        </ul>
                    </div>

                    {/* Info Section */}
                    <div className="md:col-span-4">
                        <h3 className={`text-sm font-semibold uppercase tracking-wider text-gray-400 mb-5 ${isArabic ? 'font-arabic-display' : ''}`}>
                            {t.information}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 text-sm text-gray-400">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span className={isArabic ? 'font-arabic-body' : ''}>{t.prayerTimesApiInfo}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-400">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span className={isArabic ? 'font-arabic-body' : ''}>{t.quranApiInfo}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm text-gray-400">
                                <span className="text-green-500 mt-0.5">✓</span>
                                <span className={isArabic ? 'font-arabic-body' : ''}>{t.openSourceInfo}</span>
                            </div>
                            <div className="pt-4 space-y-2">
                                <p className={`text-xs text-gray-500 ${isArabic ? 'font-arabic-body' : ''}`}>
                                    {isArabic ? 'روابط مهمة' : 'Important links'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <Link
                                        href="/about"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"
                                    >
                                        <Info className="w-4 h-4" aria-hidden="true" />
                                        <span>{isArabic ? 'عن المشروع' : 'About'}</span>
                                    </Link>
                                    <Link
                                        href="/contact"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600/90 border border-green-500 text-sm text-white hover:bg-green-600 transition-colors shadow-sm"
                                    >
                                        <Mail className="w-4 h-4" aria-hidden="true" />
                                        <span className="font-semibold">{isArabic ? 'تواصل معنا' : 'Contact Us'}</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800/50 mt-10 pt-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-500 text-sm order-2 md:order-1">
                            © {currentYear} {t.islamicSite}. {t.madeWithLove}
                        </p>
                        
                        {/* Salawat */}
                        <div className="flex items-center gap-3 order-1 md:order-2">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-green-600/50 hidden md:block" />
                            <p className="font-arabic text-lg text-green-400/80 tracking-wide">
                                اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ
                            </p>
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-green-600/50 hidden md:block" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
