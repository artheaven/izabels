'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  parentId: number | null;
  isEditable: boolean;
  translations: Array<{
    lang: string;
    name: string;
  }>;
}

interface CustomCategorySelectProps {
  value: number | null;
  onChange: (categoryId: number) => void;
  categoryType: 'FLOWERS' | 'PACKAGING' | 'BOUQUETS';
  label?: string;
  required?: boolean;
}

export default function CustomCategorySelect({
  value,
  onChange,
  categoryType,
  label = 'Категория',
  required = true,
}: CustomCategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategoryId, setMainCategoryId] = useState<number | null>(null); // ID главной категории
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      
      // Находим главную категорию (без parentId)
      const mainCat = response.data.categories.find(
        (cat: any) => cat.type === categoryType && cat.parentId === null
      );
      if (mainCat) {
        setMainCategoryId(mainCat.id);
      }
      
      // Загружаем только подкатегории (те, у которых есть parentId)
      const filtered = response.data.categories.filter(
        (cat: Category) => cat.type === categoryType && cat.parentId != null
      );
      setCategories(filtered);
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!formName.trim()) return;

    try {
      await adminApi.createCategory({
        slug: formName.toLowerCase().replace(/\s+/g, '-'),
        type: categoryType,
        parentId: mainCategoryId, // Привязываем к главной категории
        isEditable: true,
        translations: [
          { language: 'bg', name: formName },
          { language: 'ru', name: formName }, // Используем то же имя для русского
        ],
      });
      setFormName('');
      setShowAddForm(false);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при создании подкатегории');
    }
  };

  const handleUpdate = async (id: number) => {
    if (!formName.trim()) return;

    try {
      await adminApi.updateCategory(id, { 
        name: formName,
        translations: [
          { language: 'bg', name: formName },
          { language: 'ru', name: formName },
        ],
      });
      setFormName('');
      setEditingId(null);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при обновлении категории');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить категорию?')) return;

    try {
      await adminApi.deleteCategory(id);
      loadCategories();
      if (value === id) {
        onChange(0);
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Ошибка при удалении категории');
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    const bgTranslation = category.translations.find(t => t.lang === 'bg');
    setFormName(bgTranslation?.name || category.name);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormName('');
  };

  const selectedCategory = categories.find((cat) => cat.id === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>

      {/* Кнопка выбора */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center hover:border-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
      >
        <span className={!selectedCategory ? 'text-gray-400' : ''}>
          {selectedCategory 
            ? (selectedCategory.translations.find(t => t.lang === 'bg')?.name || selectedCategory.name)
            : 'Изберете категория'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {/* Список категорий */}
          <div className="p-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`flex items-center justify-between p-2 rounded hover:bg-gray-100 ${
                  value === category.id ? 'bg-pink-50' : ''
                }`}
              >
                {editingId === category.id ? (
                  <>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded mr-2"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdate(category.id);
                        }
                      }}
                    />
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => handleUpdate(category.id)}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(category.id);
                        setShowDropdown(false);
                      }}
                      className="flex-1 text-left"
                    >
                      {category.translations.find(t => t.lang === 'bg')?.name || category.name}
                    </button>
                    {category.isEditable && (
                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Форма добавления */}
          <div className="border-t p-2">
            {showAddForm ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Название категории"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAdd();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormName('');
                  }}
                  className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-pink-600 hover:bg-pink-50 rounded"
              >
                <Plus className="w-4 h-4" />
                <span>Добавить категорию</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
