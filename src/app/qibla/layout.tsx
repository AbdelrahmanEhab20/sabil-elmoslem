import type { Metadata } from 'next';

const pageUrl = 'https://sabil-elmoslem.vercel.app/qibla';

export const metadata: Metadata = {
  title: 'القبلة | Qibla Direction',
  description:
    'تحديد اتجاه القبلة بدقة حسب موقعك الحالي. | Find the Qibla direction accurately based on your current location.',
  alternates: {
    canonical: '/qibla',
  },
  openGraph: {
    url: pageUrl,
    title: 'القبلة | Qibla Direction - سبيل المسلم | Sabil Elmoslem',
    description:
      'تحديد اتجاه القبلة بدقة حسب موقعك الحالي. | Find the Qibla direction accurately based on your current location.',
    images: ['/images/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'القبلة | Qibla Direction - سبيل المسلم | Sabil Elmoslem',
    description:
      'تحديد اتجاه القبلة بدقة حسب موقعك الحالي. | Find the Qibla direction accurately based on your current location.',
    images: ['/images/logo.png'],
  },
};

export default function QiblaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
