"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X, Search, User } from "lucide-react"
import { useState, useEffect } from "react"
import { useCartStore } from "@/lib/cart-store"
import Image from "next/image"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    setMounted(true)
  }, [])

  const navLinks = [
    { href: "/katalog", label: "Каталог" },
    { href: "/katalog", label: "Букети" },
    { href: "/katalog", label: "Подаръци" },
    { href: "/kontakti", label: "Контакти" },
  ]

  return (
    <>
      <div className="bg-accent text-white text-center py-2 text-sm">Работим 7 дни в седмицата 10:00 - 19:00</div>

      <header className="absolute top-8 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="block -my-6">
              <div className="w-24 h-24 relative">
                <Image src="/logo.svg" alt="Izabel's Flowers" fill className="object-contain" priority />
              </div>
            </Link>

            {/* Desktop навигация */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-gray-900 transition text-sm font-medium tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-700 hover:text-gray-900 transition">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-700 hover:text-gray-900 transition">
                <User className="w-5 h-5" />
              </button>
              <Link href="/koshnica" className="relative p-2 text-gray-700 hover:text-gray-900 transition">
                <ShoppingCart className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Мобильное меню кнопка */}
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Мобильное меню */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-4 border-t border-gray-200">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-gray-700 hover:text-gray-900 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  )
}
