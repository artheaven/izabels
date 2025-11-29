'use client';

import { useState, useEffect, useRef } from 'react';
import { adminApi } from '@/lib/api';
import { ChevronDown, Plus, Trash2, X } from 'lucide-react';

interface PackagingColor {
  id: number;
  name: string;
  hexCode?: string | null;
}

interface Props {
  value: number | null;
  onChange: (colorId: number | null) => void;
  label?: string;
  required?: boolean;
}

export default function CustomColorSelect({ value, onChange, label = 'Цвет', required = false }: Props) {
  const [colors, setColors] = useState<PackagingColor[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#FF0000');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadColors();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowAddForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadColors = async () => {
    try {
      const response = await adminApi.getPackagingColors();
      setColors(response.data.colors);
    } catch (error) {
      console.error('Ошибка загрузки цветов:', error);
    }
  };

  const handleAddColor = async () => {
    if (!newColorName.trim()) {
      alert('Введите название цвета');
      return;
    }

    try {
      await adminApi.createPackagingColor({
        name: newColorName.trim(),
        hexCode: newColorHex,
      });
      
      setNewColorName('');
      setNewColorHex('#FF0000');
      setShowAddForm(false);
      await loadColors();
    } catch (error) {
      console.error('Ошибка создания цвета:', error);
      alert('Ошибка при создании цвета');
    }
  };

  const handleDeleteColor = async (colorId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Удалить этот цвет?')) return;

    try {
      await adminApi.deletePackagingColor(colorId);
      if (value === colorId) {
        onChange(null);
      }
      await loadColors();
    } catch (error) {
      console.error('Ошибка удаления цвета:', error);
      alert('Ошибка при удалении цвета');
    }
  };

  const selectedColor = colors.find(c => c.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Кнопка выбора */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border rounded bg-white hover:bg-gray-50"
      >
        <div className="flex items-center space-x-2">
          {selectedColor ? (
            <>
              {selectedColor.hexCode && (
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: selectedColor.hexCode }}
                />
              )}
              <span>{selectedColor.name}</span>
            </>
          ) : (
            <span className="text-gray-400">Без цвета</span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {/* Опция "Без цвета" */}
          <div
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-500"
          >
            Без цвета
          </div>

          {/* Список цветов */}
          {colors.map((color) => (
            <div
              key={color.id}
              onClick={() => {
                onChange(color.id);
                setIsOpen(false);
              }}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between group ${
                value === color.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                {color.hexCode && (
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hexCode }}
                  />
                )}
                <span>{color.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => handleDeleteColor(color.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Форма добавления цвета */}
          {showAddForm ? (
            <div className="border-t p-4 bg-gray-50">
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    placeholder="Название цвета"
                    className="w-full px-3 py-2 border rounded text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-12 h-10 border rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    placeholder="#FF0000"
                    className="flex-1 px-3 py-2 border rounded text-sm font-mono"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="flex-1 px-3 py-2 bg-primary text-white rounded text-sm hover:bg-primary/90"
                  >
                    Создать
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewColorName('');
                      setNewColorHex('#FF0000');
                    }}
                    className="px-3 py-2 border rounded text-sm hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full px-4 py-2 border-t flex items-center space-x-2 text-primary hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить цвет</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
