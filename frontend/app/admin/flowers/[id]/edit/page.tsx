'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import FlowerForm from '@/components/admin/FlowerForm';

export default function EditFlowerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [flower, setFlower] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [flowerRes, categoriesRes] = await Promise.all([
        adminApi.getFlowerById(parseInt(params.id)),
        adminApi.getCategories(),
      ]);

      setFlower(flowerRes.data.flower);

      const flowersCat = categoriesRes.data.categories.find((cat: any) => 
        cat.slug === 'cvetya-srez'
      );
      if (flowersCat) {
        setCategories(flowersCat.children || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await adminApi.updateFlower(parseInt(params.id), data);
      alert('Цветок обновлен');
      router.push('/admin/catalog/inventory');
    } catch (error: any) {
      console.error('Error updating flower:', error);
      alert(error.response?.data?.error || 'Ошибка при обновлении');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!flower) return <div>Цветок не найден</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Редактировать цветок</h1>
      </div>
      <FlowerForm 
        flower={flower}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
