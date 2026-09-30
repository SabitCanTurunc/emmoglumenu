import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          
          {/* Logo */}
          <div className="flex flex-col justify-center items-center md:items-start h-full">
            <Link href="/" className="relative h-36 w-full max-w-[22rem] md:w-[21rem] md:h-28 block">
              <Image
                src="/images/emmoglu.png"
                alt="Emmoğlu"
                fill
                className="object-contain object-center md:object-left"
                unoptimized
              />
            </Link>
          </div>

          {/* Slogan */}
          <div className="lg:col-span-2 flex flex-col justify-center items-center md:items-start">
            <p className="text-gray-400 text-lg md:text-xl font-light leading-relaxed max-w-md text-center md:text-left">
              İştah açıcı ve damağınıza hitap edecek birbirinden özel lezzetlerimiz size çok yakın.
            </p>
          </div>

          {/* Sitemap */}
          <div className="flex flex-col items-center md:items-start">
            <h5 className="text-xl font-bold mb-6 text-white tracking-wide border-b border-[#bc906b] pb-2 inline-block">
              Hızlı Bağlantılar
            </h5>
            <ul className="flex flex-col space-y-4 md:space-y-3 w-full items-center md:items-start">
              <li>
                <Link href="/" className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-[#bc906b] group-hover:scale-150 transition-all duration-300"></span>
                  <span className="font-medium tracking-wide">Ana Sayfa</span>
                </Link>
              </li>
              <li>
                <Link href="/menu" className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-[#bc906b] group-hover:scale-150 transition-all duration-300"></span>
                  <span className="font-medium tracking-wide">Menü</span>
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="group flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-700 group-hover:bg-[#bc906b] group-hover:scale-150 transition-all duration-300"></span>
                  <span className="font-medium tracking-wide">İletişim</span>
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
