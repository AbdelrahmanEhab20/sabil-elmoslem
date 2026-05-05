'use client';

import React from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { BookOpen, Clock3, Compass, HandCoins, ShieldCheck, Globe } from 'lucide-react';

export default function AboutPage() {
  const { preferences } = useUser();
  const isArabic = preferences.language === 'ar';

  const featureCards = [
    {
      icon: Clock3,
      title: isArabic ? 'أوقات الصلاة' : 'Prayer Times',
      description: isArabic
        ? 'عرض مواقيت الصلاة بدقة مع العد التنازلي للصلاة القادمة وإمكانية تحديث الموقع بسهولة.'
        : 'Accurate prayer times with next-prayer countdown and easy location updates.',
      href: '/prayer-times',
    },
    {
      icon: HandCoins,
      title: isArabic ? 'الأذكار اليومية' : 'Daily Adhkar',
      description: isArabic
        ? 'أذكار مرتبة حسب الوقت والحاجة مع عدادات متابعة تساعدك على الاستمرار.'
        : 'Structured adhkar by time and need, with progress counters for consistency.',
      href: '/azkar',
    },
    {
      icon: BookOpen,
      title: isArabic ? 'القرآن الكريم' : 'Holy Quran',
      description: isArabic
        ? 'قراءة السور والآيات مع خيارات عرض مريحة وتجربة تنقل أسرع بين السور.'
        : 'Read surahs and ayahs with comfortable display controls and fast navigation.',
      href: '/quran',
    },
    {
      icon: Compass,
      title: isArabic ? 'اتجاه القبلة' : 'Qibla Direction',
      description: isArabic
        ? 'تحديد اتجاه القبلة بناءً على موقعك الحالي بشكل سريع وواضح.'
        : 'Quick and clear Qibla direction based on your current location.',
      href: '/qibla',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-6 h-6" aria-hidden="true" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              {isArabic ? 'حول الموقع' : 'About the Site'}
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isArabic ? 'font-arabic-display' : ''}`}>
            {isArabic ? 'عن موقع سبيل المسلم' : 'About Sabil Elmoslem'}
          </h1>
          <p className={`text-emerald-50 text-base sm:text-lg leading-relaxed max-w-4xl ${isArabic ? 'font-arabic-body' : ''}`}>
            {isArabic
              ? 'سبيل المسلم موقع إسلامي يقدم أدوات يومية عملية للمسلم: أوقات الصلاة، الأذكار، قراءة القرآن، واتجاه القبلة — في واجهة واضحة تدعم العربية والإنجليزية.'
              : 'Sabil Elmoslem is an Islamic website built for daily Muslim needs: prayer times, adhkar, Quran reading, and Qibla direction, with a clean bilingual experience in Arabic and English.'}
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className={`text-lg font-semibold text-gray-900 dark:text-white mb-1 ${isArabic ? 'font-arabic-display' : ''}`}>
                      {feature.title}
                    </h2>
                    <p className={`text-sm text-gray-600 dark:text-gray-400 leading-relaxed ${isArabic ? 'font-arabic-body' : ''}`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <h3 className={`text-xl font-bold text-gray-900 dark:text-white ${isArabic ? 'font-arabic-display' : ''}`}>
              {isArabic ? 'الدقة والثقة' : 'Accuracy & Trust'}
            </h3>
          </div>
          <ul className={`space-y-2 text-gray-700 dark:text-gray-300 ${isArabic ? 'font-arabic-body' : ''}`}>
            <li>{isArabic ? '• أوقات الصلاة تعتمد على مصادر موثوقة مع دعم تحديد الموقع.' : '• Prayer times are sourced from reliable APIs with location support.'}</li>
            <li>{isArabic ? '• نصوص القرآن تعرض بصيغة واضحة مع تحسينات للقراءة والتنقل.' : '• Quran text is presented with readability and navigation optimizations.'}</li>
            <li>{isArabic ? '• تجربة الموقع مصممة لتكون خفيفة وسريعة على الهاتف وسطح المكتب.' : '• The experience is optimized for fast usage on both mobile and desktop.'}</li>
          </ul>
        </section>

        <section className="text-center bg-gray-100 dark:bg-gray-800/50 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-700">
          <p className={`text-gray-700 dark:text-gray-300 mb-3 ${isArabic ? 'font-arabic-body' : ''}`}>
            {isArabic ? 'لديك اقتراح لتحسين الموقع؟ يسعدنا سماع رأيك.' : 'Have suggestions to improve the site? We would love to hear from you.'}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </Link>
        </section>
      </div>
    </div>
  );
}
