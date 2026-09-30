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
        isScrolled ? 'top-4 px-4' : 'top-0 px-0 md:bg-gradient-to-b md:from-black/80 md:to-transparent'
      }`}
    >
      <div 
        className={`w-full transition-all duration-500 flex items-center justify-between ${
          isScrolled 
            ? 'max-w-5xl md:bg-black/70 md:backdrop-blur-xl md:border md:border-white/10 md:shadow-[0_8px_30px_rgb(0,0,0,0.5)] md:rounded-full px-4 md:px-6 py-2' 
            : 'container mx-auto px-4 sm:px-6 lg:px-8 py-5'
        }`}
      >
        {/* Logo Area */}
        <div className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
          <Link href="/" className="flex items-center">
            <div className={`relative transition-all duration-500 ${isScrolled ? 'h-12 w-36' : 'h-20 w-52'}`}>
              <Image
                src="/images/cropped-emmoglu-1.png"
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
          <a href="tel:+905380963151" className="hidden lg:flex items-center text-gray-200 font-semibold text-sm group cursor-pointer">
            <div className={`p-2 rounded-full mr-2 transition-colors duration-300 border ${
              isScrolled ? 'bg-transparent border-transparent' : 'bg-[#1a1a1a] border-[#333] group-hover:bg-[#bc906b]'
            }`}>
              <Phone className={`w-4 h-4 transition-colors duration-300 ${isScrolled ? 'text-[#bc906b]' : 'text-[#bc906b] group-hover:text-black'}`} />
            </div>
            <span className={`transition-colors duration-300 tracking-wider ${isScrolled ? 'group-hover:text-[#bc906b] text-xs' : 'group-hover:text-[#bc906b]'}`}>
              0538 096 31 51
            </span>
          </a>
          
          <Link 
            href="/menu" 
            className={`hidden md:inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 ${
              isScrolled 
                ? 'bg-[#bc906b] text-black hover:bg-white px-5 py-2 rounded-full text-xs shadow-lg hover:shadow-xl' 
                : 'bg-[#bc906b] text-black hover:bg-white px-6 py-2.5 rounded-full text-sm shadow-[0_0_20px_rgba(188,144,107,0.4)] hover:shadow-[0_0_30px_rgba(188,144,107,0.6)]'
            }`}
          >
            Menüyü İncele
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full text-white hover:text-[#bc906b] focus:outline-none transition-colors duration-200 bg-black/40 backdrop-blur-sm"
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

      {/* Mobile Menu Panel Sidebar */}
      <div 
        className={`md:hidden fixed inset-y-0 right-0 z-[70] w-72 bg-black/95 backdrop-blur-xl border-l border-[#333] transition-transform duration-300 shadow-2xl flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#222]">
          <span className="text-white font-zcool text-2xl tracking-widest uppercase">Menü</span>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-white hover:text-[#bc906b] transition-colors p-2 bg-white/10 rounded-full focus:outline-none"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 py-8 space-y-6 flex-grow overflow-y-auto">
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
            className="block w-full mt-8 py-4 rounded-xl text-center font-bold text-black bg-[#bc906b] hover:bg-[#a57d5a] transition-colors shadow-[0_0_15px_rgba(188,144,107,0.3)]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Menüyü İncele
          </Link>
          <a href="tel:+905380963151" className="mt-8 flex items-center justify-center text-gray-400 font-semibold pt-6 border-t border-[#222] hover:text-[#bc906b] transition-colors">
            <Phone className="w-5 h-5 mr-3 text-[#bc906b]" />
            <span className="tracking-widest">0538 096 31 51</span>
          </a>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
}
