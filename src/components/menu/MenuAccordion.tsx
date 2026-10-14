'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, Search, X } from 'lucide-react';
import type { MenuItem, MenuNode } from '@/lib/menu';

const normalize = (text: string) => text.toLocaleLowerCase('tr-TR').trim();

export default function MenuAccordion({ menuData }: { menuData: MenuNode[] }) {
  // Açık ana kategoriler (birden fazlası aynı anda açık kalabilir, sayfa zıplamaz).
  const [openIds, setOpenIds] = useState<string[]>([]); // hepsi kapalı başlar
  // Kapatılan alt kategoriler (alt kategoriler varsayılan olarak açıktır)
  const [closedSubIds, setClosedSubIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [query, setQuery] = useState('');

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((i) => i !== id) : [...list, id];

  const q = normalize(query);
  const isSearching = q.length > 0;

  // Arama: eşleşen ürünleri içeren dalları göster, kategori adı eşleşirse tamamını göster
  const visibleMenu = useMemo(() => {
    if (!isSearching) return menuData;
    const matches = (item: MenuItem) =>
      normalize(item.title).includes(q) || normalize(item.description || '').includes(q);

    return menuData
      .map((cat) => {
        const catMatches = normalize(cat.category).includes(q);
        const items = catMatches ? cat.items : cat.items.filter(matches);
        const children = cat.children
          .map((sub) => {
            const subMatches = catMatches || normalize(sub.category).includes(q);
            return { ...sub, items: subMatches ? sub.items : sub.items.filter(matches) };
          })
          .filter((sub) => sub.items.length > 0);
        return { ...cat, items, children };
      })
      .filter((cat) => cat.items.length > 0 || cat.children.length > 0);
  }, [menuData, q, isSearching]);

  const renderProducts = (items: MenuItem[]) => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => setSelectedProduct(item)}
          className="bg-gray-900 md:bg-white rounded-xl shadow-sm border border-gray-800 md:border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col cursor-pointer"
        >
          <div className="flex p-4 gap-4 h-full">
            {/* Product Image */}
            {item.image && (
              <div className="flex-shrink-0 relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
            )}

            {/* Product Info */}
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white md:text-gray-900 leading-tight mb-2">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-gray-400 md:text-gray-500 text-sm md:text-base line-clamp-3">
                    {item.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-end">
                <span className="text-xl font-bold text-[#bc906b]">
                  {item.price} ₺
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Arama */}
      <div className="relative mb-6 max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Menüde ara..."
          aria-label="Menüde ara"
          className="w-full pl-12 pr-4 py-3 rounded-full bg-gray-900 md:bg-white text-white md:text-gray-900 placeholder-gray-500 border border-gray-800 md:border-gray-200 focus:outline-none focus:border-[#bc906b] transition-colors"
        />
      </div>

      <div className="space-y-6">
        {visibleMenu.map((category) => {
          const isOpen = isSearching || openIds.includes(category.id);
          const total =
            category.items.length + category.children.reduce((sum, c) => sum + c.items.length, 0);

          return (
            <div key={category.id} className="scroll-mt-32" id={`category-${category.id}`}>
              {/* Category Header (Clickable) */}
              <button
                onClick={() => setOpenIds((prev) => toggle(prev, category.id))}
                aria-expanded={isOpen}
                className="w-full relative h-32 md:h-40 rounded-xl overflow-hidden shadow-md flex items-center justify-between px-8 bg-gray-900 group cursor-pointer border-none text-left"
              >
                {category.image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 transition-opacity duration-300 group-hover:opacity-60"
                    style={{ backgroundImage: `url('${category.image}')` }}
                  />
                )}
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-zcool text-white uppercase tracking-wider drop-shadow-lg">
                    {category.category}
                  </h2>
                  <p className="mt-1 text-sm text-white/80 drop-shadow">
                    {total} ürün
                    {category.children.length > 0 && ` · ${category.children.length} alt kategori`}
                  </p>
                </div>
                <div className="relative z-10 bg-black/40 p-3 rounded-full">
                  <ChevronDown
                    className={`w-8 h-8 text-white transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Content (Collapsible) */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isOpen ? 'mt-6 opacity-100 max-h-[100000px]' : 'mt-0 opacity-0 max-h-0'
                }`}
              >
                {category.items.length > 0 && renderProducts(category.items)}

                {category.children.map((sub) => {
                  const subOpen = isSearching || !closedSubIds.includes(sub.id);
                  return (
                    <div key={sub.id} className={category.items.length > 0 ? 'mt-8' : 'mb-8 last:mb-0'}>
                      <button
                        onClick={() => setClosedSubIds((prev) => toggle(prev, sub.id))}
                        aria-expanded={subOpen}
                        className="w-full flex items-center justify-between gap-4 pb-3 mb-5 border-b-2 border-[#bc906b]/40 text-left cursor-pointer"
                      >
                        <h3 className="text-2xl md:text-3xl font-zcool text-white md:text-gray-900 uppercase tracking-wide">
                          {sub.category}
                          <span className="ml-3 text-sm font-sans normal-case tracking-normal text-gray-400">
                            {sub.items.length} ürün
                          </span>
                        </h3>
                        <ChevronDown
                          className={`w-6 h-6 shrink-0 text-[#bc906b] transition-transform duration-300 ${
                            subOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {subOpen && renderProducts(sub.items)}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {visibleMenu.length === 0 && (
          <p className="text-center text-gray-400 py-12">
            {isSearching ? `"${query}" için sonuç bulunamadı.` : 'Menü şu anda boş.'}
          </p>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              {selectedProduct.image && (
                <div className="relative w-full aspect-square max-h-80 bg-gray-100 flex-shrink-0 mx-auto">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized
                  />
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4 gap-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    {selectedProduct.title}
                  </h3>
                  <span className="text-2xl md:text-3xl font-bold text-[#bc906b] whitespace-nowrap">
                    {selectedProduct.price} ₺
                  </span>
                </div>
                
                {selectedProduct.description && (
                  <div className="text-gray-600 text-base md:text-lg leading-relaxed mt-4 whitespace-pre-wrap">
                    {selectedProduct.description}
                  </div>
                )}
                
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="mt-8 w-full bg-gray-900 text-white font-bold py-4 px-4 rounded-xl hover:bg-gray-800 transition-colors duration-300 text-lg"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
