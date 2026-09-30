import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          
          {/* Logo */}
          <div className="flex flex-col justify-center items-start h-full">
            <Link href="/" className="relative h-28 w-[21rem] block">
              <Image
                src="/images/emmoglu.png"
                alt="Emmoğlu"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                unoptimized
              />
            </Link>
          </div>

          {/* Slogan */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-md">
              İştah açıcı ve damağınıza hitap edecek birbirinden özel lezzetlerimiz size çok yakın.
            </p>
          </div>

          {/* Sitemap */}
          <div>
            <h5 className="text-xl font-bold mb-6 text-white tracking-wide border-b border-[#bc906b] pb-2 inline-block">
              Site Haritası
            </h5>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#bc906b] transition-colors duration-200">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/menu" className="text-gray-400 hover:text-[#bc906b] transition-colors duration-200">
                  Menü
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-400 hover:text-[#bc906b] transition-colors duration-200">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <a 
              href="https://hgtajans.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-14 h-14">
                <Image 
                  src="/images/ajans-logo.png"
                  alt="Ajans"
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
            </a>
            <span>Profesyonel Yazılım Sistemleri</span>
          </div>
          <div>
            &copy; {currentYear} Emmoğlu. Tüm Hakları Saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
}
