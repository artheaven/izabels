import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Моите поръчки - Izabels Flower',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

