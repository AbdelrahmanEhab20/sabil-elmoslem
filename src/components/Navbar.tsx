'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';
import Image from 'next/image';

const Navbar: React.FC = () => {
    const { preferences, toggleLanguage } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // const [isDark, setIsDark] = useState(false);
    const pathname = usePathname();
    const t = useTranslations(preferences.language);

    // Dark mode effect
    // useEffect(() => {
    //     // Check localStorage or system preference
    //     const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    //     if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //         document.documentElement.classList.add('dark');
    //         setIsDark(true);
    //     } else {
    //         document.documentElement.classList.remove('dark');
    //         setIsDark(false);
    //     }
    // }, []);

    // const toggleDarkMode = () => {
    //     if (typeof window === 'undefined') return;
    //     if (document.documentElement.classList.contains('dark')) {
    //         document.documentElement.classList.remove('dark');
    //         localStorage.setItem('theme', 'light');
    //         // setIsDark(false);
    //     } else {
    //         document.documentElement.classList.add('dark');
    //         localStorage.setItem('theme', 'dark');
    //         // setIsDark(true);
    //     }
    // };

    const navItems = [
        { href: '/', label: t.home, icon: '🏠' },
        { href: '/prayer-times', label: t.prayerTimes, icon: '🕌' },
        { href: '/azkar', label: t.azkar, icon: '📿' },
        { href: '/quran', label: t.quran, icon: '📖' }
    ];

    // Check if a nav item is active
    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Image src="/images/logo.png" alt="Sabil Elmoslem" width={32} height={32} />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {t.islamicSite}
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
                        {navItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${active
                                        ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-b-2 border-green-600 dark:border-green-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span className="mr-2 rtl:mr-0 rtl:ml-2">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Language Toggle, Dark Mode Toggle & Mobile Menu Button */}
                    <div className="flex items-center space-x-4 rtl:space-x-reverse">
                        {/* Language Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                            <button
                                onClick={() => preferences.language !== 'en' && toggleLanguage()}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${preferences.language === 'en'
                                    ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                aria-label="English"
                            >
                                English
                            </button>
                            <button
                                onClick={() => preferences.language !== 'ar' && toggleLanguage()}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${preferences.language === 'ar'
                                    ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                                aria-label="العربية"
                            >
                                العربية
                            </button>
                        </div>
                        {/* Dark/Light Mode Toggle */}
                        {/* <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? (
                                // Moon icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
                            ) : (
                                // Sun icon
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.07l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.93l-.71-.71" /></svg>
                            )}
                        </button> */}
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
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${active
                                            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-l-4 border-green-600 dark:border-green-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                            }`}
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className="mr-2 rtl:mr-0 rtl:ml-2">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar; 