import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/metadata/templates';

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: 'Регистрация',
  description: 'Създайте профил',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

