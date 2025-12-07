import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from '@/app/HomePageClient';

export const metadata: Metadata = {
  title: 'الرئيسية | Home',
  description: 'مرحباً بكم في سبيل المسلم - منصتكم الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. مجاني وسهل الاستخدام. | Welcome to Sabil Elmoslem - Your comprehensive platform for prayer times, daily azkar, and Quran reading. Free and user-friendly.',
  keywords: [
    'سبيل المسلم', 'sabil elmoslem', 'أوقات الصلاة', 'prayer times', 'أذكار', 'azkar',
    'قرآن', 'quran', 'إسلامي', 'islamic', 'مسلم', 'muslim', 'صلاة', 'salah'
  ],
  openGraph: {
    title: 'الرئيسية | Home - سبيل المسلم | Sabil Elmoslem',
    description: 'مرحباً بكم في سبيل المسلم - منصتكم الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. | Welcome to Sabil Elmoslem - Your comprehensive platform for prayer times, daily azkar, and Quran reading.',
    url: 'https://sabil-elmoslem.vercel.app',
    siteName: 'سبيل المسلم | Sabil Elmoslem',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'سبيل المسلم | Sabil Elmoslem',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الرئيسية | Home - سبيل المسلم | Sabil Elmoslem',
    description: 'مرحباً بكم في سبيل المسلم - منصتكم الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. | Welcome to Sabil Elmoslem - Your comprehensive platform for prayer times, daily azkar, and Quran reading.',
    images: ['/images/logo.png'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
