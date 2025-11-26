'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import BouquetForm from '@/components/admin/BouquetForm';

export default function EditBouquetPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [bouquet, setBouquet] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [flowers, setFlowers] = useState<any[]>([]);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bouquetRes, categoriesRes, flowersRes, packagingRes] = await Promise.all([
        adminApi.getBouquetById(parseInt(params.id)),
        adminApi.getCategories(),
        adminApi.getFlowers(),
        adminApi.getPackaging(),
      ]);

      setBouquet(bouquetRes.data.bouquet);

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
      await adminApi.updateBouquet(parseInt(params.id), data);
      alert('Букет обновлен');
      router.push('/admin/catalog/products');
    } catch (error: any) {
      console.error('Error updating bouquet:', error);
      alert(error.response?.data?.error || 'Ошибка при обновлении');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!bouquet) return <div>Букет не найден</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Редактировать букет</h1>
      </div>
      <BouquetForm 
        bouquet={bouquet}
        categories={categories}
        flowers={flowers}
        packaging={packaging}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

