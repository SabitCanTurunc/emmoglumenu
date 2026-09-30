'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: { category: string; image: string; order: number }, oldCategoryName?: string) => void;
  initialData?: { category: string; image: string; order?: number } | null;
}

export default function CategoryModal({ isOpen, onClose, onSave, initialData }: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState(initialData?.category || '');
  const [categoryImage, setCategoryImage] = useState(initialData?.image || '');
  const [categoryOrder, setCategoryOrder] = useState<number>(initialData?.order || 0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.category);
      setCategoryImage(initialData.image);
      setCategoryOrder(initialData.order !== undefined ? initialData.order : 0);
    } else {
      setCategoryName('');
      setCategoryImage('');
      setCategoryOrder(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'category');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        setCategoryImage(data.url);
      } else {
        alert('Resim yüklenemedi.');
      }
    } catch (err) {
      console.error(err);
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    if (isUploading) {
      alert('Lütfen resim yüklemesinin bitmesini bekleyin.');
      return;
    }
    onSave({ category: categoryName, image: categoryImage, order: categoryOrder }, initialData?.category);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Kategori Adı
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
                placeholder="Örn: Kahvaltılıklar"
                required
              />
            </div>
            
            <div className="w-24 shrink-0">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Sıra No
              </label>
              <input
                type="number"
                value={categoryOrder}
                onChange={(e) => setCategoryOrder(Number(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Kapak Fotoğrafı
            </label>
            <div className="flex space-x-3 items-center">
              <input
                type="text"
                value={categoryImage}
                onChange={(e) => setCategoryImage(e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
                placeholder="https://... (veya bilgisayardan seçin)"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="bg-[#2a2a2a] hover:bg-[#333] text-[#bc906b] px-4 py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 border border-[#333]"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            {categoryImage && (
              <div className="mt-3 relative h-32 rounded-lg overflow-hidden border border-[#333]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={categoryImage}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#bc906b] hover:bg-[#a57c5a] text-black rounded-lg transition-colors font-semibold"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
