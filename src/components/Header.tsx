'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Galeri', href: '/galeri' },
    { name: 'İletişim', href: '/iletisim' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-500 flex justify-center ${
        isScrolled ? 'top-4 px-4' : 'top-0 px-0'
      }`}
    >
      <div 
        className={`w-full transition-all duration-500 flex items-center justify-between ${
          isScrolled 
            ? 'max-w-5xl bg-black/70 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-6 py-2' 
            : 'container mx-auto px-4 sm:px-6 lg:px-8 py-5 bg-gradient-to-b from-black/80 to-transparent border-b border-transparent'
        }`}
      >
        {/* Logo Area */}
        <div className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
          <Link href="/" className="flex items-center">
            <div className={`relative transition-all duration-500 ${isScrolled ? 'h-10 w-28' : 'h-14 w-36'}`}>
              <Image
                src="https://emmoglumenu.com/wp-content/uploads/2026/04/cropped-emmoglu-1.png"
                alt="Emmoğlu"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left' }}
                priority
                unoptimized
              />
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`group relative font-semibold transition-colors duration-300 tracking-wide uppercase ${
                isScrolled ? 'text-gray-300 hover:text-[#bc906b] text-xs' : 'text-gray-200 hover:text-white text-sm'
              }`}
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#bc906b] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Right Info Area & Mobile Toggle */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          <div className="hidden lg:flex items-center text-gray-200 font-semibold text-sm group cursor-pointer">
            <div className={`p-2 rounded-full mr-2 transition-colors duration-300 border ${
              isScrolled ? 'bg-transparent border-transparent' : 'bg-[#1a1a1a] border-[#333] group-hover:bg-[#bc906b]'
            }`}>
              <Phone className={`w-4 h-4 transition-colors duration-300 ${isScrolled ? 'text-[#bc906b]' : 'text-[#bc906b] group-hover:text-black'}`} />
            </div>
            <span className={`transition-colors duration-300 tracking-wider ${isScrolled ? 'group-hover:text-[#bc906b] text-xs' : 'group-hover:text-[#bc906b]'}`}>
              0538 096 31 51
            </span>
          </div>
          
          <Link 
            href="/menu" 
            className={`hidden md:inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 ${
              isScrolled 
                ? 'bg-[#bc906b] text-black hover:bg-white px-5 py-2 rounded-full text-xs shadow-lg hover:shadow-xl' 
                : 'bg-transparent border border-[#bc906b] text-[#bc906b] hover:bg-[#bc906b] hover:text-black px-6 py-2.5 rounded-full text-sm hover:shadow-[0_0_20px_rgba(188,144,107,0.4)]'
            }`}
          >
            Menüyü İncele
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-white hover:text-[#bc906b] focus:outline-none transition-colors duration-200 bg-black/20"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Menüyü aç</span>
            {isMobileMenuOpen ? (
              <X className="block h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="block h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div 
        className={`md:hidden absolute w-full left-0 top-full bg-black/95 backdrop-blur-xl border-t border-[#333] transition-all duration-300 origin-top overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-6 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block py-3 text-lg font-semibold text-gray-300 hover:text-[#bc906b] border-b border-[#222] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/menu"
            className="block w-full mt-6 py-3 rounded-xl text-center font-bold text-black bg-[#bc906b] hover:bg-[#a57d5a] transition-colors shadow-[0_0_15px_rgba(188,144,107,0.3)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Menüyü İncele
          </Link>
          <div className="mt-6 flex items-center justify-center text-gray-400 font-semibold pt-4">
            <Phone className="w-5 h-5 mr-3 text-[#bc906b]" />
            <span className="tracking-widest">0538 096 31 51</span>
          </div>
        </div>
      </div>
    </header>
  );
}
