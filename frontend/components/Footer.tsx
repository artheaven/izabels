import Link from "next/link"
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-accent text-white mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Google Maps - занимает 8 колонок */}
          <div className="md:col-span-8 relative h-64 rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.8!2d27.9147!3d43.2141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40a4538baee19d67%3A0x6a1fb55b8b9b8b1a!2z0YPQuy4g0KLQvtC00L7RgCDQoNCw0LTQtdCyINCf0LXQvdC10LIgMTMsINCS0LDRgNC90LA!5e0!3m2!1sbg!2sbg!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Izabel's Flowers Location"
            />
            {/* Оверлей с контактами поверх карты */}
            <div className="absolute bottom-0 left-0 p-4 bg-black/60 backdrop-blur-sm rounded-tr-lg">
              <div className="space-y-3 text-gray-200 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>ул. Тодор Радев Пенев 13, Варна</span>
                </div>
                <a
                  href="tel:+359888110801"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  +359 888 110 801
                </a>
                <a
                  href="mailto:info@izabels.bg"
                  className="flex items-center gap-2 hover:text-white transition"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  info@izabels.bg
                </a>
              </div>
            </div>
          </div>

          {/* Информация - 4 колонки */}
          <div className="md:col-span-4">
            <h3 className="text-white font-semibold mb-6 tracking-wide text-base">Информация</h3>
            <nav className="space-y-3">
              <Link href="/za-nas" className="block text-white hover:text-gray-200 transition text-base">
                Нашата история
              </Link>
              <Link href="/kontakti" className="block text-white hover:text-gray-200 transition text-base">
                Свържете се с нас
              </Link>
              <Link href="/svatbi" className="block text-white hover:text-gray-200 transition text-base">
                Сватби
              </Link>
              <Link href="/blog" className="block text-white hover:text-gray-200 transition text-base">
                Блог
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Нижняя часть футера */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Левый нижний угол - пункты обслуживания клиентов */}
            <div className="flex flex-wrap gap-4 text-[8pt] text-gray-400">
              <Link href="/refund-policy" className="hover:text-white transition">
                Политика за възстановяване
              </Link>
              <Link href="/terms" className="hover:text-white transition">
                Условия за ползване
              </Link>
              <Link href="/privacy" className="hover:text-white transition">
                Политика за поверителност
              </Link>
            </div>

            {/* Правый нижний угол - соцсети */}
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
