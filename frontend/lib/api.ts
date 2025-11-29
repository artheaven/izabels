import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// Создаем экземпляр axios
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к запросам (для админки и пользователей)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    // Приоритет: admin_token для админских запросов, user_token для пользовательских
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('user_token');
    
    if (config.url?.includes('/admin/') && adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
  }
  return config;
});

// === Публичные API ===

export const publicApi = {
  // Категории
  getCategories: (lang = 'bg') => 
    api.get('/api/categories', { params: { lang } }),

  // Товары
  getProducts: (params: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    size?: string;
    sort?: string;
    lang?: string;
  }) => api.get('/api/products', { params }),

  // Товар по SKU
  getProductBySku: (sku: string, lang = 'bg') => 
    api.get(`/api/products/${sku}`, { params: { lang } }),

  // Популярные товары
  getFeaturedProducts: (lang = 'bg') =>
    api.get('/api/products/featured', { params: { lang } }),

  // Размеры букетов
  getBouquetSizes: (lang = 'bg') =>
    api.get('/api/bouquet-sizes', { params: { lang } }),

  // Создание заказа
  createOrder: (data: any) => 
    api.post('/api/orders', data),

  // Валидация промокода
  validatePromo: (code: string, orderAmount: number) =>
    api.post('/api/promos/validate', { code, orderAmount }),
};

// === Аутентификация пользователей ===

export const authApi = {
  // Регистрация
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => api.post('/api/auth/register', data),

  // Вход
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  // Получить текущего пользователя
  getMe: () => api.get('/api/auth/me'),

  // Обновить профиль
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthday?: string;
  }) => api.put('/api/auth/profile', data),

  // Подтверждение email
  verifyEmail: (token: string) =>
    api.post(`/api/auth/verify-email/${token}`),

  // Запрос сброса пароля
  forgotPassword: (email: string) =>
    api.post('/api/auth/forgot-password', { email }),

  // Сброс пароля
  resetPassword: (token: string, password: string) =>
    api.post(`/api/auth/reset-password/${token}`, { password }),
};

// === Адреса пользователей ===

export const addressApi = {
  getAddresses: () => api.get('/api/addresses'),
  
  createAddress: (data: {
    name: string;
    address: string;
    city?: string;
    postalCode?: string;
    isDefault?: boolean;
  }) => api.post('/api/addresses', data),
  
  updateAddress: (id: number, data: any) =>
    api.put(`/api/addresses/${id}`, data),
  
  deleteAddress: (id: number) =>
    api.delete(`/api/addresses/${id}`),
};

// === Админ API ===

export const adminApi = {
  // Аутентификация
  login: (username: string, password: string) =>
    api.post('/api/admin/login', { username, password }),

  logout: () => api.post('/api/admin/logout'),

  // Цветы
  getFlowers: (params?: { subcategory?: string; search?: string }) =>
    api.get('/api/admin/flowers', { params }),

  getFlowerById: (id: number) =>
    api.get(`/api/admin/flowers/${id}`),

  createFlower: (data: FormData) =>
    api.post('/api/admin/flowers', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateFlower: (id: number, data: FormData) =>
    api.put(`/api/admin/flowers/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteFlower: (id: number) =>
    api.delete(`/api/admin/flowers/${id}`),

  deleteFlowerImage: (id: number, imagePath: string) =>
    api.delete(`/api/admin/flowers/${id}/image/${encodeURIComponent(imagePath)}`),

  toggleFlower: (id: number) =>
    api.patch(`/api/admin/flowers/${id}/toggle`),

  // Упаковка
  getPackaging: () =>
    api.get('/api/admin/packaging'),

  getPackagingById: (id: number) =>
    api.get(`/api/admin/packaging/${id}`),

  createPackaging: (data: FormData) =>
    api.post('/api/admin/packaging', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updatePackaging: (id: number, data: FormData) =>
    api.put(`/api/admin/packaging/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deletePackaging: (id: number) =>
    api.delete(`/api/admin/packaging/${id}`),

  togglePackaging: (id: number) =>
    api.patch(`/api/admin/packaging/${id}/toggle`),

  // Букеты
  getBouquets: () =>
    api.get('/api/admin/bouquets'),

  getBouquetById: (id: number) =>
    api.get(`/api/admin/bouquets/${id}`),

  createBouquet: (data: FormData) =>
    api.post('/api/admin/bouquets', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateBouquet: (id: number, data: FormData | any) =>
    api.put(`/api/admin/bouquets/${id}`, data, 
      data instanceof FormData ? {
        headers: { 'Content-Type': 'multipart/form-data' },
      } : {}
    ),

  deleteBouquet: (id: number) =>
    api.delete(`/api/admin/bouquets/${id}`),

  deleteBouquetImage: (id: number, imagePath: string) =>
    api.delete(`/api/admin/bouquets/${id}/image/${encodeURIComponent(imagePath)}`),

  toggleBouquet: (id: number) =>
    api.patch(`/api/admin/bouquets/${id}/toggle`),

  toggleBouquetFeatured: (id: number, featuredOrder?: number) =>
    api.patch(`/api/admin/bouquets/${id}/featured`, { featuredOrder }),

  // Размеры букетов
  getBouquetSizes: () =>
    api.get('/api/admin/bouquet-sizes'),

  getBouquetSizeById: (id: number) =>
    api.get(`/api/admin/bouquet-sizes/${id}`),

  createBouquetSize: (data: any) =>
    api.post('/api/admin/bouquet-sizes', data),

  updateBouquetSize: (id: number, data: any) =>
    api.put(`/api/admin/bouquet-sizes/${id}`, data),

  deleteBouquetSize: (id: number) =>
    api.delete(`/api/admin/bouquet-sizes/${id}`),

  // Заказы
  getOrders: (params?: { status?: string; from?: string; to?: string; orderType?: string }) =>
    api.get('/api/admin/orders', { params }),

  getOrderById: (id: number) =>
    api.get(`/api/admin/orders/${id}`),

  createOrder: (data: any) =>
    api.post('/api/admin/orders', data),

  updateOrder: (id: number, data: any) =>
    api.put(`/api/admin/orders/${id}`, data),

  updateOrderStatus: (id: number, status: string) =>
    api.patch(`/api/admin/orders/${id}/status`, { status }),

  // Категории
  getCategories: () =>
    api.get('/api/admin/categories'),

  getCategoryById: (id: number) =>
    api.get(`/api/admin/categories/${id}`),

  createCategory: (data: any) =>
    api.post('/api/admin/categories', data),

  updateCategory: (id: number, data: any) =>
    api.put(`/api/admin/categories/${id}`, data),

  deleteCategory: (id: number) =>
    api.delete(`/api/admin/categories/${id}`),

  // Клиенты
  getCustomers: (params?: { search?: string; status?: string; sortBy?: string; order?: string }) =>
    api.get('/api/admin/customers', { params }),

  getCustomerById: (id: number) =>
    api.get(`/api/admin/customers/${id}`),

  createCustomer: (data: any) =>
    api.post('/api/admin/customers', data),

  updateCustomer: (id: number, data: any) =>
    api.put(`/api/admin/customers/${id}`, data),

  updateCustomerStatus: (id: number, customerStatus: string) =>
    api.put(`/api/admin/customers/${id}/status`, { customerStatus }),

  deleteCustomer: (id: number) =>
    api.delete(`/api/admin/customers/${id}`),

  getCustomersStats: () =>
    api.get('/api/admin/customers/stats'),

  // Промокоды
  getPromos: (params?: { isActive?: boolean; type?: string }) =>
    api.get('/api/admin/promos', { params }),

  getPromoById: (id: number) =>
    api.get(`/api/admin/promos/${id}`),

  createPromo: (data: any) =>
    api.post('/api/admin/promos', data),

  updatePromo: (id: number, data: any) =>
    api.put(`/api/admin/promos/${id}`, data),

  togglePromo: (id: number) =>
    api.patch(`/api/admin/promos/${id}/toggle`),

  deletePromo: (id: number) =>
    api.delete(`/api/admin/promos/${id}`),

  // Цвета упаковки
  getPackagingColors: () =>
    api.get('/api/admin/packaging-colors'),

  createPackagingColor: (data: { name: string; hexCode?: string; order?: number }) =>
    api.post('/api/admin/packaging-colors', data),

  updatePackagingColor: (id: number, data: any) =>
    api.put(`/api/admin/packaging-colors/${id}`, data),

  deletePackagingColor: (id: number) =>
    api.delete(`/api/admin/packaging-colors/${id}`),
};

// Утилита для получения URL изображения
export const getImageUrl = (path: string) => {
  if (!path) return '/placeholder.jpg';
  // Cloudinary или другие внешние URL - возвращаем как есть
  if (path.startsWith('http')) return path;
  // Legacy локальные пути - fallback на placeholder
  // (старые данные до миграции на Cloudinary)
  return '/placeholder.jpg';
};
