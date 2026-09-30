'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Upload } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any, oldTitle?: string) => void;
  initialData?: any | null;
}

export default function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    price: initialData?.price || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    order: initialData?.order || 0,
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        price: initialData.price || '',
        description: initialData.description || '',
        image: initialData.image || '',
        order: initialData.order !== undefined ? initialData.order : 0,
      });
    } else {
      setFormData({
        title: '',
        price: '',
        description: '',
        image: '',
        order: 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('type', 'product');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
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
    if (!formData.title || !formData.price) return;
    if (isUploading) {
      alert('Lütfen resim yüklemesinin bitmesini bekleyin.');
      return;
    }
    onSave(formData, initialData?.title);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a] shrink-0">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
                placeholder="Örn: Sucuklu Köy Menemeni"
                required
              />
            </div>
            <div className="w-24 shrink-0">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Sıra No
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Fiyat * (₺)
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
              placeholder="Örn: 300.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Açıklama / İçindekiler
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors resize-none"
              placeholder="Örn: 🥚 Köy Yumurtası 🍅 Köy Domatesi..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              Ürün Görsel URL
            </label>
            <div className="flex space-x-3 items-center">
              <input
                type="text"
                name="image"
                value={formData.image}
                onChange={handleChange}
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
            {formData.image && (
              <div className="mt-3 relative h-32 w-32 rounded-lg overflow-hidden border border-[#333]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div className="pt-4 flex space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 py-3 px-4 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 py-3 px-4 bg-[#bc906b] hover:bg-[#a57c5a] text-black rounded-lg transition-colors font-semibold disabled:opacity-50"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
