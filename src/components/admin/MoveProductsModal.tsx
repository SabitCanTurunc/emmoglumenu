'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { MenuNode } from '@/lib/menu';
import CategorySelect from './CategorySelect';

interface MoveProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (categoryId: string) => void;
  count: number;
  currentCategoryId: string;
  tree: MenuNode[];
}

export default function MoveProductsModal(props: MoveProductsModalProps) {
  if (!props.isOpen) return null;
  return <MoveForm {...props} />;
}

function MoveForm({ onClose, onMove, count, currentCategoryId, tree }: MoveProductsModalProps) {
  const [target, setTarget] = useState(currentCategoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-[#2a2a2a]">
          <h2 className="text-xl font-bold text-white">{count} Ürünü Taşı</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Hedef Kategori / Alt Kategori</label>
            <CategorySelect value={target} onChange={setTarget} tree={tree} />
          </div>
          <div className="pt-2 flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={() => {
                onMove(target);
                onClose();
              }}
              disabled={!target || target === currentCategoryId}
              className="flex-1 py-3 px-4 bg-[#bc906b] hover:bg-[#a57c5a] text-black rounded-lg transition-colors font-semibold disabled:opacity-50"
            >
              Taşı
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
