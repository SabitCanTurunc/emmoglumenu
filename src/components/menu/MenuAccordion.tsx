'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronDown, X } from 'lucide-react';

export default function MenuAccordion({ menuData }: { menuData: any[] }) {
  // Store the currently open category indices in an array.
  // This allows multiple categories to be open at once, preventing the page from jumping when one closes.
  const [openIndices, setOpenIndices] = useState<number[]>([]); // all closed by default
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <>
      <div className="space-y-6">
        {menuData.map((category, index) => {
          const isOpen = openIndices.includes(index);

          return (
            <div key={index} className="scroll-mt-32" id={`category-${index}`}>
              {/* Category Header (Clickable) */}
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full relative h-32 md:h-40 rounded-xl overflow-hidden shadow-md flex items-center justify-between px-8 bg-gray-900 group cursor-pointer border-none text-left"
              >
                {category.image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-50 transition-opacity duration-300 group-hover:opacity-60"
                    style={{ backgroundImage: `url('${category.image}')` }}
                  />
                )}
                <h2 className="relative z-10 text-3xl md:text-5xl font-zcool text-white uppercase tracking-wider drop-shadow-lg">
                  {category.category}
                </h2>
                <div className="relative z-10 bg-black/40 p-3 rounded-full">
                  <ChevronDown
                    className={`w-8 h-8 text-white transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Product Grid (Collapsible) */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 transition-all duration-500 ease-in-out overflow-hidden ${
                  isOpen ? 'mt-6 opacity-100 max-h-[10000px]' : 'mt-0 opacity-0 max-h-0'
                }`}
              >
                {category.items.map((item: any, itemIndex: number) => (
                  <div
                    key={itemIndex}
                    onClick={() => setSelectedProduct(item)}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col cursor-pointer"
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
                          <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight mb-2">
                            {item.title}
                          </h3>
                          {item.description && (
                            <p className="text-gray-500 text-sm md:text-base line-clamp-3">
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
            </div>
          );
        })}
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
