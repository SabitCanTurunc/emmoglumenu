import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Clock } from 'lucide-react';

export const metadata = {
  title: 'İletişim - Emmoğlu Menu',
  description: 'Emmoğlu iletişim sayfası',
};

export default function IletisimPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="bg-black py-20 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-70"
          style={{
            backgroundImage: "url('/images/gece-mekan.png')",
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-6xl font-zcool text-white">İletişim</h1>
          <div className="h-1 w-20 bg-[#bc906b] mx-auto mt-6"></div>
        </div>
      </section>

      {/* Contact Info Block (Cloned from homepage component style) */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center bg-gray-50 p-12 rounded-2xl shadow-sm border border-gray-100">
          
          {/* İletişim */}
          <div className="flex flex-col items-center">
            <div className="bg-[#bc906b]/10 p-4 rounded-full mb-6">
              <Mail className="w-8 h-8 text-[#bc906b]" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 font-zcool tracking-wider uppercase">İletişim</h3>
            <p className="text-gray-600 mb-2 font-medium">E-Posta: info@emmoglumenu.com</p>
            <p className="text-gray-600 mb-2 font-medium">Telefon: 0538 096 31 51</p>
          </div>

          {/* Adres */}
          <div className="flex flex-col items-center">
            <div className="mb-6 relative w-20 h-20">
              <Image 
                src="/images/icon.png"
                alt="Adres İkonu"
                fill
                style={{ objectFit: 'contain' }}
                unoptimized
              />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 font-zcool tracking-wider uppercase">Adres</h3>
            <p className="text-gray-600 mb-6 max-w-xs mx-auto font-medium">
              Havaalanı yolu üzeri Serinyol Mah. E5 Karayolu Cad. No:115 Antakya / Hatay
            </p>
            <Link 
              href="https://maps.app.goo.gl/cR12Sn7tBCK32k6L9"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 border-2 border-[#bc906b] text-[#bc906b] font-bold rounded-full hover:bg-[#bc906b] hover:text-white transition-colors duration-300"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Harita
            </Link>
          </div>

          {/* Çalışma Saatleri */}
          <div className="flex flex-col items-center">
            <div className="bg-[#bc906b]/10 p-4 rounded-full mb-6">
              <Clock className="w-8 h-8 text-[#bc906b]" />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-gray-900 font-zcool tracking-wider uppercase">Çalışma Saatlerimiz</h3>
            
            <ul className="w-full max-w-xs space-y-3">
              {[
                'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 
                'Cuma', 'Cumartesi', 'Pazar'
              ].map((day) => (
                <li key={day} className="flex justify-between text-gray-600 border-b border-gray-200 pb-2 last:border-0 font-medium">
                  <span>{day}</span>
                  <span>09:00 - 00:00</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
