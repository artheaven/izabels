'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/lib/cart-store';
import { getImageUrl, publicApi, addressApi } from '@/lib/api';
import { formatPrice, formatPriceEUR } from '@/lib/utils';
import { Trash2, Plus, Minus, MapPin } from 'lucide-react';
import AddressAutocomplete from '@/components/AddressAutocomplete';

interface SavedAddress {
  id: number;
  name: string;
  address: string;
  city: string;
  postalCode?: string;
  isDefault: boolean;
}

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice } = useCartStore();
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Форма заказа
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerPhoneCountry: '+359',
    customerEmail: '',
    deliveryStreet: '',
    deliveryNumber: '',
    apartment: '',
    floor: '',
    recipientPhone: '',
    recipientPhoneCountry: '+359',
    comment: '',
  });
  
  // Валидация полей
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [recipientPhoneError, setRecipientPhoneError] = useState('');
  
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'DELIVERY_BULGARIA' | 'PICKUP'>('DELIVERY');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank'>('cash');
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Предотвращаем ошибку гидратации и загружаем данные
  useEffect(() => {
    setMounted(true);
    
    // Устанавливаем дату и время по умолчанию
    const now = new Date();
    const currentHour = now.getHours();
    
    // Если сейчас после 17:00 (магазин закрывается в 19:00, нужно минимум 2 часа)
    // то доставка возможна только завтра
    let defaultDate = new Date();
    if (currentHour >= 17) {
      defaultDate.setDate(defaultDate.getDate() + 1);
    }
    
    setDeliveryDate(defaultDate.toISOString().split('T')[0]);
    
    // Вычисляем доступные слоты времени
    updateAvailableTimeSlots(defaultDate);
    
    // Автозаполнение данных пользователя если залогинен
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsLoggedIn(true);
      try {
        const user = JSON.parse(userStr);
        // Убираем код страны из телефона если он есть
        let phone = user.phone || '';
        if (phone.startsWith('+359')) {
          phone = phone.substring(4);
        } else if (phone.startsWith('359')) {
          phone = phone.substring(3);
        }
        
        setFormData(prev => ({
          ...prev,
          customerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          customerPhone: phone,
          customerEmail: user.email || '',
        }));
        
        // Загружаем сохраненные адреса
        loadSavedAddresses();
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);
  
  // Обновляем доступные слоты времени при изменении даты
  useEffect(() => {
    if (deliveryDate) {
      const selectedDate = new Date(deliveryDate + 'T00:00:00');
      updateAvailableTimeSlots(selectedDate);
    }
  }, [deliveryDate]);
  
  const updateAvailableTimeSlots = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const currentHour = now.getHours();
    
    // Генерируем слоты с 12:00 до 19:00 (магазин закрывается в 19:00)
    const slots: string[] = [];
    const startHour = 12;
    const endHour = 19;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      // Если это сегодня, показываем только слоты минимум через 2 часа
      if (isToday) {
        if (hour >= currentHour + 2) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
      } else {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }
    
    setAvailableTimeSlots(slots);
    
    // Если текущий выбранный слот недоступен, сбрасываем
    if (deliveryTime && !slots.includes(deliveryTime)) {
      setDeliveryTime('');
    }
  };
  
  const loadSavedAddresses = async () => {
    try {
      const response = await addressApi.getAddresses();
      setSavedAddresses(response.data.addresses);
      
      // Автоматически выбираем адрес по умолчанию
      const defaultAddress = response.data.addresses.find((addr: SavedAddress) => addr.isDefault);
      if (defaultAddress) {
        handleSelectAddress(defaultAddress.id);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };
  
  const handleSelectAddress = (addressId: number) => {
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (!address) return;
    
    setSelectedAddressId(addressId);
    
    // Парсим адрес (формат: "улица номер, Апт. X, Ет. Y")
    const addressParts = address.address.split(',').map(p => p.trim());
    const streetAndNumber = addressParts[0] || '';
    
    // Разделяем улицу и номер
    const lastSpaceIndex = streetAndNumber.lastIndexOf(' ');
    const street = lastSpaceIndex > 0 ? streetAndNumber.substring(0, lastSpaceIndex) : streetAndNumber;
    const number = lastSpaceIndex > 0 ? streetAndNumber.substring(lastSpaceIndex + 1) : '';
    
    // Ищем квартиру и этаж
    let apartment = '';
    let floor = '';
    
    for (const part of addressParts.slice(1)) {
      if (part.startsWith('Апт.')) {
        apartment = part.replace('Апт.', '').trim();
      } else if (part.startsWith('Ет.')) {
        floor = part.replace('Ет.', '').trim();
      }
    }
    
    setFormData(prev => ({
      ...prev,
      deliveryStreet: street,
      deliveryNumber: number,
      apartment: apartment,
      floor: floor,
    }));
    
    setAddressError('');
  };
  
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    
    setPromoError('');
    try {
      const response = await publicApi.validatePromo(promoCode, getTotalPrice());
      if (response.data.valid) {
        setPromoDiscount(response.data.promo.discount);
      }
    } catch (error: any) {
      setPromoError(error.response?.data?.errors?.[0] || error.response?.data?.error || 'Невалиден промокод');
      setPromoDiscount(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Валидация телефона (болгарский формат: 8-9 цифр после кода страны)
  const validatePhone = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 8 && digitsOnly.length <= 12;
  };

  // Валидация email
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email не обязателен
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация адреса
  const validateAddress = (): boolean => {
    if (deliveryType === 'PICKUP') return true;
    
    if (!formData.deliveryStreet || formData.deliveryStreet.trim().length === 0) {
      setAddressError('Моля, въведете улица');
      return false;
    }
    
    if (!formData.deliveryNumber || formData.deliveryNumber.trim().length === 0) {
      setAddressError('Моля, въведете номер на дома');
      return false;
    }
    
    setAddressError('');
    return true;
  };

  // Доставка: бесплатно от 60 лв, иначе 10 лв
  const FREE_DELIVERY_THRESHOLD = 60;
  const DELIVERY_COST = 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAddressError('');
    setPhoneError('');
    setEmailError('');
    setRecipientPhoneError('');
    
    // Валидация телефона
    const fullPhone = formData.customerPhone;
    if (!validatePhone(fullPhone)) {
      setPhoneError('Моля, въведете валиден телефонен номер');
      return;
    }
    
    // Валидация email
    if (formData.customerEmail && !validateEmail(formData.customerEmail)) {
      setEmailError('Моля, въведете валиден имейл адрес');
      return;
    }
    
    // Валидация телефона получателя
    if (deliveryType !== 'PICKUP' && formData.recipientPhone) {
      if (!validatePhone(formData.recipientPhone)) {
        setRecipientPhoneError('Моля, въведете валиден телефонен номер на получателя');
        return;
      }
    }
    
    // Валидация адреса для доставки
    if (!validateAddress()) {
      return;
    }
    
    setLoading(true);

    try {
      const orderItems = items.map(item => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        price: item.price + (item.options?.addCard ? 5 : 0),
        options: item.options,
      }));

      // Формируем полный адрес
      let fullAddress = `${formData.deliveryStreet} ${formData.deliveryNumber}`;
      if (deliveryType !== 'PICKUP') {
        const details = [];
        if (formData.apartment) details.push(`Апт. ${formData.apartment}`);
        if (formData.floor) details.push(`Ет. ${formData.floor}`);
        if (details.length > 0) {
          fullAddress += `, ${details.join(', ')}`;
        }
      }

      // Рассчитываем стоимость доставки
      const deliveryPrice = deliveryType === 'PICKUP' ? 0 : 
        (totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST);

      const orderData = {
        customerName: formData.customerName,
        customerPhone: `${formData.customerPhoneCountry}${formData.customerPhone.replace(/^(\+359|359)/, '')}`,
        customerEmail: formData.customerEmail || undefined,
        recipientPhone: formData.recipientPhone ? `${formData.recipientPhoneCountry}${formData.recipientPhone.replace(/^(\+359|359)/, '')}` : undefined,
        deliveryAddress: deliveryType === 'PICKUP' ? 'Самовземане - ул. Тодор Радев Пенев 13, Варна' : fullAddress,
        deliveryType: deliveryType,
        deliveryDate: deliveryDate || null,
        deliveryTime: deliveryTime || null,
        comment: formData.comment || undefined,
        paymentMethod: paymentMethod,
        items: orderItems,
        deliveryPrice: deliveryPrice,
        promoCode: promoCode || undefined,
        promoDiscount: promoDiscount || 0,
      };

      const response = await publicApi.createOrder(orderData);

      if (response.data.success) {
        clearCart();
        router.push(`/porachka/uspeshna/${response.data.order.orderNumber}`);
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || 'Грешка при създаване на поръчката');
    } finally {
      setLoading(false);
    }
  };

  // Минимальная дата - завтра
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  // Показываем загрузку пока не смонтировался клиент
  // Показываем загрузку только если не смонтирован
  if (!mounted) {
    return (
      <>
        <Header />
        <Breadcrumbs currentPage="Количка" />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-16 text-center">
            <p className="text-gray-600">Зареждане...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Header />
        <Breadcrumbs currentPage="Количка" />
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Количката е празна</h1>
            <p className="text-gray-600 mb-8">
              Добавете продукти в количката, за да продължите с поръчката
            </p>
            <Link
              href="/katalog"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Към каталога
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const totalPrice = getTotalPrice();
  // Доставка: бесплатно от 60 лв, иначе 10 лв (или самовывоз бесплатно)
  const deliveryPrice = deliveryType === 'PICKUP' ? 0 : 
    (totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST);
  const finalPrice = totalPrice - promoDiscount + deliveryPrice;
  
  // Проверка заполненности формы для активации кнопки
  const isFormValid = 
    formData.customerName.trim() !== '' &&
    formData.customerPhone.trim() !== '' &&
    deliveryDate !== '' &&
    deliveryTime !== '' &&
    phoneError === '' &&
    emailError === '' &&
    recipientPhoneError === '' &&
    (deliveryType === 'PICKUP' || (formData.deliveryStreet.trim() !== '' && formData.deliveryNumber.trim() !== ''));
  
  // Debug: показываем причину неактивности кнопки
  if (typeof window !== 'undefined' && mounted) {
    const validationState = {
      customerName: formData.customerName.trim() !== '',
      customerPhone: formData.customerPhone.trim() !== '',
      deliveryDate: deliveryDate !== '',
      deliveryTime: deliveryTime !== '',
      phoneError: phoneError === '',
      emailError: emailError === '',
      recipientPhoneError: recipientPhoneError === '',
      address: deliveryType === 'PICKUP' || (formData.deliveryStreet.trim() !== '' && formData.deliveryNumber.trim() !== ''),
      isValid: isFormValid,
    };
    console.log('Form validation:', validationState);
  }

  return (
    <>
      <Header />
      <Breadcrumbs currentPage="Количка" />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Оформяне на поръчка</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Левая колонка - Форма */}
              <div className="lg:col-span-2 space-y-6">
                {/* Контактни данни */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="font-bold text-xl mb-4">Контактни данни</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                        Име и фамилия *
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
                        Телефон *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={formData.customerPhoneCountry}
                          onChange={(e) => setFormData(prev => ({ ...prev, customerPhoneCountry: e.target.value }))}
                          className="w-24 border rounded px-2 py-2 text-sm"
                        >
                          <option value="+359">🇧🇬 +359</option>
                          <option value="+7">🇷🇺 +7</option>
                          <option value="+380">🇺🇦 +380</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                          <option value="+39">🇮🇹 +39</option>
                          <option value="+34">🇪🇸 +34</option>
                        </select>
                        <input
                          type="tel"
                          id="customerPhone"
                          name="customerPhone"
                          value={formData.customerPhone}
                          onChange={(e) => {
                            handleChange(e);
                            if (phoneError) setPhoneError('');
                          }}
                          required
                          placeholder="888 123 456"
                          className={`flex-1 border rounded px-3 py-2 ${phoneError ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-sm mt-1">{phoneError}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
                        Имейл
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={(e) => {
                          handleChange(e);
                          if (emailError) setEmailError('');
                        }}
                        placeholder="email@example.com"
                        className={`w-full border rounded px-3 py-2 ${emailError ? 'border-red-500' : ''}`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">{emailError}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Доставка */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h2 className="font-bold text-xl mb-4">Доставка</h2>
                  
                  {/* Тип доставки - табы */}
                  <div className="flex border-b border-gray-200 mb-6">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY')}
                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        deliveryType === 'DELIVERY'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Доставка във Варна
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY_BULGARIA')}
                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        deliveryType === 'DELIVERY_BULGARIA'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Доставка по цяла България
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('PICKUP')}
                      className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition ${
                        deliveryType === 'PICKUP'
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Самовземане във Варна
                    </button>
                  </div>

                  {/* Дата и време - сразу под табами */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label htmlFor="deliveryDate" className="block text-sm font-medium mb-1">
                        {deliveryType === 'PICKUP' ? 'Желана дата за самовземане *' : 'Желана дата за доставка *'}
                      </label>
                      <input
                        type="date"
                        id="deliveryDate"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        onClick={(e) => {
                          // Открываем календарь при клике на весь инпут
                          const input = e.currentTarget;
                          if (input.showPicker) {
                            try {
                              input.showPicker();
                            } catch (error) {
                              // Fallback для браузеров без showPicker
                              input.focus();
                            }
                          } else {
                            input.focus();
                          }
                        }}
                        required
                        min={minDateString}
                        className="w-full border rounded px-3 py-2 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="deliveryTime" className="block text-sm font-medium mb-1">
                        {deliveryType === 'PICKUP' ? 'Желано време за самовземане *' : 'Желано време за доставка *'}
                      </label>
                      <select
                        id="deliveryTime"
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2 cursor-pointer"
                      >
                        <option value="">Изберете време</option>
                        {availableTimeSlots.map(slot => (
                          <option key={slot} value={slot}>{slot}</option>
                        ))}
                      </select>
                      {availableTimeSlots.length === 0 && deliveryDate && (
                        <p className="text-xs text-red-600 mt-1">
                          Няма налични слотове за тази дата
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Адрес на доставка */}
                  {deliveryType === 'DELIVERY' || deliveryType === 'DELIVERY_BULGARIA' ? (
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Адрес на доставка</h3>
                      
                      {/* Сохраненные адреса */}
                      {isLoggedIn && savedAddresses.length > 0 && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium mb-3">
                            Избери запазен адрес
                          </label>
                          <div className="space-y-2">
                            {savedAddresses.map((address) => (
                              <button
                                key={address.id}
                                type="button"
                                onClick={() => handleSelectAddress(address.id)}
                                className={`w-full text-left p-3 border rounded-lg transition ${
                                  selectedAddressId === address.id
                                    ? 'border-primary bg-white shadow-sm'
                                    : 'border-gray-300 bg-white hover:border-primary/50'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{address.name}</p>
                                    <p className="text-sm text-gray-600">{address.address}</p>
                                    {address.city && (
                                      <p className="text-xs text-gray-500">{address.city}</p>
                                    )}
                                  </div>
                                  {address.isDefault && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-pink-100 text-pink-800 rounded">
                                      По подразбиране
                                    </span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAddressId(null);
                              setFormData(prev => ({
                                ...prev,
                                deliveryStreet: '',
                                deliveryNumber: '',
                                apartment: '',
                                floor: '',
                              }));
                            }}
                            className="mt-3 text-sm text-primary hover:text-primary/80 font-medium"
                          >
                            + Използвай нов адрес
                          </button>
                        </div>
                      )}
                      
                      {/* Улица */}
                      <div className="mb-3">
                        <label htmlFor="deliveryStreet" className="block text-sm font-medium mb-1">
                          Улица *
                        </label>
                        {deliveryType === 'DELIVERY' ? (
                          // Автозаполнение для доставки по Варне
                          <AddressAutocomplete
                            value={formData.deliveryStreet}
                            onChange={(value) => {
                              setFormData(prev => ({ ...prev, deliveryStreet: value }));
                              if (addressError) setAddressError('');
                            }}
                            placeholder="Започнете да пишете улица..."
                            required={true}
                            city="Varna"
                          />
                        ) : (
                          // Обычный input для доставки по всей Болгарии
                          <input
                            type="text"
                            id="deliveryStreet"
                            name="deliveryStreet"
                            value={formData.deliveryStreet}
                            onChange={(e) => {
                              handleChange(e);
                              if (addressError) setAddressError('');
                            }}
                            required={true}
                            placeholder="Град, Улица"
                            className={`w-full border rounded px-3 py-2 ${addressError ? 'border-red-500' : ''}`}
                          />
                        )}
                      </div>

                      {/* Номер, Апартамент, Етаж */}
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                          <label htmlFor="deliveryNumber" className="block text-sm font-medium mb-1">
                            Номер *
                          </label>
                          <input
                            type="text"
                            id="deliveryNumber"
                            name="deliveryNumber"
                            value={formData.deliveryNumber}
                            onChange={(e) => {
                              handleChange(e);
                              if (addressError) setAddressError('');
                            }}
                            placeholder="№"
                            required
                            className={`w-full border rounded px-3 py-2 ${addressError && !formData.deliveryNumber ? 'border-red-500' : ''}`}
                          />
                        </div>
                        <div>
                          <label htmlFor="apartment" className="block text-sm font-medium mb-1">
                            Апартамент
                          </label>
                          <input
                            type="text"
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleChange}
                            placeholder="Апт."
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div>
                          <label htmlFor="floor" className="block text-sm font-medium mb-1">
                            Етаж
                          </label>
                          <input
                            type="text"
                            id="floor"
                            name="floor"
                            value={formData.floor}
                            onChange={handleChange}
                            placeholder="Ет."
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      </div>
                      
                      {addressError && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <span className="mr-1">⚠️</span> {addressError}
                        </p>
                      )}

                      {/* Телефон получателя */}
                      <div className="mt-4">
                        <label htmlFor="recipientPhone" className="block text-sm font-medium mb-1">
                          Телефон на получателя (ако е различен)
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={formData.recipientPhoneCountry}
                            onChange={(e) => setFormData(prev => ({ ...prev, recipientPhoneCountry: e.target.value }))}
                            className="w-24 border rounded px-2 py-2 text-sm"
                          >
                            <option value="+359">🇧🇬 +359</option>
                            <option value="+7">🇷🇺 +7</option>
                            <option value="+380">🇺🇦 +380</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+39">🇮🇹 +39</option>
                            <option value="+34">🇪🇸 +34</option>
                          </select>
                          <input
                            type="tel"
                            id="recipientPhone"
                            name="recipientPhone"
                            value={formData.recipientPhone}
                            onChange={(e) => {
                              handleChange(e);
                              if (recipientPhoneError) setRecipientPhoneError('');
                            }}
                            placeholder="888 123 456"
                            className={`flex-1 border rounded px-3 py-2 ${recipientPhoneError ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {recipientPhoneError && (
                          <p className="text-red-500 text-sm mt-1">{recipientPhoneError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Оставете празно, ако получателят е същият като поръчващия
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Для самовывоза показываем карту
                    <div className="mb-6">
                      <h3 className="font-semibold text-lg mb-3">Адрес за самовземане</h3>
                      <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-3">
                        <MapPin className="w-12 h-12 text-gray-400" />
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="font-semibold mb-1">Адрес за самовземане във Варна:</p>
                        <p className="text-gray-700">ул. Примерна 123, Варна</p>
                        <p className="text-sm text-gray-600 mt-1">Работно време: 9:00 - 18:00</p>
                      </div>
                    </div>
                  )}

                  {/* Способ оплаты */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3">Начин на плащане</h3>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === 'cash'}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">В брой</p>
                          <p className="text-sm text-gray-500">При получаване на поръчката</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === 'card'}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">С карта</p>
                          <p className="text-sm text-gray-500">POS терминал при получаване</p>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 transition">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bank"
                          checked={paymentMethod === 'bank'}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="rounded-full"
                        />
                        <div className="flex-1">
                          <p className="font-medium">По банкова сметка</p>
                          <p className="text-sm text-gray-500">Банков превод</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Коментарий */}
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-1">
                      Коментар
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Допълнителна информация за поръчката"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              {/* Правая колонка - Товары и итого */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow sticky top-24 bottom-6 max-h-[calc(100vh-7rem)] flex flex-col">
                  <h2 className="font-bold text-xl mb-4 flex-shrink-0">Вашата поръчка</h2>
                  
                  {/* Компактный список товаров с внутренним скроллом */}
                  <div className="space-y-3 mb-4 overflow-y-auto flex-shrink-1 min-h-0" style={{ maxHeight: 'calc(100vh - 32rem)' }}>
                    {items.map((item) => {
                      const itemPrice = item.price + (item.options?.addCard ? 5 : 0);
                      return (
                        <div key={item.sku} className="flex gap-3 border-b pb-3 last:border-b-0">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                fill
                                className="object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">Няма снимка</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold line-clamp-2 mb-1">{item.name}</p>
                            <div className="flex items-center justify-between gap-2 mt-2">
                              {/* Счетчик количества */}
                              <div className="flex items-center gap-1 border rounded">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.sku, Math.max(1, item.quantity - 1))}
                                  className="p-1 hover:bg-gray-100 rounded-l"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-sm font-medium min-w-[20px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100 rounded-r"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {/* Цена и кнопка удалить */}
                              <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-xs whitespace-nowrap">
                                  {formatPrice(itemPrice * item.quantity)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.sku)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Промокод */}
                  <div className="mb-4 pb-4 border-b flex-shrink-0">
                    <label className="block text-sm font-medium mb-2">Промокод:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                        placeholder="Въведете промокод"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
                      >
                        Приложи
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                    {promoDiscount > 0 && (
                      <p className="text-green-600 text-xs mt-1">
                        Промокод приложен! Отстъпка: -{formatPrice(promoDiscount)}
                      </p>
                    )}
                  </div>

                  {/* Итого */}
                  <div className="space-y-2 mb-4 flex-shrink-0">
                    <div className="flex justify-between text-sm">
                      <span>Продукти:</span>
                      <div className="text-right">
                        <div>{formatPrice(totalPrice)}</div>
                        <div className="text-xs text-gray-600">{formatPriceEUR(totalPrice)}</div>
                      </div>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Промокод:</span>
                        <div className="text-right">
                          <div>-{formatPrice(promoDiscount)}</div>
                          <div className="text-xs">-{formatPriceEUR(promoDiscount)}</div>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Доставка:</span>
                      {deliveryType === 'PICKUP' ? (
                        <span className="text-green-600">Безплатна (самовземане)</span>
                      ) : deliveryPrice === 0 ? (
                        <span className="text-green-600">Безплатна (над {FREE_DELIVERY_THRESHOLD} лв)</span>
                      ) : (
                        <div className="text-right">
                          <div>{formatPrice(deliveryPrice)}</div>
                          <div className="text-xs text-gray-500">
                            Безплатна над {FREE_DELIVERY_THRESHOLD} лв
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4 flex-shrink-0">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Общо:</span>
                      <div className="text-accent text-right">
                        <div>{formatPrice(finalPrice)}</div>
                        <div className="text-lg font-normal text-accent/70">{formatPriceEUR(finalPrice)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      type="submit"
                      disabled={loading || !isFormValid}
                      className="w-full bg-accent text-white py-3 rounded-lg font-bold hover:bg-accent/90 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                      {loading ? 'Изпращане...' : 'Оформи поръчка'}
                    </button>

                    <Link
                      href="/katalog"
                      className="block text-center text-accent mt-3 hover:underline text-sm"
                    >
                      Продължи пазаруването
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
