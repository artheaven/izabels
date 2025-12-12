import type { Metadata } from 'next';
import { noIndexMetadata } from '@/lib/metadata/templates';

export const metadata: Metadata = {
  ...noIndexMetadata,
  title: 'Количка',
  description: 'Вашата количка с избрани цветя и подаръци',
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

