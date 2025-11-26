import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccessPage({ 
  params 
}: { 
  params: { orderNumber: string } 
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="w-20 h-20 text-green-500" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              Поръчката е приета!
            </h1>
            
            <p className="text-xl text-gray-600 mb-2">
              Номер на поръчката:
            </p>
            <p className="text-3xl font-bold text-primary mb-8">
              #{params.orderNumber}
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <p className="text-gray-700 mb-4">
                Благодарим Ви за поръчката! Ще се свържем с Вас скоро, 
                за да потвърдим детайлите.
              </p>
              <p className="text-gray-600">
                Информация за поръчката е изпратена на посочения от Вас имейл.
              </p>
            </div>
            
            <Link
              href="/"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition font-semibold"
            >
              Към началната страница
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

