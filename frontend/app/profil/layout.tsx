import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/metadata/templates';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: 'Профил',
  description: 'Вашият профил',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
      <Footer />
    </>
  );
}

