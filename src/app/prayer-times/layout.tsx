import type { Metadata } from 'next';

const pageUrl = 'https://sabil-elmoslem.vercel.app/prayer-times';

export const metadata: Metadata = {
  title: 'أوقات الصلاة | Prayer Times',
  description:
    'مواقيت الصلاة الدقيقة حسب موقعك مع العد التنازلي للصلاة القادمة. | Accurate prayer times by your location with next-prayer countdown.',
  alternates: {
    canonical: '/prayer-times',
  },
  openGraph: {
    url: pageUrl,
    title: 'أوقات الصلاة | Prayer Times - سبيل المسلم | Sabil Elmoslem',
    description:
      'مواقيت الصلاة الدقيقة حسب موقعك مع العد التنازلي للصلاة القادمة. | Accurate prayer times by your location with next-prayer countdown.',
    images: ['/images/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'أوقات الصلاة | Prayer Times - سبيل المسلم | Sabil Elmoslem',
    description:
      'مواقيت الصلاة الدقيقة حسب موقعك مع العد التنازلي للصلاة القادمة. | Accurate prayer times by your location with next-prayer countdown.',
    images: ['/images/logo.png'],
  },
};

export default function PrayerTimesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
