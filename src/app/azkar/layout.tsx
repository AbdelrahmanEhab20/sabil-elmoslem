import type { Metadata } from 'next';

const pageUrl = 'https://sabil-elmoslem.vercel.app/azkar';

export const metadata: Metadata = {
  title: 'الأذكار | Azkar',
  description:
    'أذكار يومية وأدعية قرآنية مرتبة مع عدادات إنجاز. | Daily adhkar and Quranic duas with progress counters.',
  alternates: {
    canonical: '/azkar',
  },
  openGraph: {
    url: pageUrl,
    title: 'الأذكار | Azkar - سبيل المسلم | Sabil Elmoslem',
    description:
      'أذكار يومية وأدعية قرآنية مرتبة مع عدادات إنجاز. | Daily adhkar and Quranic duas with progress counters.',
    images: ['/images/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الأذكار | Azkar - سبيل المسلم | Sabil Elmoslem',
    description:
      'أذكار يومية وأدعية قرآنية مرتبة مع عدادات إنجاز. | Daily adhkar and Quranic duas with progress counters.',
    images: ['/images/logo.png'],
  },
};

export default function AzkarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
