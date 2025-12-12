import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/metadata/templates';

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
  return children;
}

