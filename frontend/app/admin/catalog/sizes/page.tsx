'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';

export default function BouquetSizesPage() {
  const [sizes, setSizes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSize, setEditingSize] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    order: 0,
    translations: {
      bg: { name: '', description: '' },
      ru: { name: '', description: '' },
    },
  });

  useEffect(() => {
    loadSizes();
  }, []);

  const loadSizes = async () => {
    try {
      const response = await adminApi.getBouquetSizes();
      setSizes(response.data.sizes);
    } catch (error) {
      console.error('Error loading sizes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const translations = [
        { lang: 'bg', name: formData.translations.bg.name, description: formData.translations.bg.description },
        { lang: 'ru', name: formData.translations.ru.name, description: formData.translations.ru.description },
      ];

      await adminApi.createBouquetSize({
        name: formData.name,
        order: formData.order,
        translations,
      });

      resetForm();
      loadSizes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при создании размера');
    }
  };

  const handleUpdate = async (id: number) => {
    try {
      const size = sizes.find(s => s.id === id);
      const translations = [
        { lang: 'bg', name: formData.translations.bg.name, description: formData.translations.bg.description },
        { lang: 'ru', name: formData.translations.ru.name, description: formData.translations.ru.description },
      ];

      await adminApi.updateBouquetSize(id, {
        name: formData.name,
        order: formData.order,
        translations,
      });

      setEditingSize(null);
      resetForm();
      loadSizes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при обновлении размера');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот размер?')) return;

    try {
      await adminApi.deleteBouquetSize(id);
      loadSizes();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при удалении размера');
    }
  };

  const startEdit = (size: any) => {
    setEditingSize(size);
    setShowForm(true);
    const bgTranslation = size.translations.find((t: any) => t.lang === 'bg') || {};
    const ruTranslation = size.translations.find((t: any) => t.lang === 'ru') || {};
    setFormData({
      name: size.name,
      order: size.order,
      translations: {
        bg: { name: bgTranslation.name || '', description: bgTranslation.description || '' },
        ru: { name: ruTranslation.name || '', description: ruTranslation.description || '' },
      },
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingSize(null);
    setFormData({
      name: '',
      order: 0,
      translations: {
        bg: { name: '', description: '' },
        ru: { name: '', description: '' },
      },
    });
  };

  if (loading) {
    return <div>Зареждане...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Размеры букетов</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#02240D] text-white px-6 py-2 rounded-lg hover:bg-[#02240D]/90 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить размер</span>
        </button>
      </div>

      {/* Форма создания/редактирования */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingSize ? 'Редактировать размер' : 'Новый размер'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Код размера (S, M, L, XL)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Например: S"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Порядок сортировки</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Болгарский (BG)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название</label>
                <input
                  type="text"
                  value={formData.translations.bg.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        bg: { ...formData.translations.bg, name: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Например: Малък"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <input
                  type="text"
                  value={formData.translations.bg.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        bg: { ...formData.translations.bg, description: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Русский (RU)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Название</label>
                <input
                  type="text"
                  value={formData.translations.ru.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        ru: { ...formData.translations.ru, name: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Например: Маленький"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Описание</label>
                <input
                  type="text"
                  value={formData.translations.ru.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      translations: {
                        ...formData.translations,
                        ru: { ...formData.translations.ru, description: e.target.value },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => (editingSize ? handleUpdate(editingSize.id) : handleCreate())}
              className="bg-[#02240D] text-white px-6 py-2 rounded-lg hover:bg-[#02240D]/90"
            >
              {editingSize ? 'Сохранить' : 'Создать'}
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* Список размеров */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Код</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название (BG)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название (RU)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Порядок</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sizes.map((size) => {
              const bgTranslation = size.translations.find((t: any) => t.lang === 'bg');
              const ruTranslation = size.translations.find((t: any) => t.lang === 'ru');
              return (
                <tr key={size.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold">{size.name}</td>
                  <td className="px-6 py-4">{bgTranslation?.name || '-'}</td>
                  <td className="px-6 py-4">{ruTranslation?.name || '-'}</td>
                  <td className="px-6 py-4">{size.order}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(size)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(size.id)}
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

        {sizes.length === 0 && (
          <div className="text-center py-12 text-gray-500">Размеры не найдены</div>
        )}
      </div>
    </div>
  );
}

