'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, addressApi } from '@/lib/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  customerStatus: 'NEW' | 'REGULAR' | 'LOYAL' | 'VIP';
  totalOrders: number;
  totalSpent: number;
  emailVerified: boolean;
}

interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

const statusLabels = {
  NEW: 'Нов клиент',
  REGULAR: 'Редовен клиент (5% отстъпка)',
  LOYAL: 'Лоялен клиент (10% отстъпка)',
  VIP: 'VIP клиент (15% отстъпка)',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, addressesRes] = await Promise.all([
        authApi.getMe(),
        addressApi.getAddresses(),
      ]);

      setUser(userRes.data.user);
      setAddresses(addressesRes.data.addresses);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/vhod');
      } else {
        setError('Грешка при зареждане на данни');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-state-changed'));
    router.push('/');
  };

  const handleSendVerification = async () => {
    try {
      setVerificationError('');
      await authApi.resendVerificationEmail(user!.email);
      setVerificationSent(true);
    } catch (err: any) {
      setVerificationError(err.response?.data?.error || 'Грешка при изпращане на код');
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setVerificationError('Въведете код');
      return;
    }

    setVerifying(true);
    setVerificationError('');

    try {
      await authApi.verifyEmail(verificationCode);
      
      // Обновяем данные пользователя
      const userRes = await authApi.getMe();
      setUser(userRes.data.user);
      
      // Обновляем localStorage
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.emailVerified = true;
      localStorage.setItem('user', JSON.stringify(storedUser));
      window.dispatchEvent(new Event('auth-state-changed'));
      
      setVerificationSent(false);
      setVerificationCode('');
    } catch (err: any) {
      setVerificationError(err.response?.data?.error || 'Невалиден код');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Зареждане...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error || 'Грешка'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Моят профил</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Изход
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Лична информация */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Лична информация</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Име и фамилия</label>
                <p className="font-medium">{user.firstName} {user.lastName}</p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Имейл</label>
                <p className="font-medium">{user.email}</p>
                {!user.emailVerified && (
                  <div className="mt-2">
                    <p className="text-sm text-yellow-600 mb-2">Email не е потвърден</p>
                    {!verificationSent ? (
                      <button
                        onClick={handleSendVerification}
                        className="text-sm px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700"
                      >
                        Изпрати код за потвърждение
                      </button>
                    ) : (
                      <form onSubmit={handleVerifyEmail} className="space-y-2">
                        <p className="text-sm text-green-600">Код изпратен на {user.email}</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Въведете код"
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                            disabled={verifying}
                          />
                          <button
                            type="submit"
                            disabled={verifying}
                            className="px-3 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 text-sm disabled:opacity-50"
                          >
                            {verifying ? 'Проверка...' : 'Потвърди'}
                          </button>
                        </div>
                        {verificationError && (
                          <p className="text-sm text-red-600">{verificationError}</p>
                        )}
                        <button
                          type="button"
                          onClick={handleSendVerification}
                          className="text-sm text-pink-600 hover:text-pink-700"
                        >
                          Изпрати код отново
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {user.phone && (
                <div>
                  <label className="text-sm text-gray-600">Телефон</label>
                  <p className="font-medium">{user.phone}</p>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600">Статус</label>
                <p className="font-medium text-pink-600">
                  {statusLabels[user.customerStatus]}
                </p>
              </div>
            </div>

            <button className="mt-6 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700">
              Редактирай профил
            </button>
          </div>

          {/* Адреси */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Адреси за доставка</h2>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-sm">
                + Добави адрес
              </button>
            </div>

            {addresses.length === 0 ? (
              <p className="text-gray-500">Няма запазени адреси</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="border rounded-md p-4 flex justify-between items-start"
                  >
                    <div>
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-sm text-gray-600">{addr.address}</p>
                      <p className="text-sm text-gray-600">
                        {addr.city} {addr.postalCode}
                      </p>
                      {addr.isDefault && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded mt-1 inline-block">
                          По подразбиране
                        </span>
                      )}
                    </div>
                    <button className="text-sm text-gray-600 hover:text-gray-800">
                      Редактирай
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Статистика */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Статистика</h2>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-3xl font-bold text-pink-600">{user.totalOrders}</p>
                <p className="text-sm text-gray-600">Общо поръчки</p>
              </div>

              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-3xl font-bold text-pink-600">
                  {parseFloat(user.totalSpent.toString()).toFixed(2)} лв.
                </p>
                <p className="text-sm text-gray-600">Обща сума</p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Бързи връзки</h2>
            
            <div className="space-y-2">
              {user.totalOrders > 0 ? (
                <a
                  href="/moite-poruchki"
                  className="block px-4 py-2 text-center bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Моите поръчки
                </a>
              ) : (
                <button
                  disabled
                  className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
                  title="Все още нямате поръчки"
                >
                  Моите поръчки
                </button>
              )}
              <a
                href="/katalog"
                className="block px-4 py-2 text-center bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Каталог
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
