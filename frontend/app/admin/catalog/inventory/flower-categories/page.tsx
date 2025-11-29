'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export default function FlowerCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name_bg: '',
    name_ru: '',
    slug: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data.categories.filter((c: any) => c.type === 'FLOWER'));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const categoryData = {
        type: 'FLOWER',
        slug: formData.slug || formData.name_bg.toLowerCase().replace(/\s+/g, '-'),
        translations: [
          { language: 'bg', name: formData.name_bg },
          { language: 'ru', name: formData.name_ru || formData.name_bg },
        ],
      };

      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, categoryData);
      } else {
        await adminApi.createCategory(categoryData);
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name_bg: '', name_ru: '', slug: '' });
      loadCategories();
    } catch (error: any) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.error || 'Ошибка при сохранении категории');
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name_bg: category.translations.find((t: any) => t.language === 'bg')?.name || '',
      name_ru: category.translations.find((t: any) => t.language === 'ru')?.name || '',
      slug: category.slug,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете тази категория?')) return;

    try {
      await adminApi.deleteCategory(id);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({ name_bg: '', name_ru: '', slug: '' });
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={() => router.push('/admin/catalog/inventory')}
            className="text-primary hover:underline mb-2"
          >
            ← Назад към инвентара
          </button>
          <h1 className="text-3xl font-bold">Категории цветов</h1>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#02240D] text-white px-6 py-2 rounded-lg hover:bg-[#02240D]/90 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Новая категория</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCategory ? 'Редактирование категории' : 'Новая категория'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Име (BG) *</label>
              <input
                type="text"
                value={formData.name_bg}
                onChange={(e) => setFormData({ ...formData, name_bg: e.target.value })}
                required
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Име (RU)</label>
              <input
                type="text"
                value={formData.name_ru}
                onChange={(e) => setFormData({ ...formData, name_ru: e.target.value })}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="Автоматично от името"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-[#02240D] text-white px-6 py-2 rounded hover:bg-[#02240D]/90"
              >
                {editingCategory ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Име (BG)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Име (RU)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => {
              const nameBg = category.translations.find((t: any) => t.language === 'bg')?.name || '-';
              const nameRu = category.translations.find((t: any) => t.language === 'ru')?.name || '-';
              return (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{nameBg}</td>
                  <td className="px-6 py-4">{nameRu}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{category.slug}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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

        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Няма категории все още
          </div>
        )}
      </div>
    </div>
  );
}
