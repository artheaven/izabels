'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

interface Promo {
  id: number;
  code: string;
  type: 'SINGLE_USE' | 'PERMANENT' | 'DATE_RANGE';
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom?: string;
  validTo?: string;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

const typeLabels = {
  SINGLE_USE: 'Одноразовый',
  PERMANENT: 'Постоянный',
  DATE_RANGE: 'С датами',
};

export default function PromosPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadPromos();
  }, [filter]);

  const loadPromos = async () => {
    try {
      const response = await adminApi.getPromos({
        isActive: filter === 'all' ? undefined : filter === 'active',
      });
      setPromos(response.data.promos);
    } catch (error) {
      console.error('Ошибка загрузки промокодов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await adminApi.togglePromo(id);
      loadPromos();
    } catch (error) {
      console.error('Ошибка переключения промокода:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить промокод?')) return;

    try {
      await adminApi.deletePromo(id);
      loadPromos();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Промокоды</h1>
        <Link
          href="/admin/promos/new"
          className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
        >
          + Создать промокод
        </Link>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md ${
            filter === 'all'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md ${
            filter === 'active'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Активные
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-md ${
            filter === 'inactive'
              ? 'bg-pink-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Неактивные
        </button>
      </div>

      {/* Таблица промокодов */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Код
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Скидка
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Использования
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Период действия
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promos.map((promo) => (
              <tr key={promo.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{promo.code}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {typeLabels[promo.type]}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {promo.discountType === 'PERCENTAGE'
                    ? `${promo.discountValue}%`
                    : `${promo.discountValue} лв.`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {promo.usedCount} {promo.maxUses ? `/ ${promo.maxUses}` : ''}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {promo.validFrom && promo.validTo
                    ? `${new Date(promo.validFrom).toLocaleDateString('ru-RU')} - ${new Date(
                        promo.validTo
                      ).toLocaleDateString('ru-RU')}`
                    : promo.type === 'PERMANENT'
                    ? 'Бессрочно'
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      promo.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {promo.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    onClick={() => handleToggle(promo.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    {promo.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                  <Link
                    href={`/admin/promos/${promo.id}`}
                    className="text-pink-600 hover:text-pink-900"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDelete(promo.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {promos.length === 0 && (
          <div className="text-center py-8 text-gray-500">Промокоды не найдены</div>
        )}
      </div>
    </div>
  );
}

