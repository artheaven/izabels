'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const response = await adminApi.getOrderById(parseInt(params.id));
      setOrder(response.data.order);
      setStatus(response.data.order.status);
      setSource(response.data.order.source || 'WEBSITE');
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await adminApi.updateOrder(parseInt(params.id), { status, source });
      alert('Статус и източник обновлени!');
      loadOrder();
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Ошибка при обновлении');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (!order) return <div>Заказ не найден</div>;

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4"
        >
          ← Назад к списку
        </button>
        <h1 className="text-3xl font-bold">Заказ #{order.orderNumber}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Информация о клиенте */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-xl mb-4">Информация о клиенте</h2>
          <div className="space-y-2">
            <p><strong>Имя:</strong> {order.customerName}</p>
            <p><strong>Телефон:</strong> {order.customerPhone}</p>
            {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
            
            <div className="border-t pt-3 mt-3">
              <p><strong>Тип:</strong> {
                order.deliveryType === 'DELIVERY' ? '🚚 Доставка' : '🏪 Самовывоз'
              }</p>
              {order.deliveryAddress && (
                <p><strong>Адрес:</strong> {order.deliveryAddress}</p>
              )}
              {order.deliveryDate && (
                <p><strong>Дата:</strong> {new Date(order.deliveryDate).toLocaleDateString('ru-RU')}</p>
              )}
              {order.deliveryTime && (
                <p><strong>Время:</strong> {order.deliveryTime}</p>
              )}
            </div>

            {order.comment && (
              <div className="border-t pt-3 mt-3">
                <strong>Комментарий:</strong>
                <p className="mt-1 text-gray-700">{order.comment}</p>
              </div>
            )}

            <div className="border-t pt-3 mt-3">
              <p className="text-sm text-gray-600">
                <strong>Дата создания:</strong> {formatDate(order.createdAt)}
              </p>
              {order.sellerName && (
                <p className="text-sm text-gray-600 mt-2">
                  <strong>Продавец:</strong> {order.sellerName}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Статус заказа */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-xl mb-4">Управление заказом</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Статус:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="new">Новый</option>
                <option value="processing">В обработке</option>
                <option value="ready">Готов к доставке</option>
                <option value="delivered">Доставлен</option>
                <option value="cancelled">Отменен</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Източник на поръчка:</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="WEBSITE">🌐 Сайт</option>
                <option value="STORE">🏪 Магазин</option>
                <option value="INSTAGRAM">📷 Инстаграм</option>
                <option value="FACEBOOK">👍 Фейсбук</option>
              </select>
            </div>
            <button
              onClick={handleStatusUpdate}
              className="w-full bg-[#02240D] text-white py-2 rounded hover:bg-[#02240D]/90"
            >
              Запази промените
            </button>
          </div>
        </div>

        {/* Товары */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-xl mb-4">Состав заказа</h2>
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Товар</th>
                <th className="text-right py-2">Кол-во</th>
                <th className="text-right py-2">Цена</th>
                <th className="text-right py-2">Сумма</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{item.productNameSnapshot}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatPrice(item.priceSnapshot)}</td>
                  <td className="text-right font-semibold">
                    {formatPrice(parseFloat(item.priceSnapshot) * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold">
              <tr>
                <td colSpan={3} className="text-right py-4">Итого:</td>
                <td className="text-right py-4 text-primary text-xl">
                  {formatPrice(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
