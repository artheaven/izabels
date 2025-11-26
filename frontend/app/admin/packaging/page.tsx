'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminPackagingPage() {
  const [packaging, setPackaging] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackaging();
  }, []);

  const loadPackaging = async () => {
    try {
      const response = await adminApi.getPackaging();
      setPackaging(response.data.packaging);
    } catch (error) {
      console.error('Error loading packaging:', error);
      alert('Ошибка загрузки упаковки');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminApi.togglePackaging(id);
      loadPackaging();
    } catch (error) {
      console.error('Error toggling packaging:', error);
      alert('Ошибка переключения');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;

    try {
      await adminApi.deletePackaging(id);
      alert('Материал удален');
      loadPackaging();
    } catch (error) {
      console.error('Error deleting packaging:', error);
      alert('Ошибка при удалении');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление упаковкой</h1>
        <Link
          href="/admin/packaging/new"
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить материал</span>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цвет</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ед.изм.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Активен</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {packaging.map((item) => {
              const translation = item.translations[0];
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{translation?.name || item.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.sku}</td>
                  <td className="px-6 py-4 text-sm">{item.category.name}</td>
                  <td className="px-6 py-4">
                    {item.color && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center space-x-2">
                        {item.color.hexCode && (
                          <span 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: item.color.hexCode }}
                          />
                        )}
                        <span>{item.color.name}</span>
                      </span>
                    )}
                    {item.isTransparent && (
                      <span className="ml-2 text-xs text-gray-500">(прозрачен)</span>
                    )}
                    {item.hasInscriptions && (
                      <span className="ml-2 text-xs text-gray-500">(с надписями)</span>
                    )}
                  </td>
                  <td className="px-6 py-4">{item.unit === 'piece' ? 'шт' : 'м'}</td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(item.pricePerUnit)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        item.isActive ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          item.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/admin/packaging/${item.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id)}
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

        {packaging.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Упаковочные материалы не найдены
          </div>
        )}
      </div>
    </div>
  );
}

