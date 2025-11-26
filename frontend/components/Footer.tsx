import Link from 'next/link';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* За нас */}
          <div>
            <h3 className="text-xl font-bold mb-4">Izabels</h3>
            <p className="text-gray-400">
              Магазин за цветя и подаръци с доставка в София.
              Свежи букети от професионални флористи.
            </p>
          </div>

          {/* Контакти */}
          <div>
            <h3 className="text-xl font-bold mb-4">Контакти</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5" />
                <span>+359 888 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5" />
                <span>info@izabels.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5" />
                <span>София, ул. Примерна 123</span>
              </div>
            </div>
          </div>

          {/* Социални мрежи */}
          <div>
            <h3 className="text-xl font-bold mb-4">Следвайте ни</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-primary transition"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-primary transition"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Izabels. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
}

