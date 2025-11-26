'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import FlowerForm from '@/components/admin/FlowerForm';

export default function NewFlowerPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      // Находим категорию "Цветы-срез" и её подкатегории
      const flowersCat = response.data.categories.find((cat: any) => 
        cat.slug === 'cvetya-srez'
      );
      if (flowersCat) {
        setCategories(flowersCat.children || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await adminApi.createFlower(data);
      alert('Цветок создан');
      router.push('/admin/catalog/inventory');
    } catch (error: any) {
      console.error('Error creating flower:', error);
      alert(error.response?.data?.error || 'Ошибка при создании цветка');
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
        <h1 className="text-3xl font-bold">Добавить цветок</h1>
      </div>
      <FlowerForm 
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

