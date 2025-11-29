"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  currentPage?: string
}

// Маппинг путей на болгарские названия
const pathNames: Record<string, string> = {
  "": "Начало",
  "katalog": "Каталог",
  "produkti": "Продукти",
  "koshnica": "Количка",
  "porachka": "Поръчка",
  "kontakti": "Контакти",
  "profil": "Профил",
  "vhod": "Вход",
  "registracia": "Регистрация",
}

export default function Breadcrumbs({ items, currentPage }: BreadcrumbsProps) {
  const pathname = usePathname()
  
  // Не показываем на главной странице
  if (pathname === "/") return null
  
  // Если переданы кастомные items, используем их
  if (items && items.length > 0) {
    return (
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-2">
        <ol className="flex items-center space-x-1 text-xs text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-900 transition">
              Начало
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center space-x-1">
              <ChevronRight className="w-3 h-3" />
              {item.href ? (
                <Link href={item.href} className="hover:text-gray-900 transition">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700">{item.label}</span>
              )}
            </li>
          ))}
          {currentPage && (
            <li className="flex items-center space-x-1">
              <ChevronRight className="w-3 h-3" />
              <span className="text-gray-700">{currentPage}</span>
            </li>
          )}
        </ol>
      </nav>
    )
  }
  
  // Автоматическая генерация из pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  
  return (
    <nav aria-label="Breadcrumb" className="container mx-auto px-4 py-2">
      <ol className="flex items-center space-x-1 text-xs text-gray-500">
        <li>
          <Link href="/" className="hover:text-gray-900 transition">
            Начало
          </Link>
        </li>
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/")
          const isLast = index === pathSegments.length - 1
          const label = pathNames[segment] || decodeURIComponent(segment)
          
          return (
            <li key={segment} className="flex items-center space-x-1">
              <ChevronRight className="w-3 h-3" />
              {isLast ? (
                <span className="text-gray-700">{currentPage || label}</span>
              ) : (
                <Link href={href} className="hover:text-gray-900 transition">
                  {label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

