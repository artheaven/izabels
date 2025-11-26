'use client';

import { useState, useEffect } from 'react';
import CustomCategorySelect from './CustomCategorySelect';
import CustomColorSelect from './CustomColorSelect';

interface Props {
  packaging?: any;
  categories?: any[]; // Больше не используется, CustomCategorySelect сам загружает
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function PackagingForm({ packaging, categories, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    colorId: '',
    isTransparent: false,
    hasInscriptions: false,
    unit: 'piece',
    pricePerUnit: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (packaging) {
      const translation = packaging.translations?.find((t: any) => t.lang === 'bg');
      setFormData({
        name: translation?.name || '',
        description: translation?.description || '',
        categoryId: packaging.categoryId?.toString() || '',
        colorId: packaging.colorId?.toString() || '',
        isTransparent: packaging.isTransparent || false,
        hasInscriptions: packaging.hasInscriptions || false,
        unit: packaging.unit || 'piece',
        pricePerUnit: packaging.pricePerUnit?.toString() || '',
      });
    }
  }, [packaging]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      data.append('colorId', formData.colorId);
      data.append('isTransparent', formData.isTransparent.toString());
      data.append('hasInscriptions', formData.hasInscriptions.toString());
      data.append('unit', formData.unit);
      data.append('pricePerUnit', formData.pricePerUnit);

      await onSubmit(data);
    } catch (error) {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-3xl">
      <div className="space-y-6">
        {/* Название */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Название (на болгарском) *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full border rounded px-4 py-2"
            placeholder="Червена хартия"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full border rounded px-4 py-2"
          />
        </div>

        {/* Тип (категория) */}
        <CustomCategorySelect
          value={formData.categoryId ? parseInt(formData.categoryId) : null}
          onChange={(categoryId) => setFormData({ ...formData, categoryId: categoryId.toString() })}
          categoryType="PACKAGING"
          label="Тип"
          required
        />

        {/* Цвет */}
        <CustomColorSelect
          value={formData.colorId ? parseInt(formData.colorId) : null}
          onChange={(colorId) => setFormData({ ...formData, colorId: colorId ? colorId.toString() : '' })}
          label="Цвет"
        />

        {/* Чекбоксы */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isTransparent}
                onChange={(e) => setFormData({ ...formData, isTransparent: e.target.checked })}
                className="rounded w-4 h-4"
              />
              <span>Прозрачен</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.hasInscriptions}
                onChange={(e) => setFormData({ ...formData, hasInscriptions: e.target.checked })}
                className="rounded w-4 h-4"
              />
              <span>С надписями</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Единица измерения */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Единица измерения *
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="piece"
                  checked={formData.unit === 'piece'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="rounded"
                />
                <span>Штуки (шт)</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="meter"
                  checked={formData.unit === 'meter'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="rounded"
                />
                <span>Метры (м)</span>
              </label>
            </div>
          </div>

          {/* Цена за единицу */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Цена за единицу (лв) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerUnit}
              onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </form>
  );
}

