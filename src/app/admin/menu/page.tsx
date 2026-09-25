'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ChevronRight } from 'lucide-react';
import CategoryModal from '@/components/admin/CategoryModal';
import Link from 'next/link';

export default function AdminMenuPage() {
  const [menuData, setMenuData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenuData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

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

  const handleSaveCategory = (categoryObj: { category: string; image: string }, oldName?: string) => {
    let newData = [...menuData];
    
    if (oldName) {
      // Edit
      const index = newData.findIndex((c) => c.category === oldName);
      if (index !== -1) {
        newData[index].category = categoryObj.category;
        newData[index].image = categoryObj.image;
      }
    } else {
      // Add
      newData.push({
        category: categoryObj.category,
        image: categoryObj.image,
        items: [],
      });
    }
    
    saveMenu(newData);
  };

  const handleDeleteCategory = (categoryName: string) => {
    if (confirm(`"${categoryName}" kategorisini ve içindeki tüm ürünleri silmek istediğinize emin misiniz?`)) {
      const newData = menuData.filter((c) => c.category !== categoryName);
      saveMenu(newData);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menü Kategorileri</h1>
          <p className="text-gray-400">Menünüzde bulunan tüm kategorileri buradan yönetebilirsiniz.</p>
        </div>
        <button
          onClick={openAddModal}
          className="w-full md:w-auto bg-[#bc906b] hover:bg-[#a57c5a] text-black font-semibold py-2.5 px-5 rounded-lg flex items-center justify-center space-x-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(188,144,107,0.2)]"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {menuData.map((cat, index) => (
            <div
              key={cat.category}
              className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center group hover:border-[#bc906b]/50 transition-colors"
            >
              <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                {/* Drag Handle Dummy */}
                <div className="text-gray-600 mr-4 cursor-grab hover:text-white transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                {/* Image Preview */}
                <div className="w-16 h-16 rounded-lg bg-[#0a0a0a] overflow-hidden flex-shrink-0 border border-[#333] mr-4 relative">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.category} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center">No Image</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-[#bc906b] transition-colors truncate">
                    {cat.category}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {cat.items ? cat.items.length : 0} Ürün
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 w-full md:w-auto md:ml-auto justify-between md:justify-end border-t border-[#333] md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2.5 bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition-colors tooltip-trigger"
                    title="Düzenle"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.category)}
                    className="p-2.5 bg-[#2a2a2a] hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors tooltip-trigger"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="hidden md:block w-px h-8 bg-[#333] mx-2"></div>

                <Link
                  href={`/admin/menu/${encodeURIComponent(cat.category)}`}
                  className="p-2.5 bg-[#bc906b]/10 text-[#bc906b] hover:bg-[#bc906b] hover:text-black rounded-lg transition-all flex items-center space-x-1"
                >
                  <span className="text-sm font-medium pl-1">Ürünler</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
          
          {menuData.length === 0 && (
            <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] border-dashed">
              <p className="text-gray-400">Henüz hiç kategori eklenmemiş.</p>
            </div>
          )}
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        initialData={editingCategory}
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
