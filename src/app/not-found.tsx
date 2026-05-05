'use client';

import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';

export default function NotFound() {
  const { preferences } = useUser();
  const isArabic = preferences.language === 'ar';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-xl w-full text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
        <div className="text-6xl mb-4">🕌</div>
        <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 ${isArabic ? 'font-arabic-display' : ''}`}>
          {isArabic ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className={`text-gray-600 dark:text-gray-400 mb-6 ${isArabic ? 'font-arabic-body' : ''}`}>
          {isArabic
            ? 'يبدو أن الرابط غير صحيح أو تم نقل الصفحة. يمكنك العودة إلى إحدى الصفحات الرئيسية.'
            : 'The URL may be incorrect or the page has moved. You can return to one of the main pages.'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">
            {isArabic ? 'الرئيسية' : 'Home'}
          </Link>
          <Link href="/quran" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {isArabic ? 'القرآن' : 'Quran'}
          </Link>
          <Link href="/prayer-times" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {isArabic ? 'أوقات الصلاة' : 'Prayer Times'}
          </Link>
          <Link href="/azkar" className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            {isArabic ? 'الأذكار' : 'Azkar'}
          </Link>
        </div>
      </div>
    </div>
  );
}
