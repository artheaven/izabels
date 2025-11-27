'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl, adminApi } from '@/lib/api';
import { X, Plus } from 'lucide-react';
import CustomCategorySelect from './CustomCategorySelect';

interface FlowerItem {
  flowerId: number;
  quantity: number;
}

interface MaterialItem {
  packagingId: number;
  quantity: number;
}

interface SizeVariant {
  sizeId: number;
  sizeName: string;
  sizeLabel: string;
  enabled: boolean;
  flowerCount: number;
  extraCharge: string;
  discountPercent: string;
}

interface Props {
  bouquet?: any;
  categories: any[];
  flowers: any[];
  packaging: any[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export default function BouquetForm({ bouquet, categories, flowers, packaging, onSubmit, onCancel }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
  });

  const [sizes, setSizes] = useState<any[]>([]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [selectedFlowers, setSelectedFlowers] = useState<FlowerItem[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSizes();
  }, []);

  useEffect(() => {
    if (bouquet) {
      const translation = bouquet.translations?.find((t: any) => t.lang === 'bg');
      setFormData({
        name: translation?.name || '',
        description: translation?.description || '',
        categoryId: bouquet.categoryId?.toString() || '',
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

      // Загрузить варианты размеров букета
      if (bouquet.sizeVariants) {
        const variants = sizeVariants.map(sv => {
          const existing = bouquet.sizeVariants.find((bsv: any) => bsv.sizeId === sv.sizeId);
          if (existing) {
            return {
              ...sv,
              enabled: true,
              flowerCount: existing.flowerCount,
              extraCharge: existing.extraCharge.toString(),
              discountPercent: existing.discountPercent.toString(),
            };
          }
          return sv;
        });
        setSizeVariants(variants);
      }
    }
  }, [bouquet, sizes]);

  const loadSizes = async () => {
    try {
      console.log('Loading bouquet sizes...');
      const response = await adminApi.getBouquetSizes();
      console.log('Sizes response:', response.data);
      const loadedSizes = response.data.sizes;
      setSizes(loadedSizes);

      // Инициализировать варианты размеров
      const initialVariants: SizeVariant[] = loadedSizes.map((size: any) => {
        const bgTranslation = size.translations.find((t: any) => t.lang === 'bg');
        return {
          sizeId: size.id,
          sizeName: size.name,
          sizeLabel: bgTranslation?.name || size.name,
          enabled: false,
          flowerCount: 0,
          extraCharge: '0',
          discountPercent: '0',
        };
      });
      console.log('Initialized size variants:', initialVariants);
      setSizeVariants(initialVariants);
    } catch (error) {
      console.error('Error loading sizes:', error);
      alert('Ошибка при загрузке размеров букетов: ' + error);
    }
  };

  const toggleSizeVariant = (sizeId: number) => {
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === sizeId ? { ...sv, enabled: !sv.enabled } : sv
      )
    );
  };

  const updateSizeVariant = (sizeId: number, field: keyof SizeVariant, value: any) => {
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === sizeId ? { ...sv, [field]: value } : sv
      )
    );
  };

  // Расчет базовой цены для размера
  const calculateBasePriceForSize = (flowerCount: number): number => {
    if (selectedFlowers.length === 0 || flowerCount === 0) return 0;

    const totalFlowersInComposition = selectedFlowers.reduce((sum, item) => sum + item.quantity, 0);
    const multiplier = totalFlowersInComposition > 0 ? flowerCount / totalFlowersInComposition : 0;

    let total = 0;

    selectedFlowers.forEach(({ flowerId, quantity }) => {
      const flower = flowers.find(f => f.id === flowerId);
      if (flower) {
        total += parseFloat(flower.price) * quantity * multiplier;
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

    const enabledVariants = sizeVariants.filter(sv => sv.enabled);
    if (enabledVariants.length === 0) {
      alert('Выберите хотя бы один размер букета');
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);
      
      data.append('flowers', JSON.stringify(selectedFlowers));
      data.append('materials', JSON.stringify(selectedMaterials));

      // Добавляем варианты размеров
      const variantsData = enabledVariants.map(sv => ({
        sizeId: sv.sizeId,
        flowerCount: parseInt(sv.flowerCount.toString()) || 0,
        extraCharge: parseFloat(sv.extraCharge) || 0,
        discountPercent: parseInt(sv.discountPercent) || 0,
      }));
      data.append('sizeVariants', JSON.stringify(variantsData));

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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-6xl">
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

          <CustomCategorySelect
            value={formData.categoryId ? parseInt(formData.categoryId) : null}
            onChange={(categoryId) => setFormData({ ...formData, categoryId: categoryId.toString() })}
            categoryType="BOUQUETS"
            label="Подкатегория"
            required
          />
        </div>

        {/* Размеры букета */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Доступные размеры букета</h2>
          <p className="text-sm text-gray-600">Выберите размеры, в которых будет доступен этот букет</p>
          
          {sizeVariants.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">⚠️ Размеры не загружены. Проверьте консоль браузера для ошибок.</p>
              <p className="text-sm mt-2">Найдено размеров: {sizeVariants.length}</p>
            </div>
          )}

          {sizeVariants.map((variant) => {
            const basePrice = calculateBasePriceForSize(variant.flowerCount);
            const extraCharge = parseFloat(variant.extraCharge) || 0;
            const priceBeforeDiscount = basePrice + extraCharge;
            const discountPercent = parseFloat(variant.discountPercent) || 0;
            const finalPrice = priceBeforeDiscount * (1 - discountPercent / 100);

            return (
              <div
                key={variant.sizeId}
                className={`border rounded-lg p-4 ${variant.enabled ? 'border-[#02240D] bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={variant.enabled}
                    onChange={() => toggleSizeVariant(variant.sizeId)}
                    className="mt-1 w-5 h-5"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-lg font-bold cursor-pointer" onClick={() => toggleSizeVariant(variant.sizeId)}>
                        {variant.sizeName} - {variant.sizeLabel}
                      </label>
                      {variant.enabled && (
                        <div className="text-2xl font-bold text-[#02240D]">
                          {finalPrice.toFixed(2)} лв
                        </div>
                      )}
                    </div>

                    {variant.enabled && (
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Количество цветов *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={variant.flowerCount}
                            onChange={(e) => updateSizeVariant(variant.sizeId, 'flowerCount', parseInt(e.target.value) || 0)}
                            required
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Базовая цена
                          </label>
                          <input
                            type="text"
                            value={`${basePrice.toFixed(2)} лв`}
                            disabled
                            className="w-full border rounded px-3 py-2 bg-gray-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Наценка (лв)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.extraCharge}
                            onChange={(e) => updateSizeVariant(variant.sizeId, 'extraCharge', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Скидка (%)
                          </label>
                          <select
                            value={variant.discountPercent}
                            onChange={(e) => updateSizeVariant(variant.sizeId, 'discountPercent', e.target.value)}
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="0">Без скидки</option>
                            <option value="5">5%</option>
                            <option value="10">10%</option>
                            <option value="15">15%</option>
                            <option value="20">20%</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Состав букета - Цветы */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Базовый состав букета - Цветы</h2>
          <p className="text-sm text-gray-600">Укажите состав для базового размера. Количество цветов будет масштабироваться для каждого размера.</p>
          
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
                  <p className="text-lg font-bold text-[#02240D]">{itemPrice.toFixed(2)} лв</p>
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
                  <p className="text-lg font-bold text-[#02240D]">{itemPrice.toFixed(2)} лв</p>
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
            className="flex-1 bg-[#02240D] text-white py-3 rounded text-lg font-semibold hover:bg-[#02240D]/90 disabled:opacity-50"
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

