'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit2, Eye, EyeOff, Trash2, Settings } from 'lucide-react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';

export default function ProductsPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [mainBouquetsCategory, setMainBouquetsCategory] = useState<any>(null); // Главная категория "Букеты"
  const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
  const [bouquets, setBouquets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCategorySelector, setShowCategorySelector] = useState(false); // Модальное окно выбора категории

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, bouquetsRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getBouquets(),
      ]);

      // Находим главную категорию "Букеты" (без родителя)
      const mainCat = categoriesRes.data.categories.find((c: any) => 
        c.type === 'BOUQUETS' && c.parentId === null
      );
      setMainBouquetsCategory(mainCat);

      // Подкатегории букетов (для будущего использования)
      setCategories(categoriesRes.data.categories.filter((c: any) => 
        c.type === 'BOUQUETS' && c.parentId !== null
      ));
      
      setBouquets(bouquetsRes.data.bouquets);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (id: number, currentStatus: boolean) => {
    try {
      await adminApi.updateBouquet(id, { isActive: !currentStatus });
      loadData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Ошибка при изменении видимости');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот букет?')) return;

    try {
      await adminApi.deleteBouquet(id);
      loadData();
    } catch (error) {
      console.error('Error deleting bouquet:', error);
      alert('Ошибка при удалении');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Введите название подкатегории');
      return;
    }

    if (!mainBouquetsCategory) {
      alert('Главная категория "Букеты" не найдена');
      return;
    }

    try {
      const categoryData = {
        type: 'BOUQUETS',
        parentId: mainBouquetsCategory.id, // Привязываем к главной категории
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        translations: [
          { language: 'bg', name: newCategoryName },
          { language: 'ru', name: newCategoryName },
        ],
      };

      await adminApi.createCategory(categoryData);
      setNewCategoryName('');
      setShowCategoryForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating category:', error);
      alert(error.response?.data?.error || 'Ошибка при создании подкатегории');
    }
  };

  // Фильтруем букеты по активной подкатегории
  const filteredBouquets = activeCategory === 'all'
    ? bouquets
    : bouquets.filter(b => b.categoryId === activeCategory);

  if (loading) {
    return <div>Зареждане...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Товары</h1>
        <button
          onClick={() => setShowCategorySelector(true)}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить товар</span>
        </button>
      </div>

      {/* Модальное окно выбора категории */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Выберите тип товара</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowCategorySelector(false);
                  router.push('/admin/bouquets/new');
                }}
                className="w-full bg-pink-50 hover:bg-pink-100 text-pink-900 px-6 py-4 rounded-lg transition text-left flex items-center space-x-3"
              >
                <span className="text-2xl">💐</span>
                <div>
                  <div className="font-bold">Букет</div>
                  <div className="text-sm text-gray-600">Готовый букет для продажи</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowCategorySelector(false);
                  router.push('/admin/flowers/new');
                }}
                className="w-full bg-green-50 hover:bg-green-100 text-green-900 px-6 py-4 rounded-lg transition text-left flex items-center space-x-3"
              >
                <span className="text-2xl">🌹</span>
                <div>
                  <div className="font-bold">Цветок</div>
                  <div className="text-sm text-gray-600">Отдельный цветок для инвентаря</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowCategorySelector(false);
                  router.push('/admin/packaging/new');
                }}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-900 px-6 py-4 rounded-lg transition text-left flex items-center space-x-3"
              >
                <span className="text-2xl">📦</span>
                <div>
                  <div className="font-bold">Упаковка</div>
                  <div className="text-sm text-gray-600">Материал для упаковки букетов</div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowCategorySelector(false)}
              className="w-full mt-4 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Подкатегории букетов */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button
            className="px-6 py-2 rounded-lg font-medium bg-primary text-white"
          >
            Все ({bouquets.length})
          </button>
          
          {categories.map((cat) => {
            const count = bouquets.filter(b => b.categoryId === cat.id).length;
            const bgTranslation = cat.translations.find((t: any) => t.lang === 'bg');
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {bgTranslation?.name || cat.translations[0]?.name || cat.slug} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Таблица букетов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Снимка</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Цена</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Видимость</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBouquets.map((bouquet) => {
              const translation = bouquet.translations[0];
              const category = categories.find(c => c.id === bouquet.categoryId);
              return (
                <tr key={bouquet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {bouquet.images?.[0] ? (
                      <Image
                        src={getImageUrl(bouquet.images[0].url)}
                        alt={translation?.name || bouquet.sku}
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
                  <td className="px-6 py-4">
                    <div className="font-medium">{translation?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{bouquet.sku}</td>
                  <td className="px-6 py-4 text-sm">
                    {category?.translations.find((t: any) => t.lang === 'bg')?.name || category?.translations[0]?.name || '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold">{formatPrice(bouquet.price)}</td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleVisibility(bouquet.id, bouquet.isActive)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                        bouquet.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {bouquet.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span>{bouquet.isActive ? 'Виден' : 'Скрыт'}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/admin/bouquets/${bouquet.id}/edit`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(bouquet.id)}
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

        {filteredBouquets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Нет букетов в этой категории
          </div>
        )}
      </div>
    </div>
  );
}

