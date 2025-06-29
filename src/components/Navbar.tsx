'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import Image from 'next/image';

const Navbar: React.FC = () => {
    const { preferences, toggleTheme, toggleLanguage } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const t = useTranslations(preferences.language);

    const navItems = [
        { href: '/', label: t.home, icon: '🏠' },
        { href: '/prayer-times', label: t.prayerTimes, icon: '🕌' },
        { href: '/azkar', label: t.azkar, icon: '📿' },
        { href: '/quran', label: t.quran, icon: '📖' }
    ];

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Image src="/images/logo.png" alt="Islamic Site" width={32} height={32} />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {t.islamicSite}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                <span className="mr-2 rtl:mr-0 rtl:ml-2">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Theme & Language Toggle & Mobile Menu Button */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={preferences.language === 'en' ? t.arabic : t.english}
                        >
                            {preferences.language === 'en' ? t.arabic : t.english}
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={preferences.theme === 'light' ? t.darkMode : t.lightMode}
                        >
                            {preferences.theme === 'light' ? '🌙' : '☀️'}
                        </button>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label="Toggle menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200 dark:border-gray-700">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="mr-2 rtl:mr-0 rtl:ml-2">{item.icon}</span>
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 