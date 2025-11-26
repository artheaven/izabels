'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { getImageUrl, publicApi } from '@/lib/api';
import { formatPrice, formatPriceEUR } from '@/lib/utils';
import { Trash2, Plus, Minus, MapPin } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();

  // Предотвращаем ошибку гидратации
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Форма заказа
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    apartment: '',
    floor: '',
    comment: '',
  });
  
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'DELIVERY_BULGARIA' | 'PICKUP'>('DELIVERY');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank'>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoError('');
    try {
      const response = await publicApi.validatePromo(promoCode, getTotalPrice());
      if (response.data.valid) {
        setPromoDiscount(response.data.promo.discount);
      }
    } catch (error: any) {
      setPromoError(error.response?.data?.errors?.[0] || error.response?.data?.error || 'Невалиден промокод');
      setPromoDiscount(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Валидация адреса - проверка наличия номера дома
  const validateAddress = (address: string): boolean => {
    if (!address || address.trim().length === 0) {
      setAddressError('Моля, въведете адрес');
      return false;
    }
    
    // Проверяем наличие цифр (номер дома)
    const hasNumber = /\d+/.test(address);
    if (!hasNumber) {
      setAddressError('Моля, въведете номер на дома (например: ул. Симеон 25)');
      return false;
    }
    
    setAddressError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddressError('');
    
    // Валидация адреса для доставки
    if (deliveryType !== 'PICKUP') {
      if (!validateAddress(formData.deliveryAddress)) {
        setLoading(false);
        return;
      }
    }
    
    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price + (item.options?.addCard ? 5 : 0),
        options: item.options,
      }));

      // Формируем полный адрес
      let fullAddress = formData.deliveryAddress;
      if (deliveryType !== 'PICKUP' && (formData.apartment || formData.floor)) {
        const details = [];
        if (formData.apartment) details.push(`Апт. ${formData.apartment}`);
        if (formData.floor) details.push(`Ет. ${formData.floor}`);
        if (details.length > 0) {
          fullAddress += `, ${details.join(', ')}`;
        }
      }

      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: deliveryType === 'PICKUP' ? 'Самовземане - ул. Примерна 123, Варна' : fullAddress,
        deliveryType: deliveryType,
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        comment: formData.comment || undefined,
        paymentMethod: paymentMethod,
        items: orderItems,
        deliveryPrice: 0,
        promoCode: promoCode || undefined,
        promoDiscount: promoDiscount || 0,
      };

      const response = await publicApi.createOrder(orderData);

      if (response.data.success) {
        clearCart();
        router.push(`/porachka/uspeshna/${response.data.order.orderNumber}`);
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || 'Грешка при създаване на поръчката');
    } finally {
      setLoading(false);
    }
  };

  // Минимальная дата - завтра
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  // Показываем загрузку пока не смонтировался клиент
  // Показываем загрузку только если не смонтирован
  if (!mounted) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-600">Зареждане...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Количката е празна</h1>
            <p className="text-gray-600 mb-8">
              Добавете продукти в количката, за да продължите с поръчката
            </p>
            <Link
              href="/katalog"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Към каталога
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalPrice = getTotalPrice();
  const finalPrice = totalPrice - promoDiscount;

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Оформяне на поръчка</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Левая колонка - Форма */}
              <div className="lg:col-span-2 space-y-6">
                {/* Контактни данни */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="font-bold text-xl mb-4">Контактни данни</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                        Име и фамилия *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        id="customerPhone"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        required
                        placeholder="+359..."
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Доставка */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="font-bold text-xl mb-4">Доставка</h2>
                  
                  {/* Тип доставки - табы */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY')}
                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        deliveryType === 'DELIVERY'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Доставка във Варна
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY_BULGARIA')}
                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        deliveryType === 'DELIVERY_BULGARIA'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Доставка по цяла България
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('PICKUP')}
                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        deliveryType === 'PICKUP'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Самовземане във Варна
                    </button>
                  </div>

                  {/* Дата и време - сразу под табами */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="deliveryDate" className="block text-sm font-medium mb-1">
                        {deliveryType === 'PICKUP' ? 'Желана дата за самовземане *' : 'Желана дата за доставка *'}
                      </label>
                      <input
                        type="date"
                        id="deliveryDate"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        onClick={(e) => {
                          // Открываем календарь при клике на весь инпут
                          const input = e.currentTarget;
                          if (input.showPicker) {
                            try {
                              input.showPicker();
                            } catch (error) {
                              // Fallback для браузеров без showPicker
                              input.focus();
                            }
                          } else {
                            input.focus();
                          }
                        }}
                        required
                        min={minDateString}
                        className="w-full border rounded px-3 py-2 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="deliveryTime" className="block text-sm font-medium mb-1">
                        {deliveryType === 'PICKUP' ? 'Желано време за самовземане *' : 'Желано време за доставка *'}
                      </label>
                      <select
                        id="deliveryTime"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2 cursor-pointer"
                      >
                        <option value="">Изберете време</option>
                        <option value="09:00-12:00">09:00 - 12:00</option>
                        <option value="12:00-15:00">12:00 - 15:00</option>
                        <option value="15:00-18:00">15:00 - 18:00</option>
                        <option value="18:00-21:00">18:00 - 21:00</option>
                      </select>
                    </div>
                  </div>

                  {/* Адрес на доставка */}
                  {deliveryType === 'DELIVERY' || deliveryType === 'DELIVERY_BULGARIA' ? (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Адрес на доставка</h3>
                      
                      {/* Улица/Номер */}
                      <div className="mb-3">
                        <label htmlFor="deliveryAddress" className="block text-sm font-medium mb-1">
                          Улица и номер *
                        </label>
                        {deliveryType === 'DELIVERY' ? (
                          // Автозаполнение для доставки по Варне
                          <AddressAutocomplete
                            value={formData.deliveryAddress}
                            onChange={(value) => {
                              setFormData(prev => ({ ...prev, deliveryAddress: value }));
                              if (addressError) setAddressError(''); // Сбрасываем ошибку при вводе
                            }}
                            placeholder="Начнете да пишете улица и номер..."
                            required={true}
                            city="Varna"
                          />
                        ) : (
                          // Обычный input для доставки по всей Болгарии
                          <input
                            type="text"
                            id="deliveryAddress"
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={(e) => {
                              handleChange(e);
                              if (addressError) setAddressError(''); // Сбрасываем ошибку при вводе
                            }}
                            required={true}
                            placeholder="Град, Улица, Номер"
                            className={`w-full border rounded px-3 py-2 ${addressError ? 'border-red-500' : ''}`}
                          />
                        )}
                        {addressError && (
                          <p className="text-red-500 text-sm mt-1 flex items-center">
                            <span className="mr-1">⚠️</span> {addressError}
                          </p>
                        )}
                      </div>

                      {/* Апартамент и Етаж */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="apartment" className="block text-sm font-medium mb-1">
                            Апартамент
                          </label>
                          <input
                            type="text"
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleChange}
                            placeholder="Апт."
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label htmlFor="floor" className="block text-sm font-medium mb-1">
                            Етаж
                          </label>
                          <input
                            type="text"
                            id="floor"
                            name="floor"
                            value={formData.floor}
                            onChange={handleChange}
                            placeholder="Ет."
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Для самовывоза показываем карту
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Адрес за самовземане</h3>
                      <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-3">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="font-semibold mb-1">Адрес за самовземане във Варна:</p>
                        <p className="text-gray-700">ул. Примерна 123, Варна</p>
                        <p className="text-sm text-gray-600 mt-1">Работно време: 9:00 - 18:00</p>
                      </div>
                    </div>
                  )}

                  {/* Способ оплаты */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">Начин на плащане</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Наличными в магазине</p>
                          <p className="text-sm text-gray-500">При получении заказа</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">Картой в магазине</p>
                          <p className="text-sm text-gray-500">POS-терминал при получении</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">На банковский счет</p>
                          <p className="text-sm text-gray-500">Банковский перевод</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Коментарий */}
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-1">
                      Коментар
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Допълнителна информация за поръчката"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Правая колонка - Товары и итого */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow sticky top-24 bottom-6 max-h-[calc(100vh-7rem)] flex flex-col">
                  <h2 className="font-bold text-xl mb-4 flex-shrink-0">Вашата поръчка</h2>
                  
                  {/* Компактный список товаров с внутренним скроллом */}
                  <div className="space-y-3 mb-4 overflow-y-auto flex-shrink-1 min-h-0" style={{ maxHeight: 'calc(100vh - 32rem)' }}>
                    {items.map((item) => {
                      const itemPrice = item.price + (item.options?.addCard ? 5 : 0);
                      return (
                        <div key={item.sku} className="flex gap-3 border-b pb-3 last:border-b-0">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">Няма снимка</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-2 mb-1">{item.name}</p>
                            <div className="flex items-center justify-between gap-2 mt-2">
                              {/* Счетчик количества */}
                              <div className="flex items-center gap-1 border rounded">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.sku, Math.max(1, item.quantity - 1))}
                                  className="p-1 hover:bg-gray-100 rounded-l"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-sm font-medium min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100 rounded-r"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {/* Цена и кнопка удалить */}
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs whitespace-nowrap">
                                  {formatPrice(itemPrice * item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.sku)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Промокод */}
                  <div className="mb-4 pb-4 border-b flex-shrink-0">
                    <label className="block text-sm font-medium mb-2">Промокод:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Въведете промокод"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
                      >
                        Приложи
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                    {promoDiscount > 0 && (
                      <p className="text-green-600 text-xs mt-1">
                        Промокод приложен! Отстъпка: -{formatPrice(promoDiscount)}
                      </p>
                    )}
                  </div>

                  {/* Итого */}
                  <div className="space-y-2 mb-4 flex-shrink-0">
                    <div className="flex justify-between text-sm">
                      <span>Продукти:</span>
                      <div className="text-right">
                        <div>{formatPrice(totalPrice)}</div>
                        <div className="text-xs text-gray-600">{formatPriceEUR(totalPrice)}</div>
                      </div>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Промокод:</span>
                        <div className="text-right">
                          <div>-{formatPrice(promoDiscount)}</div>
                          <div className="text-xs">-{formatPriceEUR(promoDiscount)}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Доставка:</span>
                      <span className="text-green-600">Безплатна</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4 flex-shrink-0">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Общо:</span>
                      <div className="text-primary text-right">
                        <div>{formatPrice(finalPrice)}</div>
                        <div className="text-lg font-normal text-primary/70">{formatPriceEUR(finalPrice)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                    type="submit"
                    disabled={loading || !deliveryDate || !deliveryTime}
                    className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {loading ? 'Изпращане...' : 'Оформи поръчка'}
                    </button>

                    <Link
                      href="/katalog"
                      className="block text-center text-primary mt-3 hover:underline text-sm"
                    >
                      Продължи пазаруването
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
