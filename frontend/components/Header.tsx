"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X, Search, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/cart-store"
import Image from "next/image"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "/katalog", label: "Цветя", hasMegaMenu: true },
    { href: "/podaruci", label: "Подаръци" },
    { href: "/svatbi", label: "Сватби" },
    { href: "/korporativni", label: "Корпоративни" },
    { href: "/za-nas", label: "Нашата история" },
    { href: "/blog", label: "Блог" },
    { href: "/kontakti", label: "Контакти" },
  ]

  const megaMenuCategories = {
    occasion: {
      title: "Повод",
      items: [
        { label: "Рожден ден", href: "/katalog?occasion=birthday" },
        { label: "Любов и романтика", href: "/katalog?occasion=love" },
        { label: "Празник", href: "/katalog?occasion=celebration" },
        { label: "Благодаря", href: "/katalog?occasion=thankyou" },
        { label: "Ново бебе", href: "/katalog?occasion=newbaby" },
        { label: "Оздравяване", href: "/katalog?occasion=getwell" },
        { label: "Съболезнования", href: "/katalog?occasion=sympathy" },
        { label: "Дипломиране", href: "/katalog?occasion=graduation" },
        { label: "Коледа", href: "/katalog?occasion=christmas" },
      ],
    },
    colour: {
      title: "Цвят",
      items: [
        { label: "Бял", href: "/katalog?color=white" },
        { label: "Розов", href: "/katalog?color=pink" },
        { label: "Червен", href: "/katalog?color=red" },
        { label: "Зелен", href: "/katalog?color=green" },
      ],
    },
    style: {
      title: "Стил",
      items: [
        { label: "Букети", href: "/katalog?style=bouquets" },
        { label: "Вази", href: "/katalog?style=vases" },
        { label: "Кутии", href: "/katalog?style=boxes" },
        { label: "Торби", href: "/katalog?style=bags" },
        { label: "Подаръчни комплекти", href: "/katalog?style=giftsets" },
      ],
    },
    flowerType: {
      title: "Вид цвете",
      items: [
        { label: "Рози", href: "/katalog?flower=roses" },
        { label: "Хризантеми", href: "/katalog?flower=chrysanthemums" },
        { label: "Карамфили", href: "/katalog?flower=carnations" },
        { label: "Виж всички", href: "/katalog" },
      ],
    },
  }

  return (
    <>
      <div className="bg-gray-100 text-accent text-center py-1.5 text-xs">Работим 7 дни в седмицата 10:00 - 19:00</div>

      <header className="sticky top-0 z-50 bg-accent border-b border-accent">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center">
              <Image
                src="/isabels-flower-logo.svg"
                alt="Isabel's Flower"
                width={180}
                height={40}
                className="h-8 w-auto brightness-0 invert"
                priority
              />
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <div key={link.href} className="relative">
                  {link.hasMegaMenu ? (
                    <button
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                      className="text-white hover:text-gray-200 transition text-sm font-medium tracking-wide border-b-2 border-transparent hover:border-white pb-1"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-white hover:text-gray-200 transition text-sm font-medium tracking-wide border-b-2 border-transparent hover:border-white pb-1"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button className="hidden lg:block p-2 text-white hover:text-gray-200 transition">
                <Search className="w-5 h-5" />
              </button>
              <button className="hidden lg:block p-2 text-white hover:text-gray-200 transition">
                <User className="w-5 h-5" />
              </button>
              <Link href="/koshnica" className="relative p-2 text-white hover:text-gray-200 transition">
                <ShoppingCart className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-accent text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button className="lg:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 space-y-4 border-t border-white/20">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-white hover:text-gray-200 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {megaMenuOpen && (
          <div
            className="absolute left-0 w-full bg-pink-50 shadow-lg border-t border-gray-200"
            onMouseEnter={() => setMegaMenuOpen(true)}
            onMouseLeave={() => setMegaMenuOpen(false)}
          >
            <div className="container mx-auto px-4 py-12">
              <div className="grid grid-cols-5 gap-8">
                {/* Categories columns */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">{megaMenuCategories.occasion.title}</h3>
                  <ul className="space-y-2">
                    {megaMenuCategories.occasion.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-700 hover:text-accent transition"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">{megaMenuCategories.colour.title}</h3>
                  <ul className="space-y-2">
                    {megaMenuCategories.colour.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-700 hover:text-accent transition"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">{megaMenuCategories.style.title}</h3>
                  <ul className="space-y-2">
                    {megaMenuCategories.style.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-700 hover:text-accent transition"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">{megaMenuCategories.flowerType.title}</h3>
                  <ul className="space-y-2">
                    {megaMenuCategories.flowerType.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-sm text-gray-700 hover:text-accent transition"
                          onClick={() => setMegaMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Featured product image */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg mb-4 relative overflow-hidden">
                    <Image
                      src="/pink-flower-bouquet-in-vase.jpg"
                      alt="Featured bouquet"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <Link
                    href="/katalog"
                    className="text-sm font-medium text-foreground hover:text-accent transition"
                    onClick={() => setMegaMenuOpen(false)}
                  >
                    Пазарувай всички цветя
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
