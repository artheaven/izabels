'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressResult {
  properties: {
    name: string;
    street?: string;
    housenumber?: string;
    city?: string;
    postcode?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  city?: string;
  disabled?: boolean;
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Начнете да пишете адрес...',
  required = false,
  city = 'Varna',
  disabled = false,
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Закрытие при клике вне компонента
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Поиск адресов через Nominatim API
  const searchAddress = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    try {
      // Nominatim API с поиском по Варне
      const params = new URLSearchParams({
        q: `${query}, Varna, Bulgaria`,
        format: 'json',
        addressdetails: '1',
        limit: '10',
        countrycodes: 'bg',
        'accept-language': 'bg',
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          headers: {
            'User-Agent': 'IzabelsFlowerShop/1.0',
          },
        }
      );
      
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      
      console.log('Nominatim results:', data); // Для отладки
      
      // Преобразуем результаты Nominatim в формат AddressResult
      const formattedResults: AddressResult[] = data
        .filter((item: any) => {
          // Фильтруем только адреса Варны (включая дома)
          const isVarna = item.address?.city === 'Varna' || 
                         item.address?.city === 'Варна' ||
                         item.address?.town === 'Varna' ||
                         item.display_name?.includes('Varna');
          return isVarna;
        })
        .map((item: any) => ({
          properties: {
            name: item.address?.road || item.display_name?.split(',')[0] || '',
            street: item.address?.road || '',
            housenumber: item.address?.house_number || '',
            city: item.address?.city || item.address?.town || 'Varna',
            postcode: item.address?.postcode || '',
          },
          geometry: {
            coordinates: [parseFloat(item.lon), parseFloat(item.lat)],
          },
        }));

      console.log('Filtered results:', formattedResults); // Для отладки
      
      setSuggestions(formattedResults);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Address search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Дебаунсинг для оптимизации запросов
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);

    // Очищаем предыдущий таймер
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Устанавливаем новый таймер (800мс задержка для соблюдения лимитов Nominatim)
    debounceTimer.current = setTimeout(() => {
      searchAddress(newValue);
    }, 800);
  };

  // Выбор адреса из списка
  const selectAddress = (result: AddressResult) => {
    const { street, housenumber, name } = result.properties;
    
    // Формируем красивый адрес
    let fullAddress = '';
    if (street) {
      fullAddress = street;
      if (housenumber) {
        fullAddress += ` ${housenumber}`;
      }
    } else if (name) {
      fullAddress = name;
    }

    onChange(fullAddress);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Навигация клавиатурой
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          selectAddress(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full border rounded px-3 py-2 pr-10 ${
            required && value && !/\d/.test(value) 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary focus:ring-primary'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Выпадающий список подсказок */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((result, index) => {
            const { street, housenumber, name, postcode } = result.properties;
            
            let displayAddress = '';
            let displayDetails = '';
            
            if (street) {
              displayAddress = street;
              if (housenumber) displayAddress += ` ${housenumber}`;
              if (postcode) displayDetails = `Пощенски код: ${postcode}`;
            } else if (name) {
              displayAddress = name;
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => selectAddress(result)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition border-b last:border-b-0 ${
                  selectedIndex === index ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {displayAddress}
                    </p>
                    {displayDetails && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {displayDetails}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Сообщение, если ничего не найдено */}
      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
          Няма намерени адреси. Въведете адреса ръчно.
        </div>
      )}
    </div>
  );
}
