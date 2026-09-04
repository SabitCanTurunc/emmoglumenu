import Image from 'next/image';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Meryem Geldi',
      text: 'Sadece yemekler değil, çalışanların güler yüzü ve hızlı servisi de bizi çok mutlu etti. Mekanın atmosferi çok huzurlu, hafta sonu kalabalığına rağmen servis hiç aksamadı.',
    },
    {
      name: 'Özgür Bilici',
      text: 'Güleryüzlü personel, yemek kalitesi ve uygun fiyat bu üç özelliğin bir arda bulunduğu bölgedeki çok nadir mekanlardan birisi. Kesinlikle tavsiye ederim.',
    },
    {
      name: 'Burak Bölükbaşı',
      text: 'Kaliteli nezih ve lezzetli bir mekan. Personelleri kibar anlayışlı ve profesyonel. Tatlıları enfesssss.',
    }
  ];

  return (
    <section className="py-0 bg-white">
      <div className="flex flex-col lg:flex-row min-h-[600px]">
        {/* Left Image Side */}
        <div className="lg:w-1/2 relative min-h-[400px] lg:min-h-full">
          <Image
            src="https://emmoglumenu.com/wp-content/uploads/2026/04/4-0902-1024x1024.jpg"
            alt="Emmoğlu Lezzetleri"
            fill
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        </div>

        {/* Right Testimonials Side */}
        <div className="lg:w-1/2 bg-[#bc906b] text-white p-8 md:p-16 flex items-center justify-center">
          <div className="max-w-2xl w-full">
            <h2 className="text-4xl md:text-5xl font-zcool mb-12 text-center drop-shadow-sm">
              Müşterilerimiz Neler Söylüyor?
            </h2>
            
            <div className="space-y-8">
              {testimonials.map((item, index) => (
                <div key={index} className="bg-white/10 p-6 rounded-xl border border-white/20 backdrop-blur-sm">
                  <Quote className="w-8 h-8 text-white/50 mb-4" />
                  <p className="text-lg leading-relaxed mb-6 font-light">
                    "{item.text}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-1 bg-white/50 mr-4" />
                    <h4 className="font-bold tracking-wider uppercase text-sm">
                      {item.name}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
