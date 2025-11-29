'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import PackagingForm from '@/components/admin/PackagingForm';

export default function EditPackagingPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [packaging, setPackaging] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [packagingRes, categoriesRes] = await Promise.all([
        adminApi.getPackagingById(parseInt(params.id)),
        adminApi.getCategories(),
      ]);

      setPackaging(packagingRes.data.packaging);

      const packagingCat = categoriesRes.data.categories.find((cat: any) => 
        cat.slug === 'opakovka'
      );
      if (packagingCat) {
        setCategories(packagingCat.children || []);
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
      await adminApi.updatePackaging(parseInt(params.id), data);
      alert('Упаковка обновлена');
      router.push('/admin/catalog/inventory');
    } catch (error: any) {
      console.error('Error updating packaging:', error);
      alert(error.response?.data?.error || 'Ошибка при обновлении');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!packaging) return <div>Упаковка не найдена</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Редактировать упаковку</h1>
      </div>
      <PackagingForm 
        packaging={packaging}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => router.back()}
      />
    </div>
  );
}
