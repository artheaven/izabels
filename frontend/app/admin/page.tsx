'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminHomePage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на заказы
    router.push('/admin/orders');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Загрузка...</p>
    </div>
  );
}
