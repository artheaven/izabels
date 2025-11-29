'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';

export default function NewCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    customerStatus: 'NEW',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminApi.createCustomer(formData);
      alert('Клиент успешно создан!');
      router.push('/admin/customers');
    } catch (err: any) {
      console.error('Error creating customer:', err);
      setError(err.response?.data?.error || 'Ошибка при создании клиента');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Создать клиента</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-4">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="example@mail.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-1">
              Пароль *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full border rounded px-3 py-2"
              placeholder="Минимум 6 символов"
            />
          </div>

          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold mb-1">
              Име
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold mb-1">
              Фамилия
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold mb-1">
              Телефон
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              placeholder="+359..."
            />
          </div>

          {/* Customer Status */}
          <div>
            <label htmlFor="customerStatus" className="block text-sm font-semibold mb-1">
              Статус клиента
            </label>
            <select
              id="customerStatus"
              name="customerStatus"
              value={formData.customerStatus}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="NEW">Новый (0%)</option>
              <option value="REGULAR">Постоянный (5%)</option>
              <option value="LOYAL">Свой (10%)</option>
              <option value="VIP">VIP (15%)</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#02240D] text-white py-2 rounded hover:bg-[#02240D]/90 disabled:opacity-50"
            >
              {loading ? 'Создание...' : 'Создать клиента'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/customers')}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
