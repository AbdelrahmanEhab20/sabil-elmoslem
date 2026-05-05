'use client';

import React from 'react';
import { useUser } from '@/contexts/UserContext';

export default function ContactPage() {
  const { preferences } = useUser();
  const isArabic = preferences.language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <h1 className={`text-3xl font-bold text-gray-900 dark:text-white mb-4 ${isArabic ? 'font-arabic-display' : ''}`}>
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </h1>
          <p className={`text-gray-700 dark:text-gray-300 leading-relaxed mb-4 ${isArabic ? 'font-arabic-body' : ''}`}>
            {isArabic
              ? 'للاقتراحات أو الإبلاغ عن مشكلة أو طلب ميزة جديدة، يمكنك التواصل معنا عبر البريد التالي:'
              : 'For suggestions, bug reports, or feature requests, you can reach us via:'}
          </p>
          <a
            href="mailto:abdelrahmanehab278@gmail.com"
            className="inline-flex items-center gap-2 text-green-700 dark:text-green-400 hover:underline"
          >
            abdelrahmanehab278@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
