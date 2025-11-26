import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-12">Контакти</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Информация за контакти */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Телефон</h3>
                  <p className="text-gray-700">+359 888 123 456</p>
                  <p className="text-gray-500 text-sm">Обаждайте се всеки ден</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Email</h3>
                  <p className="text-gray-700">info@izabels.com</p>
                  <p className="text-gray-500 text-sm">Отговаряме в рамките на 24 часа</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Адрес</h3>
                  <p className="text-gray-700">София, ул. Примерна 123</p>
                  <p className="text-gray-500 text-sm">Центъра на града</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Работно време</h3>
                  <p className="text-gray-700">Понеделник - Петък: 9:00 - 19:00</p>
                  <p className="text-gray-700">Събота - Неделя: 10:00 - 18:00</p>
                </div>
              </div>
            </div>

            {/* Карта (placeholder) */}
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <p className="text-gray-500">Карта (Google Maps)</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

