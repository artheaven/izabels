'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminSalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => {
    // По умолчанию сегодняшняя дата
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  useEffect(() => {
    loadSales();
  }, [dateFilter]);

  const loadSales = async () => {
    setLoading(true);
    try {
      const params: any = { orderType: 'SALE' };
      
      if (dateFilter) {
        // Фильтр по конкретной дате
        const startDate = new Date(dateFilter);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(dateFilter);
        endDate.setHours(23, 59, 59, 999);
        
        params.from = startDate.toISOString();
        params.to = endDate.toISOString();
      }
      
      const response = await adminApi.getOrders(params);
      // Берем 20 последних продаж, если нет фильтра по дате
      const allSales = response.data.orders;
      setSales(dateFilter ? allSales : allSales.slice(0, 20));
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (orderId: number) => {
    router.push(`/admin/orders/${orderId}`);
  };

  // Группируем продажи по дням
  const groupedSales = sales.reduce((groups: any, sale: any) => {
    const date = new Date(sale.createdAt).toLocaleDateString('bg-BG');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(sale);
    return groups;
  }, {});

  // Считаем итог дня
  const calculateDayTotal = (daySales: any[]) => {
    return daySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount), 0);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Продажи</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium mb-1">Фильтр по дате:</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={() => setDateFilter('')}
            className="mt-6 px-4 py-2 border rounded hover:bg-gray-50"
          >
            Последние 20
          </button>
          <button
            onClick={() => router.push("/admin/sales/new")}
            className="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition flex items-center space-x-2"
          >
            <span>+</span>
            <span>Новая продажа</span>
          </button>
        </div>
      </div>

      {!dateFilter && sales.length >= 20 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          Показаны последние 20 продаж. Выберите дату для просмотра конкретного дня.
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата и время</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Продавец</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Источник</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedSales).map(([date, daySales]: [string, any]) => {
              const dayTotal = calculateDayTotal(daySales);
              return (
                <React.Fragment key={`day-${date}`}>
                  {daySales.map((sale: any, index: number) => (
                    <tr 
                      key={sale.id} 
                      onClick={() => handleRowClick(sale.id)}
                      className="hover:bg-gray-50 cursor-pointer border-b border-gray-200"
                    >
                      <td className="px-6 py-4">#{sale.orderNumber}</td>
                      <td className="px-6 py-4">
                        <div>{formatDate(sale.createdAt)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(sale.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{sale.customerName}</div>
                        <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{sale.sellerName || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs">
                          {sale.source === 'WEBSITE' && '🌐 Сайт'}
                          {sale.source === 'STORE' && '🏪 Магазин'}
                          {sale.source === 'INSTAGRAM' && '📷 Instagram'}
                          {sale.source === 'FACEBOOK' && '👍 Facebook'}
                          {!sale.source && '🏪 Магазин'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{formatPrice(sale.totalAmount)}</td>
                    </tr>
                  ))}
                  {/* Строка итога дня */}
                  <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                    <td colSpan={5} className="px-6 py-3 font-bold text-right">
                      Итого за {date}:
                    </td>
                    <td className="px-6 py-3 font-bold text-primary text-lg">
                      {formatPrice(dayTotal)}
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
        
        {sales.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Пока нет продаж
          </div>
        )}
      </div>
    </div>
  );
}
