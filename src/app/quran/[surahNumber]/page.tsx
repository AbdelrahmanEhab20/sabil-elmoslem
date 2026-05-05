import { notFound } from 'next/navigation';
import QuranPage from '../page';

interface QuranSurahPageProps {
  params: Promise<{ surahNumber: string }>;
}

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, index) => ({
    surahNumber: String(index + 1),
  }));
}

export default async function QuranSurahPage({ params }: QuranSurahPageProps) {
  const { surahNumber } = await params;
  const parsed = Number.parseInt(surahNumber, 10);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 114) {
    notFound();
  }

  return <QuranPage />;
}
