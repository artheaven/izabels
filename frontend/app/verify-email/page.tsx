'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // Получаем email из localStorage или query params
    const savedEmail = localStorage.getItem('pending_verification_email');
    const queryEmail = searchParams.get('email');
    setEmail(savedEmail || queryEmail || '');

    // Если есть токен в URL, сразу верифицируем
    const token = searchParams.get('token');
    if (token) {
      verifyWithToken(token);
    }
  }, [searchParams]);

  const verifyWithToken = async (token: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await authApi.verifyEmail(token);
      
      // Сохраняем токен если он пришел
      if (response.data.token) {
        localStorage.setItem('user_token', response.data.token);
      }
      
      setSuccess(true);
      localStorage.removeItem('pending_verification_email');
      
      // Автоматически перенаправляем через 3 секунды
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Невалиден или изтекъл код');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!code.trim()) {
      setError('Моля, въведете код за потвърждение');
      return;
    }

    await verifyWithToken(code.trim());
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Имейл адресът не е намерен');
      return;
    }

    setResending(true);
    setError('');

    try {
      await authApi.resendVerificationCode(email);
      alert('Нов код за потвърждение е изпратен на вашия имейл');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Грешка при изпращане на код');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">
              Имейлът е потвърден!
            </h2>
            <p className="text-green-700 mb-4">
              Вашият акаунт е активиран успешно.
            </p>
            <p className="text-sm text-gray-600">
              Пренасочване към страница за вход...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Потвърдете вашия имейл
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Изпратихме код за потвърждение на 
            {email && <span className="font-semibold"> {email}</span>}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Проверете входящата си поща и въведете кода по-долу
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Код за потвърждение
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Въведете кода от имейла"
              maxLength={100}
              className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 text-center text-lg tracking-widest"
              autoComplete="off"
            />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {loading ? 'Потвърждаване...' : 'Потвърди имейл'}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending || !email}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
            >
              {resending ? 'Изпращане...' : 'Изпрати кода отново'}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/vhod" className="text-pink-600 hover:text-pink-500">
              Назад към вход
            </Link>
          </div>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-800">
            <strong>Не получихте код?</strong>
            <br />
            • Проверете папката "Спам" или "Нежелана поща"
            <br />
            • Изчакайте няколко минути - доставката може да отнеме време
            <br />
            • Кликнете "Изпрати кода отново" след 1 минута
          </p>
        </div>
      </div>
    </div>
  );
}

