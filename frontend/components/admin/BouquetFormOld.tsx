'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import { X, Plus, Minus } from 'lucide-react';
import CustomCategorySelect from './CustomCategorySelect';

interface FlowerItem {
  flowerId: number;
  quantity: number;
}

interface MaterialItem {
  packagingId: number;
  quantity: number;
}

interface Props {
  bouquet?: any;
  categories: any[];
  flowers: any[];
  packaging: any[];
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function BouquetForm({ bouquet, categories, flowers, packaging, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    size: 'M',
    extraCharge: '0',
    discountPercent: '0',
  });

  const [selectedFlowers, setSelectedFlowers] = useState<FlowerItem[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bouquet) {
      const translation = bouquet.translations?.find((t: any) => t.lang === 'bg');
      setFormData({
        name: translation?.name || '',
        description: translation?.description || '',
        categoryId: bouquet.categoryId?.toString() || '',
        size: bouquet.size || 'M',
        extraCharge: bouquet.extraCharge?.toString() || '0',
        discountPercent: bouquet.discountPercent?.toString() || '0',
      });

      setSelectedFlowers(
        bouquet.flowers?.map((f: any) => ({
          flowerId: f.flower.id,
          quantity: f.quantity,
        })) || []
      );

      setSelectedMaterials(
        bouquet.materials?.map((m: any) => ({
          packagingId: m.packaging.id,
          quantity: m.quantity,
        })) || []
      );

      setExistingImages(bouquet.images || []);
    }
  }, [bouquet]);

  // Расчет базовой цены
  const calculateBasePrice = (): number => {
    let total = 0;

    selectedFlowers.forEach(({ flowerId, quantity }) => {
      const flower = flowers.find(f => f.id === flowerId);
      if (flower) {
        total += parseFloat(flower.price) * quantity;
      }
    });

    selectedMaterials.forEach(({ packagingId, quantity }) => {
      const pack = packaging.find(p => p.id === packagingId);
      if (pack) {
        total += parseFloat(pack.pricePerUnit) * quantity;
      }
    });

    return total;
  };

  const basePrice = calculateBasePrice();
  const extraCharge = parseFloat(formData.extraCharge) || 0;
  const priceBeforeDiscount = basePrice + extraCharge;
  const discountPercent = parseFloat(formData.discountPercent) || 0;
  const finalPrice = priceBeforeDiscount * (1 - discountPercent / 100);

  // Управление цветами
  const addFlower = () => {
    setSelectedFlowers([...selectedFlowers, { flowerId: 0, quantity: 1 }]);
  };

  const removeFlower = (index: number) => {
    setSelectedFlowers(selectedFlowers.filter((_, i) => i !== index));
  };

  const updateFlower = (index: number, field: keyof FlowerItem, value: any) => {
    const updated = [...selectedFlowers];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedFlowers(updated);
  };

  // Управление упаковкой
  const addMaterial = () => {
    setSelectedMaterials([...selectedMaterials, { packagingId: 0, quantity: 1 }]);
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index));
  };

  const updateMaterial = (index: number, field: keyof MaterialItem, value: any) => {
    const updated = [...selectedMaterials];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedMaterials(updated);
  };

  // Управление изображениями
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = existingImages.length + images.length + newFiles.length;
      
      if (totalImages > 10) {
        alert('Максимум 10 фото');
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

    if (selectedFlowers.length === 0) {
      alert('Добавьте хотя бы один цветок в состав букета');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      data.append('size', formData.size);
      data.append('extraCharge', formData.extraCharge);
      data.append('discountPercent', formData.discountPercent);
      
      data.append('flowers', JSON.stringify(selectedFlowers));
      data.append('materials', JSON.stringify(selectedMaterials));

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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-5xl">
      <div className="space-y-8">
        {/* Основная информация */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold border-b pb-2">Основная информация</h2>

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
              placeholder="Романтичен букет с рози"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Описание (на болгарском)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border rounded px-4 py-2"
              placeholder="Красив букет от червени рози..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <CustomCategorySelect
                value={formData.categoryId ? parseInt(formData.categoryId) : null}
                onChange={(categoryId) => setFormData({ ...formData, categoryId: categoryId.toString() })}
                categoryType="BOUQUETS"
                label="Подкатегория"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Размер *
              </label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                required
                className="w-full border rounded px-4 py-2"
              >
                <option value="S">S (Маленький)</option>
                <option value="M">M (Средний)</option>
                <option value="L">L (Большой)</option>
                <option value="XL">XL (Очень большой)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Состав букета - Цветы */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Состав букета - Цветы</h2>
          
          {selectedFlowers.map((item, index) => {
            const flower = flowers.find(f => f.id === item.flowerId);
            const itemPrice = flower ? parseFloat(flower.price) * item.quantity : 0;

            return (
              <div key={index} className="flex items-end space-x-4 bg-gray-50 p-4 rounded">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Цветок</label>
                  <select
                    value={item.flowerId}
                    onChange={(e) => updateFlower(index, 'flowerId', parseInt(e.target.value))}
                    required
                    className="w-full border rounded px-4 py-2"
                  >
                    <option value="0">Выберите цветок...</option>
                    {flowers.map((f) => {
                      const trans = f.translations?.[0];
                      return (
                        <option key={f.id} value={f.id}>
                          {trans?.name || f.sku} - {f.price} лв
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-semibold mb-2">Количество</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateFlower(index, 'quantity', parseInt(e.target.value))}
                    required
                    className="w-full border rounded px-4 py-2"
                  />
                </div>

                <div className="w-32 text-right">
                  <label className="block text-sm font-semibold mb-2">Сумма</label>
                  <p className="text-lg font-bold text-primary">{itemPrice.toFixed(2)} лв</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFlower(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addFlower}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить цветок</span>
          </button>
        </div>

        {/* Состав букета - Упаковка */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Состав букета - Упаковка</h2>
          
          {selectedMaterials.map((item, index) => {
            const pack = packaging.find(p => p.id === item.packagingId);
            const itemPrice = pack ? parseFloat(pack.pricePerUnit) * item.quantity : 0;

            return (
              <div key={index} className="flex items-end space-x-4 bg-gray-50 p-4 rounded">
                <div className="flex-1">
                  <label className="block text-sm font-semibold mb-2">Материал</label>
                  <select
                    value={item.packagingId}
                    onChange={(e) => updateMaterial(index, 'packagingId', parseInt(e.target.value))}
                    required
                    className="w-full border rounded px-4 py-2"
                  >
                    <option value="0">Выберите материал...</option>
                    {packaging.map((p) => {
                      const trans = p.translations?.[0];
                      return (
                        <option key={p.id} value={p.id}>
                          {trans?.name || p.sku} - {p.pricePerUnit} лв/{p.unit === 'piece' ? 'шт' : 'м'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="w-32">
                  <label className="block text-sm font-semibold mb-2">Количество</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={item.quantity}
                    onChange={(e) => updateMaterial(index, 'quantity', parseFloat(e.target.value))}
                    required
                    className="w-full border rounded px-4 py-2"
                  />
                </div>

                <div className="w-32 text-right">
                  <label className="block text-sm font-semibold mb-2">Сумма</label>
                  <p className="text-lg font-bold text-primary">{itemPrice.toFixed(2)} лв</p>
                </div>

                <button
                  type="button"
                  onClick={() => removeMaterial(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addMaterial}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Добавить материал</span>
          </button>
        </div>

        {/* Расчет цены */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Ценообразование</h2>

          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-1">Базовая цена (состав):</p>
              <p className="text-2xl font-bold">{basePrice.toFixed(2)} лв</p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Наценка за работу (лв)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.extraCharge}
                onChange={(e) => setFormData({ ...formData, extraCharge: e.target.value })}
                className="w-full border rounded px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Скидка (%)
              </label>
              <select
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                className="w-full border rounded px-4 py-2"
              >
                <option value="0">Без скидки</option>
                <option value="5">5%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="20">20%</option>
              </select>
            </div>
          </div>

          <div className="bg-primary/10 p-6 rounded-lg">
            <div className="space-y-2">
              {discountPercent > 0 && (
                <>
                  <div className="flex justify-between text-lg">
                    <span>Цена без скидки:</span>
                    <span className="line-through text-gray-500">{priceBeforeDiscount.toFixed(2)} лв</span>
                  </div>
                  <div className="flex justify-between text-lg text-red-600">
                    <span>Скидка -{discountPercent}%:</span>
                    <span>-{(priceBeforeDiscount - finalPrice).toFixed(2)} лв</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-2xl font-bold text-primary border-t pt-2">
                <span>Итоговая цена:</span>
                <span>{finalPrice.toFixed(2)} лв</span>
              </div>
            </div>
          </div>
        </div>

        {/* Фотографии */}
        <div>
          <h2 className="text-xl font-bold border-b pb-2 mb-4">Фотографии (макс. 10)</h2>
          
          {existingImages.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mb-4">
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

          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-4 mb-4">
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

          {(existingImages.length + images.length) < 10 && (
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
            className="flex-1 bg-primary text-white py-3 rounded text-lg font-semibold hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : 'Сохранить букет'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 border rounded text-lg hover:bg-gray-50"
          >
            Отмена
          </button>
        </div>
      </div>
    </form>
  );
}

