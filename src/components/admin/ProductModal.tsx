'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { MenuItem, MenuNode } from '@/lib/menu';
import ImageUploadField from './ImageUploadField';
import CategorySelect from './CategorySelect';

export interface ProductFormData {
  title: string;
  price: string;
  description: string;
  image: string;
  category: string;
  isActive: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductFormData, id?: string) => void;
  // Düzenlenen ürün (yoksa yeni ekleme)
  initialData?: MenuItem | null;
  // Yeni ürün / düzenlenen ürün için seçili kategori
  categoryId: string;
  tree: MenuNode[];
}

// Her açılışta yeniden mount edilir, böylece form state'i başlangıç verisinden temiz başlar
export default function ProductModal(props: ProductModalProps) {
  if (!props.isOpen) return null;
  return <ProductForm {...props} />;
}

function ProductForm({ onClose, onSave, initialData, categoryId, tree }: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: initialData?.title || '',
    price: initialData?.price || '',
    description: initialData?.description || '',
    image: initialData?.image || '',
    category: categoryId,
    isActive: initialData ? initialData.isActive : true,
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim() || !formData.category) return;
    if (isUploading) {
      alert('Lütfen resim yüklemesinin bitmesini bekleyin.');
      return;
    }
    onSave(formData, initialData?.id);
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
          <h2 className="text-xl font-bold text-white">{initialData ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Kategori / Alt Kategori *</label>
            <CategorySelect
              value={formData.category}
              onChange={(id) => setFormData((prev) => ({ ...prev, category: id }))}
              tree={tree}
            />
            {initialData && formData.category !== categoryId && (
              <p className="text-xs text-[#bc906b] mt-1">Kaydettiğinizde ürün seçilen kategoriye taşınacak.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Ürün Adı *</label>
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

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Fiyat * (₺)</label>
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
            <label className="block text-sm font-medium text-gray-400 mb-1">Açıklama / İçindekiler</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors resize-none"
              placeholder="Örn: 🥚 Köy Yumurtası 🍅 Köy Domatesi..."
            />
          </div>

          <ImageUploadField
            label="Ürün Görsel URL"
            value={formData.image}
            onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
            type="product"
            onUploadingChange={setIsUploading}
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 accent-[#bc906b]"
            />
            <span className="text-sm text-gray-300">Menüde görünsün</span>
          </label>

          <div className="pt-4 flex space-x-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors font-medium"
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
