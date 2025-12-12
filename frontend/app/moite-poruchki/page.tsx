'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  size: string;
  bouquet: {
    sku: string;
    images: string[];
    translations: Array<{ name: string }>;
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryDate: string;
  deliveryTime: string;
  recipientName: string;
  deliveryAddress: string;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: 'В обработка',
  CONFIRMED: 'Потвърдена',
  PREPARING: 'Подготвя се',
  READY: 'Готова за доставка',
  IN_DELIVERY: 'В доставка',
  DELIVERED: 'Доставена',
  CANCELLED: 'Отменена',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  IN_DELIVERY: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/vhod');
        return;
      }

      const response = await userApi.getMyOrders();
      setOrders(response.data.orders);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/vhod');
      } else {
        setError('Грешка при зареждане на поръчки');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Зареждане...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">История заказов</h1>
        <p className="text-gray-600">Всички ваши поръчки</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Все още нямате поръчки</p>
          <Link
            href="/katalog"
            className="inline-block px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700"
          >
            Разгледайте каталога
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Поръчка</p>
                    <p className="font-semibold">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Дата</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Статус</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Сума</p>
                    <p className="font-bold text-lg text-pink-600">
                      {order.totalAmount.toFixed(2)} лв.
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <div className="w-20 h-20 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.bouquet.images && item.bouquet.images.length > 0 ? (
                          <Image
                            src={item.bouquet.images[0]}
                            alt={item.bouquet.translations[0]?.name || item.bouquet.sku}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            Без снимка
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <Link
                          href={`/produkti/${item.bouquet.sku}`}
                          className="font-medium hover:text-pink-600"
                        >
                          {item.bouquet.translations[0]?.name || item.bouquet.sku}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          Размер: {item.size} • Количество: {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">{item.price.toFixed(2)} лв.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Получател</p>
                    <p className="font-medium">{order.recipientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Адрес за доставка</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Дата на доставка</p>
                    <p className="font-medium">
                      {new Date(order.deliveryDate).toLocaleDateString('bg-BG')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Време на доставка</p>
                    <p className="font-medium">{order.deliveryTime}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

