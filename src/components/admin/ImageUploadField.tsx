'use client';

import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { compressImage } from '@/lib/compressImage';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  type: 'category' | 'product';
  onUploadingChange?: (uploading: boolean) => void;
  previewClassName?: string;
}

export default function ImageUploadField({
  label,
  value,
  onChange,
  type,
  onUploadingChange,
  previewClassName = 'h-32 w-32',
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setUploading = (v: boolean) => {
    setIsUploading(v);
    onUploadingChange?.(v);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploading(true);

    try {
      // Büyük telefon fotoğrafları da seçilebilsin diye boyut kontrolü sıkıştırmadan sonra yapılır.
      let file = selected;
      try {
        file = await compressImage(selected);
      } catch (err) {
        // Tarayıcının çözemediği türler (ör. Chrome'da HEIC) orijinal hâliyle denenir.
        console.error('Görsel sıkıştırılamadı:', err);
      }

      // Vercel istek gövdesini 4,5 MB ile sınırlar.
      if (file.size > 4 * 1024 * 1024) {
        alert("Görsel 4 MB'dan büyük ve küçültülemedi. Lütfen JPG veya PNG formatında bir görsel seçin.");
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) onChange(data.url);
      else alert('Resim yüklenemedi.');
    } catch (err) {
      console.error(err);
      alert('Resim yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex space-x-3 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors"
          placeholder="https://... (veya bilgisayardan seçin)"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-[#2a2a2a] hover:bg-[#333] text-[#bc906b] px-4 py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 border border-[#333]"
          title="Görsel yükle"
        >
          {isUploading ? (
            <div className="w-5 h-5 border-2 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      </div>
      {value && (
        <div className={`mt-3 relative rounded-lg overflow-hidden border border-[#333] ${previewClassName}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Önizleme" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}
