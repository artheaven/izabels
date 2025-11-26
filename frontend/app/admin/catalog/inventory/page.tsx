'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';

type TabType = 'flowers' | 'packaging';

export default function InventoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('flowers');
  
  // Flowers state
  const [flowerCategories, setFlowerCategories] = useState<any[]>([]);
  const [mainFlowerCategory, setMainFlowerCategory] = useState<any>(null);
  const [flowers, setFlowers] = useState<any[]>([]);
  const [activeFlowerCategory, setActiveFlowerCategory] = useState<number | 'all'>('all');
  const [showFlowerCategoryForm, setShowFlowerCategoryForm] = useState(false);
  const [newFlowerCategoryName, setNewFlowerCategoryName] = useState('');
  
  // Packaging state
  const [packagingTypes, setPackagingTypes] = useState<any[]>([]);
  const [mainPackagingCategory, setMainPackagingCategory] = useState<any>(null);
  const [packaging, setPackaging] = useState<any[]>([]);
  const [activePackagingType, setActivePackagingType] = useState<number | 'all'>('all');
  const [showPackagingTypeForm, setShowPackagingTypeForm] = useState(false);
  const [newPackagingTypeName, setNewPackagingTypeName] = useState('');
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, flowersRes, packagingRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getFlowers(),
        adminApi.getPackaging(),
      ]);

      // Главная категория "Цветы" (без родителя)
      const mainFlower = categoriesRes.data.categories.find((c: any) => 
        c.type === 'FLOWERS' && c.parentId === null
      );
      setMainFlowerCategory(mainFlower);

      // Подкатегории цветов
      setFlowerCategories(categoriesRes.data.categories.filter((c: any) => 
        c.type === 'FLOWERS' && c.parentId !== null
      ));
      setFlowers(flowersRes.data.flowers);
      
      // Главная категория "Упаковка" (без родителя)
      const mainPack = categoriesRes.data.categories.find((c: any) => 
        c.type === 'PACKAGING' && c.parentId === null
      );
      setMainPackagingCategory(mainPack);

      // Подкатегории упаковки
      setPackagingTypes(categoriesRes.data.categories.filter((c: any) => 
        c.type === 'PACKAGING' && c.parentId !== null
      ));
      setPackaging(packagingRes.data.packaging);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlower = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот цветок?')) return;

    try {
      await adminApi.deleteFlower(id);
      loadData();
    } catch (error) {
      console.error('Error deleting flower:', error);
      alert('Ошибка при удалении');
    }
  };

  const handleDeletePackaging = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту упаковку?')) return;

    try {
      await adminApi.deletePackaging(id);
      loadData();
    } catch (error) {
      console.error('Error deleting packaging:', error);
      alert('Ошибка при удалении');
    }
  };

  const handleAddFlowerCategory = async () => {
    if (!newFlowerCategoryName.trim()) {
      alert('Введите название подкатегории');
      return;
    }

    if (!mainFlowerCategory) {
      alert('Главная категория "Цветы" не найдена');
      return;
    }

    try {
      const categoryData = {
        type: 'FLOWERS',
        parentId: mainFlowerCategory.id,
        slug: newFlowerCategoryName.toLowerCase().replace(/\s+/g, '-'),
        translations: [
          { language: 'bg', name: newFlowerCategoryName },
          { language: 'ru', name: newFlowerCategoryName },
        ],
      };

      await adminApi.createCategory(categoryData);
      setNewFlowerCategoryName('');
      setShowFlowerCategoryForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating flower category:', error);
      alert(error.response?.data?.error || 'Ошибка при создании подкатегории');
    }
  };

  const handleAddPackagingType = async () => {
    if (!newPackagingTypeName.trim()) {
      alert('Введите название подкатегории');
      return;
    }

    if (!mainPackagingCategory) {
      alert('Главная категория "Упаковка" не найдена');
      return;
    }

    try {
      const categoryData = {
        type: 'PACKAGING',
        parentId: mainPackagingCategory.id,
        slug: newPackagingTypeName.toLowerCase().replace(/\s+/g, '-'),
        translations: [
          { language: 'bg', name: newPackagingTypeName },
          { language: 'ru', name: newPackagingTypeName },
        ],
      };

      await adminApi.createCategory(categoryData);
      setNewPackagingTypeName('');
      setShowPackagingTypeForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating packaging type:', error);
      alert(error.response?.data?.error || 'Ошибка при создании подкатегории');
    }
  };

  const filteredFlowers = activeFlowerCategory === 'all'
    ? flowers
    : flowers.filter(f => f.categoryId === activeFlowerCategory);

  const filteredPackaging = activePackagingType === 'all'
    ? packaging
    : packaging.filter(p => p.typeId === activePackagingType);

  if (loading) {
    return <div>Зареждане...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Инвентарь</h1>

      {/* Основные табы */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('flowers')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'flowers'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Цветы ({flowers.length})
        </button>
        <button
          onClick={() => setActiveTab('packaging')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            activeTab === 'packaging'
              ? 'bg-primary text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Упаковка ({packaging.length})
        </button>
      </div>

      {/* Flowers Tab */}
      {activeTab === 'flowers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveFlowerCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activeFlowerCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Все ({flowers.length})
              </button>
              
              {flowerCategories.map((cat) => {
                const count = flowers.filter(f => f.categoryId === cat.id).length;
                const bgTranslation = cat.translations.find((t: any) => t.lang === 'bg');
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFlowerCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                      activeFlowerCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {bgTranslation?.name || cat.translations[0]?.name || cat.slug} ({count})
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => router.push('/admin/flowers/new')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добавить</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Снимка</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFlowers.map((flower) => {
                  const translation = flower.translations[0];
                  const category = flowerCategories.find(c => c.id === flower.categoryId);
                  return (
                    <tr key={flower.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {flower.images?.[0] ? (
                          <Image
                            src={getImageUrl(flower.images[0].url)}
                            alt={translation?.name || flower.sku}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Без снимка</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{translation?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{flower.sku}</td>
                      <td className="px-6 py-4 text-sm">
                        {category?.translations.find((t: any) => t.lang === 'bg')?.name || category?.translations[0]?.name || '-'}
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatPrice(flower.price)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/flowers/${flower.id}/edit`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFlower(flower.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredFlowers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Нет цветов в этой категории
              </div>
            )}
          </div>
        </div>
      )}

      {/* Packaging Tab */}
      {activeTab === 'packaging' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActivePackagingType('all')}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activePackagingType === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                Все ({packaging.length})
              </button>
              
              {packagingTypes.map((type) => {
                const count = packaging.filter(p => p.typeId === type.id).length;
                const bgTranslation = type.translations.find((t: any) => t.lang === 'bg');
                return (
                  <button
                    key={type.id}
                    onClick={() => setActivePackagingType(type.id)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                      activePackagingType === type.id
                        ? 'bg-primary text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {bgTranslation?.name || type.translations[0]?.name || type.slug} ({count})
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => router.push('/admin/packaging/new')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Добавить</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Изображение</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPackaging.map((pack) => {
                  const translation = pack.translations[0];
                  const type = packagingTypes.find(t => t.id === pack.typeId);
                  return (
                    <tr key={pack.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {pack.images?.[0] ? (
                          <Image
                            src={getImageUrl(pack.images[0].url)}
                            alt={translation?.name || pack.sku}
                            width={60}
                            height={60}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-[60px] h-[60px] bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Без снимка</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">{translation?.name || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pack.sku}</td>
                      <td className="px-6 py-4 text-sm">
                        {type?.translations.find((t: any) => t.lang === 'bg')?.name || type?.translations[0]?.name || '-'}
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatPrice(pack.pricePerUnit)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => router.push(`/admin/packaging/${pack.id}/edit`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeletePackaging(pack.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredPackaging.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Нет упаковки этого типа
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

