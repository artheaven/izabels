'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminApi, getImageUrl } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function AdminBouquetsPage() {
  const [bouquets, setBouquets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  useEffect(() => {
    loadBouquets();
  }, []);

  const loadBouquets = async () => {
    try {
      const response = await adminApi.getBouquets();
      setBouquets(response.data.bouquets);
    } catch (error) {
      console.error('Error loading bouquets:', error);
      alert('Ошибка загрузки букетов');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminApi.toggleBouquet(id);
      loadBouquets();
    } catch (error) {
      console.error('Error toggling bouquet:', error);
      alert('Ошибка переключения');
    }
  };

  const handleToggleFeatured = async (id: number) => {
    try {
      await adminApi.toggleBouquetFeatured(id);
      loadBouquets();
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('Ошибка переключения популярности');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот букет?')) return;

    try {
      await adminApi.deleteBouquet(id);
      alert('Букет удален');
      loadBouquets();
    } catch (error) {
      console.error('Error deleting bouquet:', error);
      alert('Ошибка при удалении');
    }
  };

  // Группировка букетов по категориям
  const groupedBouquets = bouquets.reduce((acc, bouquet) => {
    const categoryName = bouquet.category?.name || 'Без категории';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(bouquet);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Управление букетами</h1>
        <div className="flex space-x-2">
          <div className="border rounded-md">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 ${viewMode === 'table' ? 'bg-pink-100 text-pink-600' : 'bg-white'}`}
            >
              Таблица
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-pink-100 text-pink-600' : 'bg-white'}`}
            >
              Карточки
            </button>
          </div>
          <Link
            href="/admin/bouquets/new"
            className="flex items-center space-x-2 bg-[#02240D] text-white px-4 py-2 rounded hover:bg-[#02240D]/90"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить букет</span>
          </Link>
        </div>
      </div>

      {bouquets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Букеты не найдены</div>
      ) : viewMode === 'table' ? (
        // Табличный вид с группировкой по категориям
        <div className="space-y-6">
          {(Object.entries(groupedBouquets) as [string, any[]][]).map(([categoryName, categoryBouquets]) => (
            <div key={categoryName} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-100 px-6 py-3 border-b">
                <h2 className="text-lg font-semibold">{categoryName}</h2>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Фото</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Состав</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Активен</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Популярный</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categoryBouquets.map((bouquet) => {
                    const translation = bouquet.translations[0];
                    return (
                      <tr key={bouquet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="relative w-16 h-16">
                            {bouquet.images[0] ? (
                              <Image
                                src={getImageUrl(bouquet.images[0])}
                                alt={translation?.name || bouquet.sku}
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
                        <td className="px-6 py-4 font-medium">{translation?.name || bouquet.sku}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{bouquet.sku}</td>
                        <td className="px-6 py-4 text-sm">
                          {bouquet.flowers.length} цветов, {bouquet.materials.length} материалов
                        </td>
                        <td className="px-6 py-4 font-semibold">{formatPrice(bouquet.price)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggle(bouquet.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              bouquet.isActive ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                bouquet.isActive ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleFeatured(bouquet.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              bouquet.isFeatured ? 'bg-yellow-500' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                bouquet.isFeatured ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Link
                              href={`/admin/bouquets/${bouquet.id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(bouquet.id)}
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
            </div>
          ))}
        </div>
      ) : (
        // Grid вид (карточки)
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bouquets.map((bouquet) => {
            const translation = bouquet.translations[0];
            const hasDiscount = bouquet.discountPercent > 0;

            return (
              <div key={bouquet.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative aspect-square bg-gray-100">
                  {bouquet.images[0] ? (
                    <Image
                      src={getImageUrl(bouquet.images[0])}
                      alt={translation?.name || bouquet.sku}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Нет фото
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{bouquet.discountPercent}%
                    </div>
                  )}
                  {!bouquet.isActive && (
                    <div className="absolute top-2 left-2 bg-gray-800 text-white px-2 py-1 rounded text-sm">
                      Неактивен
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                    {translation?.name || bouquet.sku}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">SKU: {bouquet.sku}</p>

                  <div className="mb-4">
                    {hasDiscount && bouquet.priceOld && (
                      <p className="text-gray-400 line-through text-sm">
                        {formatPrice(bouquet.priceOld)}
                      </p>
                    )}
                    <p className="text-primary font-bold text-xl">
                      {formatPrice(bouquet.price)}
                    </p>
                  </div>

                  <div className="text-xs text-gray-600 mb-4">
                    <p>Состав: {bouquet.flowers.length} цветов, {bouquet.materials.length} материалов</p>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Активен:</span>
                      <button
                        onClick={() => handleToggle(bouquet.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          bouquet.isActive ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            bouquet.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Популярный:</span>
                      <button
                        onClick={() => handleToggleFeatured(bouquet.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          bouquet.isFeatured ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            bouquet.isFeatured ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/bouquets/${bouquet.id}/edit`}
                      className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Изменить</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(bouquet.id)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

