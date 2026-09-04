import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Clock } from 'lucide-react';

export default function ContactInfo() {
  return (
    <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          
          {/* İletişim */}
          <div className="flex flex-col items-center">
            <div className="bg-[#bc906b]/10 p-4 rounded-full mb-6">
              <Mail className="w-8 h-8 text-[#bc906b]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">İletişim</h3>
            <p className="text-gray-600 mb-2">E-Posta: info@emmoglumenu.com</p>
            <p className="text-gray-600 mb-2">Telefon: 0538 096 31 51</p>
          </div>

          {/* Adres */}
          <div className="flex flex-col items-center">
            <div className="mb-6 relative w-20 h-20">
              <Image 
                src="https://emmoglumenu.com/wp-content/uploads/2019/06/icon.png"
                alt="Adres İkonu"
                fill
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Adres</h3>
            <p className="text-gray-600 mb-6 max-w-xs mx-auto">
              Havaalanı yolu üzeri Serinyol Mah. E5 Karayolu Cad. No:115 Antakya / Hatay
            </p>
            <Link 
              href="https://maps.app.goo.gl/25sghNNyKfzypFrk6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-2 border-2 border-[#bc906b] text-[#bc906b] font-semibold rounded-full hover:bg-[#bc906b] hover:text-white transition-colors duration-300"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Harita
            </Link>
          </div>

          {/* Çalışma Saatleri */}
          <div className="flex flex-col items-center">
            <div className="bg-[#bc906b]/10 p-4 rounded-full mb-6">
              <Clock className="w-8 h-8 text-[#bc906b]" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900">Açılış Kapanış Saatleri</h3>
            
            <ul className="w-full max-w-xs space-y-3">
              {[
                'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 
                'Cuma', 'Cumartesi', 'Pazar'
              ].map((day) => (
                <li key={day} className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 last:border-0">
                  <span className="font-medium">{day}</span>
                  <span>09:00 - 00:00</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
