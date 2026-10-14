'use client';

import type { MenuNode } from '@/lib/menu';

interface CategorySelectProps {
  value: string;
  onChange: (id: string) => void;
  tree: MenuNode[];
  // true: sadece ana kategoriler seçilebilir (alt kategori için üst kategori seçimi)
  topLevelOnly?: boolean;
  // Seçenekten çıkarılacak kategori (kendi altına taşımayı engellemek için)
  excludeId?: string;
  // Ana kategori seçeneği (üst kategori yok)
  noneLabel?: string;
  className?: string;
  disabled?: boolean;
}

export default function CategorySelect({
  value,
  onChange,
  tree,
  topLevelOnly = false,
  excludeId,
  noneLabel,
  className = '',
  disabled = false,
}: CategorySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#bc906b] transition-colors ${className}`}
    >
      {noneLabel !== undefined && <option value="">{noneLabel}</option>}
      {tree
        .filter((cat) => cat.id !== excludeId)
        .map((cat) =>
          topLevelOnly || cat.children.length === 0 ? (
            <option key={cat.id} value={cat.id}>
              {cat.category}
            </option>
          ) : (
            <optgroup key={cat.id} label={cat.category}>
              <option value={cat.id}>{cat.category} (doğrudan)</option>
              {cat.children
                .filter((sub) => sub.id !== excludeId)
                .map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    ↳ {sub.category}
                  </option>
                ))}
            </optgroup>
          )
        )}
    </select>
  );
}
