import type { Metadata } from 'next';
import { QuranDataProvider } from '@/contexts/QuranDataContext';

const pageUrl = 'https://sabil-elmoslem.vercel.app/quran';

export const metadata: Metadata = {
  title: 'القرآن الكريم | Holy Quran',
  description:
    'اقرأ القرآن الكريم مع الترجمة والصوت. | Read the Holy Quran with translation and recitation audio.',
  alternates: {
    canonical: '/quran',
  },
  openGraph: {
    url: pageUrl,
    title: 'القرآن الكريم | Holy Quran - سبيل المسلم | Sabil Elmoslem',
    description:
      'اقرأ القرآن الكريم مع الترجمة والصوت. | Read the Holy Quran with translation and recitation audio.',
    images: ['/images/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'القرآن الكريم | Holy Quran - سبيل المسلم | Sabil Elmoslem',
    description:
      'اقرأ القرآن الكريم مع الترجمة والصوت. | Read the Holy Quran with translation and recitation audio.',
    images: ['/images/logo.png'],
  },
};

export default function QuranLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <QuranDataProvider>{children}</QuranDataProvider>;
}
