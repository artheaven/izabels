'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import BouquetForm from '@/components/admin/BouquetForm';

export default function NewBouquetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [flowers, setFlowers] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, flowersRes, packagingRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getFlowers(),
        adminApi.getPackaging(),
      ]);

      // Загружаем подкатегории букетов (не главную категорию)
      const bouquetSubcategories = categoriesRes.data.categories.filter((cat: any) => 
        cat.type === 'BOUQUETS' && cat.parentId != null
      );
      setCategories(bouquetSubcategories);

      setFlowers(flowersRes.data.flowers);
      setPackaging(packagingRes.data.packaging);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await adminApi.createBouquet(data);
      alert('Букет создан');
      router.push('/admin/catalog/products');
    } catch (error: any) {
      console.error('Error creating bouquet:', error);
      alert(error.response?.data?.error || 'Ошибка при создании букета');
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Добавить букет</h1>
      </div>
      <BouquetForm 
        categories={categories}
        flowers={flowers}
        packaging={packaging}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

