'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';
import Image from 'next/image';

interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  customerStatus: 'NEW' | 'REGULAR' | 'LOYAL' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  emailVerified: boolean;
  createdAt: string;
}

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

const customerStatusLabels = {
  NEW: 'Нов клиент',
  REGULAR: 'Редовен клиент',
  LOYAL: 'Лоялен клиент',
  VIP: 'VIP клиент',
};

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadCustomerData();
    }
  }, [params.id]);

  const loadCustomerData = async () => {
    try {
      // Загружаем информацию о клиенте
      const customerRes = await adminApi.getCustomerById(parseInt(params.id as string));
      setCustomer(customerRes.data.customer);

      // Загружаем заказы клиента
      const ordersRes = await adminApi.getOrders({ userId: parseInt(params.id as string) });
      setOrders(ordersRes.data.orders);
    } catch (error) {
      console.error('Ошибка загрузки данных клиента:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Зареждане...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">Клиент не е намерен</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/customers" className="text-pink-600 hover:text-pink-700 mb-2 inline-block">
          ← Назад към клиенти
        </Link>
        <h1 className="text-2xl font-bold">
          {customer.firstName} {customer.lastName}
        </h1>
      </div>

      {/* Customer Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Информация за клиента</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{customer.email}</p>
            {!customer.emailVerified && (
              <p className="text-sm text-yellow-600">Email не е потвърден</p>
            )}
          </div>
          {customer.phone && (
            <div>
              <p className="text-sm text-gray-600">Телефон</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Статус</p>
            <p className="font-medium text-pink-600">
              {customerStatusLabels[customer.customerStatus]}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Регистриран на</p>
            <p className="font-medium">
              {new Date(customer.createdAt).toLocaleDateString('bg-BG')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Общо поръчки</p>
          <p className="text-3xl font-bold text-pink-600">{customer.totalOrders}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Обща сума</p>
          <p className="text-3xl font-bold text-pink-600">
            {customer.totalSpent.toFixed(2)} лв.
          </p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-1">Последна поръчка</p>
          <p className="text-lg font-bold">
            {customer.lastOrderDate
              ? new Date(customer.lastOrderDate).toLocaleDateString('bg-BG')
              : 'Няма поръчки'}
          </p>
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Поръчки ({orders.length})</h2>

        {orders.length === 0 ? (
          <p className="text-gray-500">Няма поръчки</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold hover:text-pink-600"
                      >
                        #{order.orderNumber}
                      </Link>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('bg-BG')}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-pink-600">
                        {order.totalAmount.toFixed(2)} лв.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-4 py-3">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-16 h-16 relative bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.bouquet.images && item.bouquet.images.length > 0 ? (
                            <Image
                              src={item.bouquet.images[0]}
                              alt={item.bouquet.translations[0]?.name || item.bouquet.sku}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Без фото
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {item.bouquet.translations[0]?.name || item.bouquet.sku}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.size} • {item.quantity} бр.
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-medium text-sm">{item.price.toFixed(2)} лв.</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Получател:</span>{' '}
                      <span className="font-medium">{order.recipientName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Доставка:</span>{' '}
                      <span className="font-medium">
                        {new Date(order.deliveryDate).toLocaleDateString('bg-BG')}{' '}
                        {order.deliveryTime}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Адрес:</span>{' '}
                      <span className="font-medium">{order.deliveryAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

