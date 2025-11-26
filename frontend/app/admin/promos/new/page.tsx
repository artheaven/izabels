'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

export default function NewPromoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERMANENT' as 'SINGLE_USE' | 'PERMANENT' | 'DATE_RANGE',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    validFrom: '',
    validTo: '',
    maxUses: '',
    maxUsesPerUser: '1',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data: any = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        isActive: formData.isActive,
        maxUsesPerUser: parseInt(formData.maxUsesPerUser),
      };

      if (formData.minOrderAmount) {
        data.minOrderAmount = parseFloat(formData.minOrderAmount);
      }
      if (formData.maxDiscount) {
        data.maxDiscount = parseFloat(formData.maxDiscount);
      }
      if (formData.maxUses) {
        data.maxUses = parseInt(formData.maxUses);
      }
      if (formData.validFrom) {
        data.validFrom = new Date(formData.validFrom).toISOString();
      }
      if (formData.validTo) {
        data.validTo = new Date(formData.validTo).toISOString();
      }

      await adminApi.createPromo(data);
      alert('Промокод создан');
      router.push('/admin/promos');
    } catch (error: any) {
      console.error('Error creating promo:', error);
      alert(error.response?.data?.error || 'Ошибка при создании промокода');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Новый промокод</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl">
        <div className="space-y-6">
          {/* Код промокода */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Код промокода *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              required
              className="w-full border rounded px-4 py-2 uppercase font-mono"
              placeholder="SUMMER2024"
            />
          </div>

          {/* Тип промокода */}
          <div>
            <label className="block text-sm font-semibold mb-2">Тип промокода *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full border rounded px-4 py-2"
            >
              <option value="SINGLE_USE">Одноразовый</option>
              <option value="PERMANENT">Постоянный</option>
              <option value="DATE_RANGE">Действителен от и до</option>
            </select>
          </div>

          {/* Даты (если выбран DATE_RANGE) */}
          {formData.type === 'DATE_RANGE' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Действителен с</label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Действителен до</label>
                <input
                  type="datetime-local"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                  className="w-full border rounded px-4 py-2"
                />
              </div>
            </div>
          )}

          {/* Тип скидки */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Тип скидки *</label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                className="w-full border rounded px-4 py-2"
              >
                <option value="PERCENTAGE">Процент (%)</option>
                <option value="FIXED">Фиксированная сумма (лв)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Значение скидки *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                required
                className="w-full border rounded px-4 py-2"
                placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '20'}
              />
            </div>
          </div>

          {/* Условия */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Минимальная сумма заказа (лв)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                className="w-full border rounded px-4 py-2"
                placeholder="50"
              />
            </div>
            {formData.discountType === 'PERCENTAGE' && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Максимальная скидка (лв)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  className="w-full border rounded px-4 py-2"
                  placeholder="100"
                />
              </div>
            )}
          </div>

          {/* Лимиты использования */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Максимум использований (всего)
              </label>
              <input
                type="number"
                min="0"
                value={formData.maxUses}
                onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                className="w-full border rounded px-4 py-2"
                placeholder="Без ограничений"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">
                Максимум на пользователя *
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxUsesPerUser}
                onChange={(e) => setFormData({ ...formData, maxUsesPerUser: e.target.value })}
                required
                className="w-full border rounded px-4 py-2"
              />
            </div>
          </div>

          {/* Активен */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2 w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm font-semibold">
              Промокод активен
            </label>
          </div>

          {/* Кнопки */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Создать промокод'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

