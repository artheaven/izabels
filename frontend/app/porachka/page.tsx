'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useCartStore } from '@/lib/cart-store';
import { publicApi } from '@/lib/api';
import { formatPrice, formatPriceEUR } from '@/lib/utils';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart, getTotalPrice } = useCartStore();
  
  // Получаем данные из localStorage (если есть)
  const [cartData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cart-delivery-data');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryTime: '',
    comment: '',
    isSelfPickup: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (items.length === 0) {
    return (
      <>
        <Header />
        <Breadcrumbs items={[{ label: 'Количка', href: '/koshnica' }]} currentPage="Поръчка" />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Количката е празна</h1>
            <p className="text-gray-600">
              Добавете продукти, за да оформите поръчка
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalPrice = getTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Форматируем товары для заказа
      const orderItems = items.map(item => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price + (item.options?.addCard ? 5 : 0),
        options: item.options,
      }));

      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail || undefined,
        deliveryAddress: cartData.deliveryType === 'PICKUP' ? 'Самовземане' : formData.deliveryAddress,
        deliveryType: cartData.deliveryType || 'DELIVERY',
        deliveryDate: cartData.deliveryDate || undefined,
        deliveryTime: cartData.deliveryTime || undefined,
        comment: formData.comment || undefined,
        paymentMethod: 'cash', // В v1 только наличные
        items: orderItems,
        deliveryPrice: 0,
        promoCode: cartData.promoCode || undefined,
      };

      const response = await publicApi.createOrder(orderData);

      if (response.data.success) {
        // Очищаем корзину
        clearCart();
        // Перенаправляем на страницу успеха
        router.push(`/porachka/uspeshna/${response.data.order.orderNumber}`);
      }
    } catch (err: any) {
      console.error('Order error:', err);
      setError(err.response?.data?.error || 'Грешка при оформяне на поръчката');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <>
      <Header />
      <Breadcrumbs items={[{ label: 'Количка', href: '/koshnica' }]} currentPage="Поръчка" />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Оформяне на поръчка</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Форма */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Контактні дані */}
                <div>
                  <h2 className="font-bold text-xl mb-4">Контактни данни</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Име и фамилия *
                      </label>
                      <input
                        type="text"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        name="customerPhone"
                        value={formData.customerPhone}
                        onChange={handleChange}
                        required
                        placeholder="+359..."
                        className="w-full border rounded px-4 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleChange}
                        className="w-full border rounded px-4 py-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Доставка */}
                <div>
                  <h2 className="font-bold text-xl mb-4">Доставка</h2>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isSelfPickup"
                        checked={formData.isSelfPickup}
                        onChange={handleChange}
                        className="rounded"
                      />
                      <span>Самовземане</span>
                    </label>

                    {!formData.isSelfPickup && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Адрес за доставка *
                          </label>
                          <input
                            type="text"
                            name="deliveryAddress"
                            value={formData.deliveryAddress}
                            onChange={handleChange}
                            required={!formData.isSelfPickup}
                            placeholder="Град, Улица, Номер, Апартамент"
                            className="w-full border rounded px-4 py-2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Желано време за доставка
                          </label>
                          <input
                            type="text"
                            name="deliveryTime"
                            value={formData.deliveryTime}
                            onChange={handleChange}
                            placeholder="напр. 14:00-16:00"
                            className="w-full border rounded px-4 py-2"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Коментар */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Коментар към поръчката
                  </label>
                  <textarea
                    name="comment"
                    value={formData.comment}
                    onChange={handleChange}
                    rows={4}
                    className="w-full border rounded px-4 py-2"
                    placeholder="Допълнителни пожелания..."
                  />
                </div>

                {/* Способ оплаты */}
                <div>
                  <h2 className="font-bold text-xl mb-4">Начин на плащане</h2>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 p-3 border rounded">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cash"
                        checked
                        readOnly
                        className="rounded"
                      />
                      <span>Плащане при доставка (в брой)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {loading ? 'Обработва се...' : 'Потвърди поръчката'}
                </button>
              </form>
            </div>

            {/* Обобщение */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow sticky top-24">
                <h2 className="font-bold text-xl mb-4">Вашата поръчка</h2>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.sku} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <div className="text-right">
                        <div>{formatPrice(item.price * item.quantity)}</div>
                        <div className="text-xs text-gray-600">{formatPriceEUR(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Доставка:</span>
                    <span className="text-green-600">Безплатна</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl">
                    <span>Общо:</span>
                    <div className="text-primary text-right">
                      <div>{formatPrice(totalPrice)}</div>
                      <div className="text-lg font-normal text-primary/70">{formatPriceEUR(totalPrice)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

