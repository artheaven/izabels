'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Color {
  id: number;
  name: string;
  hexCode?: string;
  order: number;
}

export default function PackagingColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hexCode: '',
    order: 0,
  });

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      const response = await adminApi.getPackagingColors();
      setColors(response.data.colors);
    } catch (error) {
      console.error('Ошибка загрузки цветов:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingColor) {
        await adminApi.updatePackagingColor(editingColor.id, formData);
      } else {
        await adminApi.createPackagingColor(formData);
      }
      setShowForm(false);
      setEditingColor(null);
      setFormData({ name: '', hexCode: '', order: 0 });
      loadColors();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleEdit = (color: Color) => {
    setEditingColor(color);
    setFormData({
      name: color.name,
      hexCode: color.hexCode || '',
      order: color.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить цвет?')) return;

    try {
      await adminApi.deletePackagingColor(id);
      loadColors();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingColor(null);
    setFormData({ name: '', hexCode: '', order: 0 });
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Цвета упаковки</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
        >
          <Plus className="w-5 h-5" />
          <span>Добавить цвет</span>
        </button>
      </div>

      {/* Форма */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingColor ? 'Редактировать цвет' : 'Новый цвет'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HEX код цвета (опционально)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.hexCode}
                  onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                  placeholder="#FF5733"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                {formData.hexCode && (
                  <div
                    className="w-12 h-10 border border-gray-300 rounded-md"
                    style={{ backgroundColor: formData.hexCode }}
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Порядок сортировки
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
              >
                {editingColor ? 'Сохранить' : 'Создать'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список цветов */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Порядок
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Название
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Цвет
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {colors.map((color) => (
              <tr key={color.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{color.order}</td>
                <td className="px-6 py-4 font-medium">{color.name}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {color.hexCode && (
                      <div
                        className="w-8 h-8 border border-gray-300 rounded"
                        style={{ backgroundColor: color.hexCode }}
                      />
                    )}
                    {color.hexCode && (
                      <span className="text-sm text-gray-500">{color.hexCode}</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(color)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(color.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {colors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Цвета не найдены
          </div>
        )}
      </div>
    </div>
  );
}
