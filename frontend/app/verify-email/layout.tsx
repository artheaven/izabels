import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Потвърждение на имейл - Изабелс Флауър',
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

