import React from 'react';
import type { Metadata } from 'next';
import HomePageClient from '@/app/HomePageClient';

export const metadata: Metadata = {
  title: 'الرئيسية | Home',
  description: 'مرحباً بكم في الموقع الإسلامي - منصتكم الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. مجاني وسهل الاستخدام. | Welcome to Islamic Site - Your comprehensive platform for prayer times, daily azkar, and Quran reading. Free and user-friendly.',
  keywords: [
    'الموقع الإسلامي', 'islamic site', 'أوقات الصلاة', 'prayer times', 'أذكار', 'azkar',
    'قرآن', 'quran', 'إسلامي', 'islamic', 'مسلم', 'muslim', 'صلاة', 'salah'
  ],
  openGraph: {
    title: 'الرئيسية | Home - الموقع الإسلامي | Islamic Site',
    description: 'مرحباً بكم في الموقع الإسلامي - منصتكم الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. | Welcome to Islamic Site - Your comprehensive platform for prayer times, daily azkar, and Quran reading.',
    url: 'https://islamic-site.com',
    siteName: 'الموقع الإسلامي | Islamic Site',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'الموقع الإسلامي | Islamic Site',
      },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الرئيسية | Home - الموقع الإسلامي | Islamic Site',
    description: 'مرحباً بكم في الموقع الإسلامي - منصتكم الشاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. | Welcome to Islamic Site - Your comprehensive platform for prayer times, daily azkar, and Quran reading.',
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
