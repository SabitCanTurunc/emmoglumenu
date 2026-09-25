'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Utensils, Settings, LogOut, Menu, X } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { name: 'Menü Yönetimi', icon: Utensils, href: '/admin/menu' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-[#0a0a0a] p-4 border-b border-[#2a2a2a] sticky top-0 z-40">
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-1 -ml-2">
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
        <Link href="/admin" onClick={() => setIsOpen(false)}>
          <h1 className="font-zcool text-2xl tracking-wider text-white">
            <span className="text-[#bc906b]">EMMOĞLU</span> ADMIN
          </h1>
        </Link>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/70 z-40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col w-64 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo Area (Desktop Only) */}
        <div className="hidden md:flex h-20 items-center justify-center border-b border-[#2a2a2a] shrink-0">
          <Link href="/admin">
            <h1 className="font-zcool text-2xl tracking-wider text-white">
              <span className="text-[#bc906b]">EMMOĞLU</span> ADMIN
            </h1>
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/admin');
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#bc906b] text-black font-semibold shadow-[0_0_15px_rgba(188,144,107,0.3)]' 
                    : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-[#bc906b]'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Area (Logout etc) */}
        <div className="p-4 border-t border-[#2a2a2a] shrink-0 space-y-2">
          <button
            onClick={async () => {
              await fetch('/api/logout', { method: 'POST' });
              window.location.href = '/admin';
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-[#1a1a1a]"
          >
            <LogOut className="w-5 h-5" />
            <span>Çıkış Yap</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-[#bc906b] transition-colors rounded-lg hover:bg-[#1a1a1a]"
          >
            <span className="w-5 h-5 flex items-center justify-center font-bold">🏠</span>
            <span>Siteye Dön</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
