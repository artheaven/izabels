'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import PackagingForm from '@/components/admin/PackagingForm';

export default function NewPackagingPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      const packagingCat = response.data.categories.find((cat: any) => 
        cat.slug === 'opakovka'
      );
      if (packagingCat) {
        setCategories(packagingCat.children || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    try {
      await adminApi.createPackaging(data);
      alert('Упаковка создана');
      router.push('/admin/catalog/inventory');
    } catch (error: any) {
      console.error('Error creating packaging:', error);
      alert(error.response?.data?.error || 'Ошибка при создании');
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
        <h1 className="text-3xl font-bold">Добавить упаковку</h1>
      </div>
      <PackagingForm 
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}

