'use client';

import { useState, useEffect } from 'react';
import { Utensils, Tag } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    categories: 0,
    items: 0,
  });

  useEffect(() => {
    // Fetch from our local API
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => {
        let itemsCount = 0;
        data.forEach((cat: { items?: any[] }) => {
          itemsCount += cat.items?.length || 0;
        });
        setStats({
          categories: data.length,
          items: itemsCount,
        });
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz</h1>
      <p className="text-gray-400 mb-8">Sistemdeki genel durumunuzu aşağıdan görebilirsiniz.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-14 h-14 bg-[#bc906b]/20 rounded-xl flex items-center justify-center text-[#bc906b]">
            <Tag className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Toplam Kategori</p>
            <p className="text-3xl font-bold text-white">{stats.categories}</p>
          </div>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 flex items-center space-x-4">
          <div className="w-14 h-14 bg-[#bc906b]/20 rounded-xl flex items-center justify-center text-[#bc906b]">
            <Utensils className="w-7 h-7" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Toplam Ürün</p>
            <p className="text-3xl font-bold text-white">{stats.items}</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4 text-white">Hızlı İşlemler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
        <Link href="/admin/menu" className="block">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#bc906b] hover:bg-[#bc906b]/5 transition-all group">
            <h3 className="font-semibold text-lg text-white group-hover:text-[#bc906b] transition-colors mb-1">
              Menü Yönetimine Git
            </h3>
            <p className="text-sm text-gray-400">Kategorileri ve ürünleri düzenle, yeni kayıt ekle.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
