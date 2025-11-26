'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Box, 
  Gift, 
  ShoppingBag, 
  Users,
  Tag,
  Palette,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Archive
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Проверяем авторизацию
    if (pathname !== '/admin/login') {
      const token = localStorage.getItem('admin_token');
      const userData = localStorage.getItem('admin_user');

      if (!token) {
        router.push('/admin/login');
      } else if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin/login');
  };

  // Если это страница логина, не показываем меню
  if (pathname === '/admin/login') {
    return children;
  }

  const menuGroups = [
    {
      title: 'Торговля',
      items: [
        { href: '/admin/sales', label: 'Продажи', icon: ShoppingCart },
        { href: '/admin/orders', label: 'Заказы', icon: ShoppingBag },
      ],
    },
    {
      title: 'Каталог',
      items: [
        { 
          href: '/admin/catalog/products', 
          label: 'Товары', 
          icon: Gift,
          subItems: [
            { href: '/admin/catalog/products?category=bouquets', label: 'Букети' },
          ]
        },
        { 
          href: '/admin/catalog/inventory', 
          label: 'Инвентарь', 
          icon: Archive,
          subItems: [
            { href: '/admin/catalog/inventory?category=flowers', label: 'Цветы' },
            { href: '/admin/catalog/inventory?category=packaging', label: 'Упаковка' },
          ]
        },
      ],
    },
    {
      title: 'Маркетинг',
      items: [
        { href: '/admin/promos', label: 'Промокоды', icon: Tag },
        { href: '/admin/customers', label: 'Клиенты', icon: Users },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
            <Link href="/admin" className="text-xl font-bold text-primary">
              Izabels Admin
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-gray-700">
                {user.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            menuOpen ? 'block' : 'hidden'
          } lg:block w-64 bg-white shadow-lg min-h-[calc(100vh-60px)] fixed lg:relative z-40`}
        >
          <nav className="p-4">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname.startsWith(item.href);

                    return (
                      <div key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                            isActive
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                        {/* Подкатегории */}
                        {item.subItems && isActive && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-600 hover:text-primary transition"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

