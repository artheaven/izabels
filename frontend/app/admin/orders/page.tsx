'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

const statusOptions = [
  { value: 'new', label: 'Новый' },
  { value: 'processing', label: 'В обработке' },
  { value: 'ready', label: 'Готов' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'cancelled', label: 'Отменен' },
];

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await adminApi.getOrders({ orderType: 'PREORDER' });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  const handleRowClick = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Заказы</h1>
        <button
          onClick={() => router.push('/admin/orders/new')}
          className="bg-[#02240D] text-white px-6 py-2 rounded-lg hover:bg-[#02240D]/90 transition flex items-center space-x-2"
        >
          <span>+</span>
          <span>Новый заказ</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата создания</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата доставки</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Источник</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Изменить статус</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                onClick={() => handleRowClick(order.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4">#{order.orderNumber}</td>
                <td className="px-6 py-4">
                  <div>{formatDate(order.createdAt)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {order.deliveryDate ? (
                    <>
                      <div>{new Date(order.deliveryDate).toLocaleDateString('ru-RU')}</div>
                      {order.deliveryTime && (
                        <div className="text-xs text-gray-500">{order.deliveryTime}</div>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div>{order.customerName}</div>
                  <div className="text-sm text-gray-500">{order.customerPhone}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    order.deliveryType === 'DELIVERY' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {order.deliveryType === 'DELIVERY' ? '🚚 Доставка' : '🏪 Самовывоз'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs">
                    {order.source === 'WEBSITE' && '🌐 Сайт'}
                    {order.source === 'STORE' && '🏪 Магазин'}
                    {order.source === 'INSTAGRAM' && '📷 Instagram'}
                    {order.source === 'FACEBOOK' && '👍 Facebook'}
                    {!order.source && '🌐 Сайт'}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold">{formatPrice(order.totalAmount)}</td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-1 rounded text-sm font-medium border-0 cursor-pointer focus:ring-2 focus:ring-pink-500 ${
                      order.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'ready' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
