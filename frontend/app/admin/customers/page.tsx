'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

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
  createdAt: string;
}

const statusLabels = {
  NEW: 'Новый',
  REGULAR: 'Постоянный',
  LOYAL: 'Свой',
  VIP: 'VIP',
};

const statusColors = {
  NEW: 'bg-gray-100 text-gray-800',
  REGULAR: 'bg-blue-100 text-blue-800',
  LOYAL: 'bg-purple-100 text-purple-800',
  VIP: 'bg-pink-100 text-pink-800',
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadCustomers();
  }, [search, statusFilter]);

  const loadCustomers = async () => {
    try {
      const response = await adminApi.getCustomers({
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Ошибка загрузки клиентов:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Клиенты</h1>
      </div>

      {/* Фильтры */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Поиск по имени или email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">Все статусы</option>
          <option value="NEW">Новый</option>
          <option value="REGULAR">Постоянный</option>
          <option value="LOYAL">Свой</option>
          <option value="VIP">VIP</option>
        </select>
      </div>

      {/* Таблица клиентов */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Клиент
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email / Телефон
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Статус
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Заказы
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Всего потрачено
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Последний заказ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {customer.firstName} {customer.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  {customer.phone && (
                    <div className="text-sm text-gray-500">{customer.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      statusColors[customer.customerStatus]
                    }`}
                  >
                    {statusLabels[customer.customerStatus]}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customer.totalOrders}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(customer.totalSpent.toString()).toFixed(2)} лв.
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString('bg-BG')
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="text-pink-600 hover:text-pink-900"
                  >
                    Подробно
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {customers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Клиенты не найдены
          </div>
        )}
      </div>
    </div>
  );
}
