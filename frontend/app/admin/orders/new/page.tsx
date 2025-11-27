'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Plus, Trash2, Minus, Search } from 'lucide-react';

export default function NewOrderPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    comment: '',
    source: 'STORE',
    paymentMethod: 'cash',
  });
  
  const [deliveryType, setDeliveryType] = useState('DELIVERY_VARNA');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  
  const [items, setItems] = useState<Array<{
    id: number;
    sku: string;
    name: string;
    quantity: number;
    price: number;
    type: string;
  }>>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seller, setSeller] = useState('');

  useEffect(() => {
    loadData();
    // Получаем информацию о текущем пользователе
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        setSeller(user.username || user.email || 'admin');
      } catch (e) {
        setSeller('admin');
      }
    }
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, allProducts]);

  const loadData = async () => {
    try {
      const [categoriesRes, bouquetsRes, flowersRes, packagingRes] = await Promise.all([
        adminApi.getCategories(),
        adminApi.getBouquets(),
        adminApi.getFlowers(),
        adminApi.getPackaging(),
      ]);
      
      setCategories(categoriesRes.data.categories);
      
      // Объединяем все товары
      const allItems = [
        ...bouquetsRes.data.bouquets.map((b: any) => ({ ...b, type: 'bouquet' })),
        ...flowersRes.data.flowers.map((f: any) => ({ ...f, type: 'flower' })),
        ...packagingRes.data.packaging.map((p: any) => ({ ...p, type: 'packaging' })),
      ];
      
      setAllProducts(allItems);
      setFilteredProducts(allItems);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filterProducts = () => {
    let filtered = allProducts;
    
    if (searchQuery) {
      filtered = filtered.filter((p: any) => {
        const translation = p.translations?.[0];
        return translation?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    setFilteredProducts(filtered);
  };

  const handleAddItem = (product: any) => {
    const translation = product.translations?.[0];
    const price = product.price || product.pricePerUnit || 0;
    const existingItem = items.find(item => item.sku === product.sku);
    
    if (existingItem) {
      setItems(items.map(item => 
        item.sku === product.sku 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setItems([...items, {
        id: product.id,
        sku: product.sku,
        name: translation?.name || product.sku,
        quantity: 1,
        price: parseFloat(price),
        type: product.type, // Добавляем тип товара
      }]);
    }
  };

  const handleRemoveItem = (sku: string) => {
    setItems(items.filter(item => item.sku !== sku));
  };

  const updateQuantity = (sku: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(items.map(item => 
      item.sku === sku ? { ...item, quantity } : item
    ));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (items.length === 0) {
      setError('Добавьте хотя бы один товар');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      setError('Имя и телефон обязательны для предварительного заказа');
      return;
    }

    if (!deliveryDate || !deliveryTime) {
      setError('Дата и время доставки обязательны');
      return;
    }

    if ((deliveryType === 'DELIVERY_VARNA' || deliveryType === 'DELIVERY_BULGARIA') && !formData.deliveryAddress) {
      setError('Укажите адрес доставки');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        ...formData,
        deliveryType,
        deliveryDate,
        deliveryTime,
        orderType: 'PREORDER', // Всегда предзаказ
        sellerName: seller,
        items,
        deliveryPrice: 0,
      };

      await adminApi.createOrder(orderData);
      alert('Заказ успешно создан!');
      router.push('/admin/orders');
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || 'Ошибка при создании заказа');
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-primary hover:underline mb-4 flex items-center"
        >
          <span className="mr-1">←</span> Назад
        </button>
        <h1 className="text-3xl font-bold">Новый заказ</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* ВЫБОР ТОВАРОВ */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">Товары</h2>
              
              {/* Поиск */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Поиск по названию</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Искать по названию товара..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border rounded pl-10 pr-3 py-2"
                  />
                </div>
              </div>

              {/* Список товаров */}
              <div className="max-h-64 overflow-y-auto border rounded mb-4">
                {filteredProducts.length > 0 ? (
                  <div className="divide-y">
                    {filteredProducts.map((product: any) => {
                      const translation = product.translations?.[0];
                      const typeLabel = product.type === 'bouquet' ? '💐' : product.type === 'flower' ? '🌸' : '📦';
                      const price = product.price || product.pricePerUnit || 0;
                      return (
                        <div key={`${product.type}-${product.id}`} className="p-3 hover:bg-gray-50 flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-medium">{typeLabel} {translation?.name || product.sku}</p>
                            <p className="text-sm text-gray-600">{product.sku} • {price} лв</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddItem(product)}
                            className="bg-[#02240D] text-white px-3 py-1 rounded hover:bg-[#02240D]/90"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">Нет товаров</div>
                )}
              </div>

              {/* Выбранные товары */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Выбранные товары:</h3>
                  {items.map((item) => (
                    <div key={item.sku} className="flex items-center gap-3 p-2 border rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="p-1 border rounded hover:bg-gray-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          className="p-1 border rounded hover:bg-gray-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-semibold text-sm w-20 text-right">
                        {(item.price * item.quantity).toFixed(2)} лв
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.sku)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* СПОСОБ ОПЛАТЫ */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">Способ оплаты</h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cash' })}
                  className={`flex-1 py-2 px-4 rounded-lg transition ${
                    formData.paymentMethod === 'cash' ? 'bg-white shadow' : ''
                  }`}
                >
                  💵 Наличными
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className={`flex-1 py-2 px-4 rounded-lg transition ${
                    formData.paymentMethod === 'card' ? 'bg-white shadow' : ''
                  }`}
                >
                  💳 Картой
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'bank' })}
                  className={`flex-1 py-2 px-4 rounded-lg transition ${
                    formData.paymentMethod === 'bank' ? 'bg-white shadow' : ''
                  }`}
                >
                  🏦 Банк
                </button>
              </div>
            </div>

            {/* КОНТАКТНІ ДАНІ */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">
                Контактные данные
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Имя и фамилия *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                    placeholder="+359..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* ДОСТАВКА */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="font-bold text-xl mb-4">Доставка</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Тип *</label>
                    <select
                      value={deliveryType}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="DELIVERY_VARNA">Доставка в Варна</option>
                      <option value="DELIVERY_BULGARIA">Доставка по всей Болгарии</option>
                      <option value="PICKUP_VARNA">Самовывоз в Варна</option>
                    </select>
                  </div>

                  {(deliveryType === 'DELIVERY_VARNA' || deliveryType === 'DELIVERY_BULGARIA') && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Адрес *</label>
                      <input
                        type="text"
                        name="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Дата *</label>
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                        min={minDateString}
                        className="w-full border rounded px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Время *</label>
                      <select
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">Изберете</option>
                        <option value="09:00-12:00">09:00 - 12:00</option>
                        <option value="12:00-15:00">12:00 - 15:00</option>
                        <option value="15:00-18:00">15:00 - 18:00</option>
                        <option value="18:00-21:00">18:00 - 21:00</option>
                      </select>
                    </div>
                  </div>
                </div>
            </div>

            {/* ИЗТОЧНИК - САМЫЙ НИЗ */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">Источник заказа</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Источник *</label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    required
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="WEBSITE">🌐 Сайт</option>
                    <option value="STORE">🏪 Магазин</option>
                    <option value="INSTAGRAM">📷 Инстаграм</option>
                    <option value="FACEBOOK">👍 Фейсбук</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Продавец</label>
                  <input
                    type="text"
                    value={seller}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ИТОГО */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              <h2 className="font-bold text-xl mb-4">Итого</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Товары:</span>
                  <span>{items.length} шт.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Доставка:</span>
                  <span className="text-green-600">Бесплатно</span>
                </div>
              </div>

              <div className="flex justify-between font-bold text-xl mb-6 pt-4 border-t">
                <span>Всего:</span>
                <span>{calculateTotal().toFixed(2)} лв</span>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-[#02240D] text-white py-3 rounded-lg font-bold hover:bg-[#02240D]/90 disabled:opacity-50"
              >
                {loading ? 'Создание...' : 'Создать заказ'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/admin/orders')}
                className="w-full text-center text-sm text-gray-500 hover:text-primary mt-4"
              >
                Отказ
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
