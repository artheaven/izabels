'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import { X } from 'lucide-react';
import CustomCategorySelect from './CustomCategorySelect';

interface Props {
  flower?: any;
  categories?: any[]; // Больше не используется, CustomCategorySelect сам загружает
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function FlowerForm({ flower, categories, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    priceCost: '',
    markup: '2.0',
  });

  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (flower) {
      const translation = flower.translations?.find((t: any) => t.lang === 'bg');
      setFormData({
        name: translation?.name || '',
        description: translation?.description || '',
        categoryId: flower.categoryId?.toString() || '',
        priceCost: flower.priceCost?.toString() || '',
        markup: flower.markup?.toString() || '2.0',
      });
      setExistingImages(flower.images || []);
    }
  }, [flower]);

  const calculatedPrice = formData.priceCost && formData.markup
    ? (parseFloat(formData.priceCost) * parseFloat(formData.markup)).toFixed(2)
    : '0.00';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = existingImages.length + images.length + newFiles.length;
      
      if (totalImages > 4) {
        alert('Максимум 4 фото');
        return;
      }
      
      setImages([...images, ...newFiles]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imagePath: string) => {
    setExistingImages(existingImages.filter(img => img !== imagePath));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      data.append('priceCost', formData.priceCost);
      data.append('markup', formData.markup);
      
      images.forEach((file) => {
        data.append('images', file);
      });

      data.append('existingImages', JSON.stringify(existingImages));

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
            placeholder="Червена роза"
          />
        </div>

        {/* Описание */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Описание (на болгарском)
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full border rounded px-4 py-2"
            placeholder="Класическа червена роза..."
          />
        </div>

        {/* Категория */}
        <CustomCategorySelect
          value={formData.categoryId ? parseInt(formData.categoryId) : null}
          onChange={(categoryId) => setFormData({ ...formData, categoryId: categoryId.toString() })}
          categoryType="FLOWERS"
          label="Подкатегория"
          required
        />

        <div className="grid grid-cols-2 gap-6">
          {/* Закупочная цена */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Закупочная цена (лв) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.priceCost}
              onChange={(e) => setFormData({ ...formData, priceCost: e.target.value })}
              required
              className="w-full border rounded px-4 py-2"
            />
          </div>

          {/* Наценка */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Множитель наценки *
            </label>
            <select
              value={formData.markup}
              onChange={(e) => setFormData({ ...formData, markup: e.target.value })}
              required
              className="w-full border rounded px-4 py-2"
            >
              <option value="1.5">×1.5</option>
              <option value="2.0">×2.0</option>
              <option value="2.5">×2.5</option>
              <option value="3.0">×3.0</option>
            </select>
          </div>
        </div>

        {/* Расчетная цена */}
        <div className="bg-gray-50 p-4 rounded">
          <p className="text-sm text-gray-600">Цена продажи (расчетная):</p>
          <p className="text-2xl font-bold text-primary">{calculatedPrice} лв</p>
        </div>

        {/* Фотографии */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Фотографии (макс. 4)
          </label>
          
          {/* Существующие фото */}
          {existingImages.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {existingImages.map((img, index) => (
                <div key={index} className="relative">
                  <Image
                    src={getImageUrl(img)}
                    alt={`Фото ${index + 1}`}
                    width={150}
                    height={150}
                    className="object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(img)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Новые фото */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Новое фото ${index + 1}`}
                    className="w-full h-32 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(existingImages.length + images.length) < 4 && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border rounded px-4 py-2"
            />
          )}
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
