import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/metadata/templates';

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: 'Вход',
  description: 'Вход в профила',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

