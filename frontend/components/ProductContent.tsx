'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import { formatPrice, formatPriceEUR } from '@/lib/utils';
import { useCartStore } from '@/lib/cart-store';
import { Minus, Plus, ShoppingCart, X, ChevronLeft, ChevronRight, Truck } from 'lucide-react';

interface Product {
  id: number;
  sku: string;
  price: number;
  priceOld: number | null;
  discountPercent: number;
  size: string | null;
  images: string[];
}

interface Translation {
  name: string;
  description: string | null;
}

interface Props {
  product: Product;
  translation: Translation;
}

export default function ProductContent({ product, translation }: Props) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [packagingColor, setPackagingColor] = useState('червен');
  const [addCard, setAddCard] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [deliveryText, setDeliveryText] = useState('');

  const addItem = useCartStore((state) => state.addItem);

  const hasDiscount = product.discountPercent > 0;

  // Проверяем время для отображения доступности доставки
  useEffect(() => {
    const checkDeliveryTime = () => {
      const now = new Date();
      // Получаем текущий час в болгарском часовом поясе (Europe/Sofia)
      const bulgarianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Sofia' }));
      const currentHour = bulgarianTime.getHours();

      if (currentHour < 15) {
        setDeliveryText('Наличен за доставка днес');
      } else {
        setDeliveryText('Наличен за доставка утре');
      }
    };

    checkDeliveryTime();
    // Обновляем каждую минуту на случай, если пользователь держит страницу открытой
    const interval = setInterval(checkDeliveryTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = () => {
    addItem({
      sku: product.sku,
      name: translation.name,
      price: parseFloat(product.price.toString()),
      quantity,
      image: product.images[0],
      options: {
        size: product.size || undefined,
        packagingColor,
        addCard,
      },
    });
    alert('Продуктът е добавен в количката!');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Галерея изображений */}
      <div className="sticky top-16 h-[calc(100vh-5rem)] flex flex-col">
        {/* Основное фото */}
        <div
          className="relative w-full bg-gray-100 rounded-lg overflow-hidden mb-4 cursor-zoom-in"
          style={{ height: product.images.length > 1 ? 'calc(100% - 6.5rem)' : '100%' }}
          onClick={() => setShowLightbox(true)}
        >
          {product.images[selectedImage] ? (
            <Image
              src={getImageUrl(product.images[selectedImage])}
              alt={translation.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Няма снимка
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded text-lg font-bold">
              -{product.discountPercent}%
            </div>
          )}
        </div>

        {/* Миниатюры */}
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 h-24 flex-shrink-0">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-full h-full rounded overflow-hidden border-2 ${
                  selectedImage === index ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <Image
                  src={getImageUrl(image)}
                  alt={`${translation.name} - ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Lightbox */}
        {showLightbox && (
          <div
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/95 z-[9999] flex items-center justify-center"
            onClick={() => setShowLightbox(false)}
          >
            {/* Кнопка закрытия */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLightbox(false);
              }}
              className="absolute top-4 right-4 z-[10000] p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              aria-label="Закрыть"
            >
              <X className="w-8 h-8 text-white" />
            </button>

            {/* Стрелка влево */}
            {product.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
                }}
                className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                aria-label="Предыдущее изображение"
              >
                <ChevronLeft className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Контейнер изображения */}
            <div
              className="relative w-full h-full flex items-center justify-center px-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={getImageUrl(product.images[selectedImage])}
                  alt={translation.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>

            {/* Стрелка вправо */}
            {product.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
                aria-label="Следующее изображение"
              >
                <ChevronRight className="w-8 h-8 text-white" />
              </button>
            )}

            {/* Индикатор текущего изображения */}
            {product.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">
                  {selectedImage + 1} / {product.images.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Информация о товаре */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{translation.name}</h1>
        <p className="text-gray-500 mb-4">Артикул: {product.sku}</p>

        {/* Плашка доставки */}
        {deliveryText && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center space-x-3">
            <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">{deliveryText}</span>
          </div>
        )}

        {/* Цена */}
        <div className="mb-8">
          {hasDiscount && product.priceOld && (
            <div className="mb-2">
              <p className="text-gray-400 line-through text-xl">
                {formatPrice(product.priceOld)}
              </p>
              <p className="text-gray-400 line-through text-sm">
                {formatPriceEUR(product.priceOld)}
              </p>
            </div>
          )}
          <div>
            <p className="text-primary text-4xl font-bold">
              {formatPrice(product.price)}
            </p>
            <p className="text-primary/70 text-lg mt-1">
              {formatPriceEUR(product.price)}
            </p>
          </div>
        </div>

        {/* Размер */}
        {product.size && (
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Размер:</label>
            <div className="inline-block px-4 py-2 bg-gray-100 rounded">
              {product.size}
            </div>
          </div>
        )}

        {/* Цвет упаковки */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Цвят на опаковката:
          </label>
          <select
            value={packagingColor}
            onChange={(e) => setPackagingColor(e.target.value)}
            className="w-full border rounded px-4 py-2"
          >
            <option value="червен">Червен</option>
            <option value="бял">Бял</option>
            <option value="естествен">Естествен (крафт)</option>
            <option value="прозрачен">Прозрачен</option>
          </select>
        </div>

        {/* Добавить открытку */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={addCard}
              onChange={(e) => setAddCard(e.target.checked)}
              className="rounded"
            />
            <span>Добави картичка (+5 лв)</span>
          </label>
        </div>

        {/* Количество */}
        <div className="mb-8">
          <label className="block text-sm font-semibold mb-2">Количество:</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Minus className="w-5 h-5" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-20 text-center border rounded px-3 py-2"
              min="1"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 border rounded hover:bg-gray-100"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Кнопка добавить в корзину */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-primary text-white py-4 rounded-lg font-bold text-lg hover:bg-primary/90 transition flex items-center justify-center space-x-2"
        >
          <ShoppingCart className="w-6 h-6" />
          <span>Добави в количка</span>
        </button>

        {/* Описание */}
        {translation.description && (
          <div className="mt-8 pt-8 border-t">
            <h2 className="font-bold text-xl mb-4">Описание</h2>
            <div className="text-gray-700 whitespace-pre-line">
              {translation.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

