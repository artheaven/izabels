'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi, getImageUrl } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminFlowersPage() {
  const [flowers, setFlowers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadFlowers();
  }, []);

  const loadFlowers = async () => {
    try {
      const response = await adminApi.getFlowers({ search });
      setFlowers(response.data.flowers);
    } catch (error) {
      console.error('Error loading flowers:', error);
      alert('Ошибка загрузки цветов');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminApi.toggleFlower(id);
      loadFlowers();
    } catch (error) {
      console.error('Error toggling flower:', error);
      alert('Ошибка переключения');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот цветок?')) return;

    try {
      await adminApi.deleteFlower(id);
      alert('Цветок удален');
      loadFlowers();
    } catch (error) {
      console.error('Error deleting flower:', error);
      alert('Ошибка при удалении');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление цветами</h1>
        <Link
          href="/admin/flowers/new"
          className="flex items-center space-x-2 bg-[#02240D] text-white px-4 py-2 rounded hover:bg-[#02240D]/90"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить цветок</span>
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && loadFlowers()}
          className="w-full max-w-md border rounded px-4 py-2"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фото</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Закупка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Наценка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Активен</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {flowers.map((flower) => {
              const translation = flower.translations[0];
              return (
                <tr key={flower.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="relative w-16 h-16">
                      {flower.images[0] ? (
                        <Image
                          src={getImageUrl(flower.images[0])}
                          alt={translation?.name || flower.sku}
                          fill
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                          Нет фото
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">{translation?.name || flower.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{flower.sku}</td>
                  <td className="px-6 py-4 text-sm">{flower.category.name}</td>
                  <td className="px-6 py-4">{formatPrice(flower.priceCost)}</td>
                  <td className="px-6 py-4">×{parseFloat(flower.markup)}</td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(flower.price)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(flower.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        flower.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          flower.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/flowers/${flower.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(flower.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {flowers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Цветы не найдены
          </div>
        )}
      </div>
    </div>
  );
}

