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
  extraCharge: string;
  discountPercent: string;
  flowers: FlowerItem[];
  materials: MaterialItem[];
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
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
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
          extraCharge: '0',
          discountPercent: '0',
          flowers: [],
          materials: [],
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
    setSizeVariants(prev => {
      const updated = prev.map(sv =>
        sv.sizeId === sizeId ? { ...sv, enabled: !sv.enabled } : sv
      );
      // Если включили размер и нет выбранного - выбираем его
      const variant = updated.find(sv => sv.sizeId === sizeId);
      if (variant?.enabled && !selectedSizeId) {
        setSelectedSizeId(sizeId);
      }
      // Если выключили выбранный размер - выбираем первый активный
      if (!variant?.enabled && selectedSizeId === sizeId) {
        const firstEnabled = updated.find(sv => sv.enabled);
        setSelectedSizeId(firstEnabled ? firstEnabled.sizeId : null);
      }
      return updated;
    });
  };

  const selectSize = (sizeId: number) => {
    const variant = sizeVariants.find(sv => sv.sizeId === sizeId);
    if (variant?.enabled) {
      setSelectedSizeId(sizeId);
    }
  };

  const updateSizeVariant = (sizeId: number, field: keyof SizeVariant, value: any) => {
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === sizeId ? { ...sv, [field]: value } : sv
      )
    );
  };

  // Расчет базовой цены для размера
  const calculateBasePriceForSize = (variant: SizeVariant): number => {
    let total = 0;

    variant.flowers.forEach(({ flowerId, quantity }) => {
      const flower = flowers.find(f => f.id === flowerId);
      if (flower) {
        total += parseFloat(flower.price) * quantity;
      }
    });

    variant.materials.forEach(({ packagingId, quantity }) => {
      const pack = packaging.find(p => p.id === packagingId);
      if (pack) {
        total += parseFloat(pack.pricePerUnit) * quantity;
      }
    });

    return total;
  };

  // Получаем текущий выбранный вариант размера
  const selectedVariant = sizeVariants.find(sv => sv.sizeId === selectedSizeId);
  const selectedFlowers = selectedVariant?.flowers || [];
  const selectedMaterials = selectedVariant?.materials || [];

  // Управление цветами для текущего размера
  const addFlower = () => {
    if (!selectedSizeId) return;
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === selectedSizeId
          ? { ...sv, flowers: [...sv.flowers, { flowerId: 0, quantity: 1 }] }
          : sv
      )
    );
  };

  const removeFlower = (index: number) => {
    if (!selectedSizeId) return;
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === selectedSizeId
          ? { ...sv, flowers: sv.flowers.filter((_, i) => i !== index) }
          : sv
      )
    );
  };

  const updateFlower = (index: number, field: keyof FlowerItem, value: any) => {
    if (!selectedSizeId) return;
    setSizeVariants(prev =>
      prev.map(sv => {
        if (sv.sizeId === selectedSizeId) {
          const updated = [...sv.flowers];
          updated[index] = { ...updated[index], [field]: value };
          return { ...sv, flowers: updated };
        }
        return sv;
      })
    );
  };

  // Управление упаковкой для текущего размера
  const addMaterial = () => {
    if (!selectedSizeId) return;
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === selectedSizeId
          ? { ...sv, materials: [...sv.materials, { packagingId: 0, quantity: 1 }] }
          : sv
      )
    );
  };

  const removeMaterial = (index: number) => {
    if (!selectedSizeId) return;
    setSizeVariants(prev =>
      prev.map(sv =>
        sv.sizeId === selectedSizeId
          ? { ...sv, materials: sv.materials.filter((_, i) => i !== index) }
          : sv
      )
    );
  };

  const updateMaterial = (index: number, field: keyof MaterialItem, value: any) => {
    if (!selectedSizeId) return;
    setSizeVariants(prev =>
      prev.map(sv => {
        if (sv.sizeId === selectedSizeId) {
          const updated = [...sv.materials];
          updated[index] = { ...updated[index], [field]: value };
          return { ...sv, materials: updated };
        }
        return sv;
      })
    );
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

    const enabledVariants = sizeVariants.filter(sv => sv.enabled);
    if (enabledVariants.length === 0) {
      alert('Выберите хотя бы один размер букета');
      return;
    }

    // Проверяем что у всех размеров есть состав
    for (const variant of enabledVariants) {
      if (variant.flowers.length === 0) {
        alert(`Добавьте цветы для размера ${variant.sizeLabel}`);
        return;
      }
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('categoryId', formData.categoryId);

      // Добавляем варианты размеров с составом
      const variantsData = enabledVariants.map(sv => ({
        sizeId: sv.sizeId,
        flowerCount: sv.flowers.reduce((sum, f) => sum + f.quantity, 0),
        extraCharge: parseFloat(sv.extraCharge) || 0,
        discountPercent: parseInt(sv.discountPercent) || 0,
        flowers: sv.flowers,
        materials: sv.materials,
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
          <p className="text-sm text-gray-600">Отметьте чекбоксами размеры, в которых будет доступен этот букет. Кликните на размер для редактирования состава.</p>
          
          {sizeVariants.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">⚠️ Размеры не загружены. Проверьте консоль браузера для ошибок.</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {sizeVariants.map((variant) => {
              const isSelected = selectedSizeId === variant.sizeId;
              const basePrice = calculateBasePriceForSize(variant);
              const extraCharge = parseFloat(variant.extraCharge) || 0;
              const priceBeforeDiscount = basePrice + extraCharge;
              const discountPercent = parseFloat(variant.discountPercent) || 0;
              const finalPrice = priceBeforeDiscount * (1 - discountPercent / 100);
              const flowerCount = variant.flowers.reduce((sum, f) => sum + f.quantity, 0);

              return (
                <div
                  key={variant.sizeId}
                  onClick={() => selectSize(variant.sizeId)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    !variant.enabled
                      ? 'opacity-40 cursor-not-allowed'
                      : isSelected
                      ? 'border-[#02240D] bg-green-50'
                      : 'border-gray-300 bg-white hover:border-[#02240D]'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={variant.enabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSizeVariant(variant.sizeId);
                      }}
                      className="mt-1 w-5 h-5"
                    />
                    
                    <div className="flex-1">
                      <div className="font-bold text-lg">
                        {variant.sizeName} - {variant.sizeLabel}
                      </div>
                      {variant.enabled && (
                        <>
                          <div className="text-sm text-gray-600 mt-1">
                            {flowerCount > 0 ? `${flowerCount} цветя` : 'Состав не задан'}
                          </div>
                          <div className="text-xl font-bold text-[#02240D] mt-2">
                            {finalPrice.toFixed(2)} лв
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {variant.enabled && isSelected && (
                    <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                      <div>
                        <label className="block text-xs font-semibold mb-1">База</label>
                        <input
                          type="text"
                          value={`${basePrice.toFixed(2)} лв`}
                          disabled
                          className="w-full border rounded px-2 py-1 bg-gray-100 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Наценка (лв)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.extraCharge}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateSizeVariant(variant.sizeId, 'extraCharge', e.target.value);
                          }}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Скидка (%)</label>
                        <select
                          value={variant.discountPercent}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateSizeVariant(variant.sizeId, 'discountPercent', e.target.value);
                          }}
                          className="w-full border rounded px-2 py-1 text-sm"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="10">10%</option>
                          <option value="15">15%</option>
                          <option value="20">20%</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Состав букета - Цветы */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-xl font-bold">
              Состав букета - {selectedVariant ? `${selectedVariant.sizeName} (${selectedVariant.sizeLabel})` : 'выберите размер'}
            </h2>
            {!selectedVariant && (
              <span className="text-sm text-red-600">← Выберите размер слева</span>
            )}
          </div>
          
          {!selectedVariant && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-800">Отметьте чекбоксом и выберите размер для редактирования состава</p>
            </div>
          )}

          {selectedVariant && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Цветы</h3>
          
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

              <button
                type="button"
                onClick={addFlower}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-5 h-5" />
                <span>Добавить цветок</span>
              </button>

              <h3 className="font-semibold text-lg pt-4">Упаковка</h3>
          
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
          )}
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


