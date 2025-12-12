import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/metadata/templates';

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: 'Поръчка',
  description: 'Оформяне на поръчка',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

