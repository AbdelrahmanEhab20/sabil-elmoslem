import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/contexts/UserContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { ToastProvider } from "@/components/ToastProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/next"
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { MotionConfig } from "framer-motion";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Arabic display font - Cairo for headings
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Arabic body font - Tajawal for paragraphs
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "سبيل المسلم - أوقات الصلاة والأذكار والقرآن | Sabil Elmoslem - Prayer Times, Azkar & Quran",
    template: "%s | سبيل المسلم | Sabil Elmoslem"
  },
  description: "منصة إسلامية شاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. مجاني وسهل الاستخدام. | A comprehensive Islamic platform providing prayer times, daily azkar, and Quran reading with Tajweed. Free and user-friendly.",
  keywords: [
    "أوقات الصلاة", "prayer times", "أذكار", "azkar", "قرآن", "quran", "إسلامي", "islamic",
    "مسلم", "muslim", "صلاة", "salah", "دعاء", "dua", "تضرع", "supplication",
    "القرآن الكريم", "holy quran", "أذكار الصباح", "morning adhkar", "أذكار المساء", "evening adhkar",
    "تسابيح", "tasbeeh", "أدعية قرآنية", "quranic duas", "أدعية الأنبياء", "prophets duas",
    "موقع إسلامي", "islamic website", "تطبيق إسلامي", "islamic app", "أوقات الصلاة دقيقة", "accurate prayer times"
  ],
  authors: [{ name: "Sabil Elmoslem", url: "https://sabil-elmoslem.vercel.app" }],
  creator: "Sabil Elmoslem",
  publisher: "Sabil Elmoslem",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://sabil-elmoslem.vercel.app/'),
  alternates: {
    canonical: '/',
    languages: {
      'ar': '/ar',
      'en': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
    url: 'https://sabil-elmoslem.vercel.app/',
    siteName: 'سبيل المسلم | Sabil Elmoslem',
    title: 'سبيل المسلم - أوقات الصلاة والأذكار والقرآن | Sabil Elmoslem - Prayer Times, Azkar & Quran',
    description: 'منصة إسلامية شاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. مجاني وسهل الاستخدام. | A comprehensive Islamic platform providing prayer times, daily azkar, and Quran reading with Tajweed. Free and user-friendly.',
    images: [
      {
        url: '/images/logo.png',
        width: 1200,
        height: 630,
        alt: 'سبيل المسلم | Sabil Elmoslem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سبيل المسلم - أوقات الصلاة والأذكار والقرآن | Sabil Elmoslem - Prayer Times, Azkar & Quran',
    description: 'منصة إسلامية شاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم. مجاني وسهل الاستخدام. | A comprehensive Islamic platform providing prayer times, daily azkar, and Quran reading with Tajweed. Free and user-friendly.',
    images: ['/images/logo.png'],
    creator: '@sabilelmoslem',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'religion',
  classification: 'Islamic',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/logo.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/favicon.ico', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/images/logo.png', color: '#16a34a' },
    ],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#16a34a',
    'theme-color': '#16a34a',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#16a34a' },
    { media: '(prefers-color-scheme: dark)', color: '#15803d' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="application-name" content="سبيل المسلم | Sabil Elmoslem" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="سبيل المسلم | Sabil Elmoslem" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#16a34a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#16a34a" />

        {/* Structured Data for Sabil Elmoslem */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "سبيل المسلم | Sabil Elmoslem",
              "alternateName": ["Sabil Elmoslem", "سبيل المسلم"],
              "url": "https://sabil-elmoslem.vercel.app",
              "description": {
                "@type": "Text",
                "ar": "منصة إسلامية شاملة لأوقات الصلاة والأذكار اليومية وقراءة القرآن الكريم",
                "en": "A comprehensive Islamic platform providing prayer times, daily azkar, and Quran reading"
              },
              "inLanguage": ["ar", "en"],
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://sabil-elmoslem.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Sabil Elmoslem",
                "url": "https://sabil-elmoslem.vercel.app"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${tajawal.variable} antialiased bg-gray-50 dark:bg-gray-900 min-h-screen font-sans`}
      >
        <ErrorBoundary>
          <ToastProvider>
            <UserProvider>
              <MotionConfig reducedMotion="user">
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-grow">
                    <PageTransition>
                      {children}
                    </PageTransition>
                    <SpeedInsights />
                    <ScrollToTopButton />
                  </main>
                  <Footer />
                </div>
              </MotionConfig>
            </UserProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}