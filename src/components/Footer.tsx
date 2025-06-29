'use client';

import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { useTranslations } from '@/utils/translations';

const Footer: React.FC = () => {
    const { preferences } = useUser();
    const t = useTranslations(preferences.language);
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About Section */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-400">{t.about}</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            {t.welcomeSubtitle}
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-400">{t.quickLinks}</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <a href="/prayer-times" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                                    {t.prayerTimes}
                                </a>
                            </li>
                            <li>
                                <a href="/azkar" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                                    {t.azkar}
                                </a>
                            </li>
                            <li>
                                <a href="/quran" className="text-gray-300 hover:text-green-400 transition-colors duration-200">
                                    {t.quran}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-green-400">{t.information}</h3>
                        <div className="text-sm text-gray-300 space-y-2">
                            <p>{t.prayerTimesApiInfo}</p>
                            <p>{t.quranApiInfo}</p>
                            <p>{t.openSourceInfo}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        © {currentYear} {t.islamicSite}. {t.madeWithLove}

                    </p>
                    <h3 className="ml-2 rtl:ml-0 rtl:mr-2 font-arabic">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ</h3>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 