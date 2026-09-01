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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Area */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-32 sm:h-16 sm:w-40">
                <Image
                  src="https://emmoglumenu.com/wp-content/uploads/2026/04/cropped-emmoglu-1.png"
                  alt="Emmoğlu"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left' }}
                  priority
                  unoptimized // since we are loading an external image without configuring next.config.js yet
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`font-semibold transition-colors duration-200 hover:text-[#bc906b] ${
                  isScrolled ? 'text-gray-800' : 'text-gray-900'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Info Area & Mobile Toggle */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-gray-800 font-semibold">
              <Phone className="w-5 h-5 mr-2 text-[#bc906b]" />
              0538 096 31 51
            </div>
            
            <Link 
              href="/menu" 
              className="hidden md:inline-flex bg-[#bc906b] text-white px-5 py-2.5 rounded-full font-semibold hover:bg-[#a57d5a] transition-colors"
            >
              Menüyü İncele
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-800 hover:text-[#bc906b] focus:outline-none"
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
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg absolute w-full left-0 top-full border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-semibold text-gray-800 hover:text-[#bc906b] hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/menu"
              className="block mt-4 px-3 py-2 rounded-md text-base font-semibold text-white bg-[#bc906b] text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Menüyü İncele
            </Link>
            <div className="mt-4 px-3 py-2 flex items-center justify-center text-gray-800 font-semibold border-t border-gray-100 pt-4">
              <Phone className="w-5 h-5 mr-2 text-[#bc906b]" />
              0538 096 31 51
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
