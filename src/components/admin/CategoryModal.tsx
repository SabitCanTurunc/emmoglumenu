'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { MenuNode } from '@/lib/menu';
import ImageUploadField from './ImageUploadField';
import CategorySelect from './CategorySelect';

export interface CategoryFormData {
  name: string;
  image: string;
  parent: string | null;
  isActive: boolean;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData, id?: string) => void;
  // Düzenlenen kategori (yoksa yeni ekleme)
  initialData?: MenuNode | null;
  // Yeni eklerken önceden seçili üst kategori (alt kategori ekle butonu)
  defaultParentId?: string | null;
  tree: MenuNode[];
}

// Her açılışta yeniden mount edilir, böylece form state'i başlangıç verisinden temiz başlar
export default function CategoryModal(props: CategoryModalProps) {
  if (!props.isOpen) return null;
  return <CategoryForm {...props} />;
}

function CategoryForm({ onClose, onSave, initialData, defaultParentId, tree }: CategoryModalProps) {
  const [name, setName] = useState(initialData?.category || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [parent, setParent] = useState(initialData ? initialData.parent || '' : defaultParentId || '');
  const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);
  const [isUploading, setIsUploading] = useState(false);

  // Alt kategorisi olan bir kategori başka bir kategorinin altına taşınamaz (en fazla 2 seviye)
  const hasChildren = !!initialData && initialData.children.length > 0;
  const isSub = !!parent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isUploading) {
      alert('Lütfen resim yüklemesinin bitmesini bekleyin.');
      return;
    }
    onSave({ name: name.trim(), image, parent: parent || null, isActive }, initialData?.id);
    onClose();
  };

  const title = initialData
    ? isSub ? 'Alt Kategoriyi Düzenle' : 'Kategoriyi Düzenle'
    : isSub ? 'Yeni Alt Kategori Ekle' : 'Yeni Kategori Ekle';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a] shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">
              {isSub ? 'Alt Kategori Adı' : 'Kategori Adı'} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
              placeholder={isSub ? 'Örn: Sıcak İçecekler' : 'Örn: Kahvaltılıklar'}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Üst Kategori</label>
            <CategorySelect
              value={parent}
              onChange={setParent}
              tree={tree}
              topLevelOnly
              excludeId={initialData?.id}
              noneLabel="— Ana kategori (üst kategori yok) —"
              disabled={hasChildren}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {hasChildren && (
              <p className="text-xs text-gray-500 mt-1">
                Bu kategorinin alt kategorileri olduğu için başka bir kategorinin altına taşınamaz.
              </p>
            )}
          </div>

          <ImageUploadField
            label="Kapak Fotoğrafı"
            value={image}
            onChange={setImage}
            type="category"
            onUploadingChange={setIsUploading}
            previewClassName="h-32 w-full"
          />

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 accent-[#bc906b]"
            />
            <span className="text-sm text-gray-300">Menüde görünsün</span>
          </label>

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
