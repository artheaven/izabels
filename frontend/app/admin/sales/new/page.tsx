'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { Plus, Trash2, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function NewSalePage() {
  const router = useRouter();
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [seller, setSeller] = useState('');
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    source: 'STORE',
    paymentMethod: 'cash',
  });
  
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
  }, [searchQuery, allProducts]);

  const loadData = async () => {
    try {
      const [bouquetsRes, flowersRes, packagingRes] = await Promise.all([
        adminApi.getBouquets(),
        adminApi.getFlowers(),
        adminApi.getPackaging(),
      ]);
      
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
        return translation?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    setFilteredProducts(filtered.slice(0, 10)); // Ограничиваем до 10 результатов
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
        type: product.type,
      }]);
    }
    
    setSearchQuery('');
  };

  const handleRemoveItem = (sku: string) => {
    setItems(items.filter(item => item.sku !== sku));
  };

  const handleUpdateQuantity = (sku: string, delta: number) => {
    setItems(items.map(item => {
      if (item.sku === sku) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
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

    setLoading(true);
    setError('');

    try {
      const orderData = {
        ...formData,
        customerName: formData.customerName || 'Гость',
        customerPhone: formData.customerPhone || 'Не указан',
        deliveryType: 'PICKUP',
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveryTime: '00:00',
        orderType: 'SALE', // Тип заказа - продажа
        sellerName: seller,
        items,
        deliveryPrice: 0,
      };

      await adminApi.createOrder(orderData);
      alert('Продажа успешно создана!');
      router.push('/admin/sales');
    } catch (err: any) {
      console.error('Error creating sale:', err);
      setError(err.response?.data?.error || 'Ошибка при создании продажи');
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
        <h1 className="text-3xl font-bold">Новая продажа</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Левая колонка - Продукты и оплата */}
          <div className="lg:col-span-2 space-y-6">
            {/* Выбор продуктов */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">Товары</h2>
              
              {/* Поиск */}
              <div className="relative mb-4">
                <div className="flex items-center border rounded px-3 py-2">
                  <Search className="w-5 h-5 text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Искать по названию или SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none"
                  />
                </div>
                
                {/* Результаты поиска */}
                {searchQuery && filteredProducts.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded shadow-lg mt-1 max-h-60 overflow-y-auto">
                    {filteredProducts.map((product) => {
                      const translation = product.translations?.[0];
                      const price = product.price || product.pricePerUnit || 0;
                      return (
                        <li
                          key={product.id}
                          className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAddItem(product)}
                        >
                          <div>
                            <p className="font-medium">{translation?.name || product.sku}</p>
                            <p className="text-xs text-gray-500">{product.sku}</p>
                          </div>
                          <span className="font-semibold">{formatPrice(price)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Список выбранных товаров */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.sku} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.sku}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.sku, -1)}
                        className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.sku, 1)}
                        className="w-7 h-7 rounded border flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                      <span className="w-20 text-right font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.sku)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Способ оплаты */}
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

            {/* Контактные данные (необязательно) */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">Данные клиента (необязательно)</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="customerName" className="block text-sm font-medium mb-1">
                    Имя и фамилия
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="+359..."
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* Источник */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="font-bold text-xl mb-4">Источник</h2>
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

          {/* Правая колонка - Итого */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-24">
              <h2 className="font-bold text-xl mb-4">Итого</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Товары:</span>
                  <span>{items.length} бр.</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-4">
                <div className="flex justify-between font-bold text-2xl">
                  <span>Всего:</span>
                  <span className="text-primary">{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || items.length === 0}
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition disabled:opacity-50"
              >
                {loading ? 'Создание...' : 'Создать продажу'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

