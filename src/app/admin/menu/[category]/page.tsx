'use client';

import { useState, useEffect, use } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ArrowLeft } from 'lucide-react';
import ProductModal from '@/components/admin/ProductModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CategoryProductsPage({ params }: { params: Promise<{ category: string }> }) {
  const router = useRouter();
  const { category } = use(params);
  const decodedCategory = decodeURIComponent(category);
  
  const [menuData, setMenuData] = useState<any[]>([]);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number>(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenuData(data);
      
      const index = data.findIndex((c: any) => c.category === decodedCategory);
      if (index !== -1) {
        setCurrentCategoryIndex(index);
      } else {
        // Kategori bulunamadı
        router.push('/admin/menu');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [decodedCategory, router]);

  const [isSaving, setIsSaving] = useState(false);

  const saveMenu = async (newData: any[]) => {
    setIsSaving(true);
    try {
      await fetch('/api/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
      });
      setMenuData(newData);
    } catch (error) {
      console.error('Failed to save menu data', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveProduct = (productData: any, oldTitle?: string) => {
    if (currentCategoryIndex === -1) return;
    
    let newData = [...menuData];
    let items = [...(newData[currentCategoryIndex].items || [])];
    
    if (oldTitle) {
      // Edit
      const itemIndex = items.findIndex((i) => i.title === oldTitle);
      if (itemIndex !== -1) {
        items[itemIndex] = { ...items[itemIndex], ...productData };
      }
    } else {
      // Add
      items.push(productData);
    }
    
    newData[currentCategoryIndex].items = items.sort((a, b) => (a.order || 0) - (b.order || 0));
    saveMenu(newData);
  };

  const handleDeleteProduct = (title: string) => {
    if (currentCategoryIndex === -1) return;

    if (confirm(`"${title}" ürününü silmek istediğinize emin misiniz?`)) {
      let newData = [...menuData];
      let items = newData[currentCategoryIndex].items.filter((i: any) => i.title !== title);
      newData[currentCategoryIndex].items = items;
      saveMenu(newData);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentItems = currentCategoryIndex !== -1 ? (menuData[currentCategoryIndex].items || []) : [];

  return (
    <div className="animate-in fade-in duration-500">
      <Link href="/admin/menu" className="inline-flex items-center space-x-2 text-gray-400 hover:text-[#bc906b] transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        <span>Kategorilere Dön</span>
      </Link>

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2 break-all">
            <span className="text-[#bc906b]">{decodedCategory}</span> Ürünleri
          </h1>
          <p className="text-gray-400">Bu kategoriye ait ürünleri buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full md:w-auto bg-[#bc906b] hover:bg-[#a57c5a] text-black font-semibold py-2.5 px-5 rounded-lg flex items-center justify-center space-x-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(188,144,107,0.2)]"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Ürün Ekle</span>
        </button>
      </div>

      <div className="space-y-4">
        {currentItems.map((item: any, index: number) => (
          <div
            key={item.title + index}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center group hover:border-[#bc906b]/50 transition-colors"
          >
            <div className="flex items-start w-full md:w-auto mb-4 md:mb-0 flex-1">
              {/* Order Display */}
              <div className="w-8 h-8 rounded bg-[#2a2a2a] flex items-center justify-center text-[#bc906b] font-bold mr-4 mt-4 md:mt-2 shrink-0 text-sm border border-[#333]">
                {item.order !== undefined ? item.order : index}
              </div>
              
              {/* Image Preview */}
              <div className="w-16 h-16 rounded-lg bg-[#0a0a0a] overflow-hidden flex-shrink-0 border border-[#333] mr-4 relative">
                {item.image && !item.image.includes('placeholder.webp') ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center bg-[#2a2a2a]">No Image</div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#bc906b] transition-colors line-clamp-2 sm:line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-[#bc906b] font-bold whitespace-nowrap sm:ml-2 mt-1 sm:mt-0">
                    {item.price} ₺
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {item.description || 'Açıklama yok'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 w-full md:w-auto shrink-0 border-t border-[#333] md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
              <button
                onClick={() => openEditModal(item)}
                className="p-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition-colors tooltip-trigger flex-1 md:flex-none flex justify-center"
                title="Düzenle"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteProduct(item.title)}
                className="p-2.5 bg-[#2a2a2a] hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors tooltip-trigger flex-1 md:flex-none flex justify-center"
                title="Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {currentItems.length === 0 && (
          <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] border-dashed">
            <p className="text-gray-400">Bu kategoride henüz hiç ürün yok.</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        initialData={editingProduct}
      />

      {isSaving && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-[#bc906b] shadow-lg rounded-xl p-4 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm font-medium">Değişiklikler Kaydediliyor...</p>
          </div>
        </div>
      )}
    </div>
  );
}
