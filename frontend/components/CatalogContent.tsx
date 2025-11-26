'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import { formatPrice, formatPriceEUR } from '@/lib/utils';

interface Product {
  id: number;
  sku: string;
  price: number;
  priceOld: number | null;
  discountPercent: number;
  size: string | null;
  images: string[];
  translations: Array<{
    name: string;
    description: string | null;
  }>;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  translations: Array<{
    name: string;
  }>;
  children: Array<{
    id: number;
    name: string;
    slug: string;
    translations: Array<{
      name: string;
    }>;
  }>;
}

interface Props {
  initialCategories: Category[];
  initialProducts: Product[];
  featuredProducts?: any[];
}

export default function CatalogContent({ initialCategories, initialProducts, featuredProducts = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<string>('');
  const [priceMax, setPriceMax] = useState<string>('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Фильтрация товаров
  const filteredProducts = useMemo(() => {
    let filtered = [...initialProducts];

    // Фильтр по цене
    if (priceMin) {
      filtered = filtered.filter(p => parseFloat(p.price.toString()) >= parseFloat(priceMin));
    }
    if (priceMax) {
      filtered = filtered.filter(p => parseFloat(p.price.toString()) <= parseFloat(priceMax));
    }

    // Фильтр по размеру
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => p.size && selectedSizes.includes(p.size));
    }

    // Сортировка
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => parseFloat(a.price.toString()) - parseFloat(b.price.toString()));
        break;
      case 'price_desc':
        filtered.sort((a, b) => parseFloat(b.price.toString()) - parseFloat(a.price.toString()));
        break;
      case 'discount':
        filtered.sort((a, b) => b.discountPercent - a.discountPercent);
        break;
    }

    return filtered;
  }, [initialProducts, priceMin, priceMax, selectedSizes, sortBy]);

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar с фильтрами */}
      <aside className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="font-bold text-lg mb-4">Категории</h2>
          <div className="space-y-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                !selectedCategory ? 'bg-primary/10 text-primary font-semibold' : ''
              }`}
            >
              Всички
            </button>
            {initialCategories.map(category => (
              <div key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`block w-full text-left px-3 py-2 rounded hover:bg-gray-100 ${
                    selectedCategory === category.slug ? 'bg-primary/10 text-primary font-semibold' : ''
                  }`}
                >
                  {category.translations[0]?.name || category.name}
                </button>
              </div>
            ))}
          </div>

          <h3 className="font-bold mb-3">Цена</h3>
          <div className="space-y-2 mb-6">
            <input
              type="number"
              placeholder="От"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="До"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <h3 className="font-bold mb-3">Размер</h3>
          <div className="space-y-2">
            {['S', 'M', 'L', 'XL'].map(size => (
              <label key={size} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="rounded"
                />
                <span>{size}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* Основная область с товарами */}
      <div className="lg:col-span-3">
        {/* Сортировка */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Намерени: {filteredProducts.length} продукта
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded px-4 py-2"
          >
            <option value="newest">Най-нови</option>
            <option value="price_asc">Цена: възходящ</option>
            <option value="price_desc">Цена: низходящ</option>
            <option value="discount">Първо със скидка</option>
          </select>
        </div>

        {/* Популярные букеты */}
        {featuredProducts.length > 0 && (
          <div className="mb-8 bg-yellow-50 rounded-lg p-6 border border-yellow-200">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">⭐</span>
              <h2 className="text-xl font-bold">Най-популярни букети</h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {featuredProducts.map((product: any) => {
                const translation = product.translations[0];
                
                return (
                  <Link
                    key={product.id}
                    href={`/produkti/${product.sku}`}
                    className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition relative"
                  >
                    <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-[10px] font-bold z-10">
                      Популярен
                    </div>
                    <div className="relative aspect-square bg-gray-100">
                      {product.images[0] ? (
                        <Image
                          src={getImageUrl(product.images[0])}
                          alt={translation?.name || product.sku}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">
                          Няма снимка
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-xs mb-1 line-clamp-1">
                        {translation?.name || product.sku}
                      </h3>
                      <div>
                        <span className="text-primary font-bold text-xs block">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-primary/70 text-[10px] block">
                          {formatPriceEUR(product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Сетка товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => {
            const translation = product.translations[0];
            const hasDiscount = product.discountPercent > 0;

            return (
              <Link
                key={product.id}
                href={`/produkti/${product.sku}`}
                className="group bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="relative aspect-square bg-gray-100">
                  {product.images[0] ? (
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={translation?.name || product.sku}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      Няма снимка
                    </div>
                  )}
                  {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      -{product.discountPercent}%
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {translation?.name || product.sku}
                  </h3>
                  <div>
                    {hasDiscount && product.priceOld && (
                      <div className="mb-1">
                        <span className="text-gray-400 line-through text-sm block">
                          {formatPrice(product.priceOld)}
                        </span>
                        <span className="text-gray-400 line-through text-xs block">
                          {formatPriceEUR(product.priceOld)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-primary font-bold text-xl block">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-primary/70 text-sm block">
                        {formatPriceEUR(product.price)}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Няма намерени продукти с избраните филтри
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

