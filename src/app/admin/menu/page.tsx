'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  FolderPlus,
  Eye,
  EyeOff,
  FolderInput,
  Search,
  X,
  Folder,
  FolderOpen,
} from 'lucide-react';
import type { MenuNode, MenuItem } from '@/lib/menu';
import CategoryModal, { type CategoryFormData } from '@/components/admin/CategoryModal';
import ProductModal, { type ProductFormData } from '@/components/admin/ProductModal';
import MoveProductsModal from '@/components/admin/MoveProductsModal';

type Notice = { type: 'error' | 'success'; text: string };

const productCount = (node: MenuNode) =>
  node.items.length + node.children.reduce((sum, c) => sum + c.items.length, 0);

function findNode(tree: MenuNode[], id: string | null): { node: MenuNode; parent: MenuNode | null } | null {
  if (!id) return null;
  for (const root of tree) {
    if (root.id === id) return { node: root, parent: null };
    for (const child of root.children) {
      if (child.id === id) return { node: child, parent: root };
    }
  }
  return null;
}

export default function AdminMenuPage() {
  const [tree, setTree] = useState<MenuNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productFilter, setProductFilter] = useState('');

  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing: MenuNode | null; parentId: string | null }>({
    open: false,
    editing: null,
    parentId: null,
  });
  const [productModal, setProductModal] = useState<{ open: boolean; editing: MenuItem | null }>({
    open: false,
    editing: null,
  });
  const [moveIds, setMoveIds] = useState<string[] | null>(null);

  const showNotice = useCallback((type: Notice['type'], text: string) => {
    setNotice({ type, text });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const fetchTree = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/menu', { cache: 'no-store' });
      if (!res.ok) throw new Error(String(res.status));
      const data: MenuNode[] = await res.json();
      setTree(data);
      return data;
    } catch (error) {
      console.error(error);
      showNotice('error', 'Menü yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
      return null;
    }
  }, [showNotice]);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/menu', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<MenuNode[]>;
      })
      .then((data) => {
        if (active) setTree(data);
      })
      .catch((error) => {
        console.error(error);
        if (active) showNotice('error', 'Menü yüklenemedi. Sayfayı yenileyip tekrar deneyin.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [showNotice]);

  // Kategori değişince ürün seçimi ve filtresi sıfırlanır
  const selectCategory = (id: string | null) => {
    setSelectedId(id);
    setSelectedProducts([]);
    setProductFilter('');
  };

  // Tek noktadan API çağrısı: hata gösterir, başarıda ağacı yeniler
  const mutate = async (url: string, method: string, body?: unknown, successText?: string) => {
    setIsSaving(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showNotice('error', res.status === 401 ? 'Oturum süresi dolmuş. Lütfen tekrar giriş yapın.' : data.error || 'İşlem başarısız oldu.');
        return null;
      }
      await fetchTree();
      if (successText) showNotice('success', successText);
      return data;
    } catch (error) {
      console.error(error);
      showNotice('error', 'Sunucuya ulaşılamadı.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // Seçili kategori silindiyse ya da henüz seçim yoksa ilk kategoriye düşer
  const selection = useMemo(
    () => findNode(tree, selectedId) ?? (tree[0] ? { node: tree[0], parent: null } : null),
    [tree, selectedId]
  );
  const selected = selection?.node ?? null;
  const selectedParent = selection?.parent ?? null;

  /* ---------- Kategori işlemleri ---------- */

  const handleSaveCategory = async (data: CategoryFormData, id?: string) => {
    const result = id
      ? await mutate(`/api/admin/categories/${id}`, 'PATCH', data, 'Kategori güncellendi.')
      : await mutate('/api/admin/categories', 'POST', data, 'Kategori eklendi.');
    if (result && !id) {
      if (data.parent) setExpanded((prev) => (prev.includes(data.parent!) ? prev : [...prev, data.parent!]));
      selectCategory(result.id);
    }
  };

  const handleDeleteCategory = async (node: MenuNode) => {
    const subCount = node.children.length;
    const total = productCount(node);
    const detail = [
      subCount > 0 ? `${subCount} alt kategori` : null,
      total > 0 ? `${total} ürün` : null,
    ].filter(Boolean);
    const message = detail.length
      ? `"${node.category}" kategorisi ve içindeki ${detail.join(' ile ')} kalıcı olarak silinecek. Emin misiniz?`
      : `"${node.category}" kategorisini silmek istediğinize emin misiniz?`;
    if (!confirm(message)) return;
    await mutate(`/api/admin/categories/${node.id}`, 'DELETE', undefined, 'Kategori silindi.');
  };

  const toggleCategoryActive = (node: MenuNode) =>
    mutate(`/api/admin/categories/${node.id}`, 'PATCH', { isActive: !node.isActive });

  const moveCategory = async (node: MenuNode, siblings: MenuNode[], direction: -1 | 1) => {
    const index = siblings.findIndex((s) => s.id === node.id);
    const target = index + direction;
    if (target < 0 || target >= siblings.length) return;
    const ids = siblings.map((s) => s.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await mutate('/api/admin/categories/reorder', 'POST', { ids });
  };

  /* ---------- Ürün işlemleri ---------- */

  const handleSaveProduct = async (data: ProductFormData, id?: string) => {
    if (id) {
      await mutate(`/api/admin/products/${id}`, 'PATCH', data, 'Ürün güncellendi.');
    } else {
      await mutate('/api/admin/products', 'POST', data, 'Ürün eklendi.');
    }
  };

  const handleDeleteProduct = async (item: MenuItem) => {
    if (!confirm(`"${item.title}" ürününü silmek istediğinize emin misiniz?`)) return;
    await mutate(`/api/admin/products/${item.id}`, 'DELETE', undefined, 'Ürün silindi.');
  };

  const toggleProductActive = (item: MenuItem) =>
    mutate(`/api/admin/products/${item.id}`, 'PATCH', { isActive: !item.isActive });

  const moveProduct = async (item: MenuItem, items: MenuItem[], direction: -1 | 1) => {
    const index = items.findIndex((i) => i.id === item.id);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((i) => i.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await mutate('/api/admin/products/reorder', 'POST', { ids });
  };

  const bulk = (action: 'move' | 'delete' | 'show' | 'hide', ids: string[], extra: object = {}, successText?: string) =>
    mutate('/api/admin/products/bulk', 'POST', { action, ids, ...extra }, successText);

  const handleBulkDelete = async () => {
    if (!confirm(`${selectedProducts.length} ürünü silmek istediğinize emin misiniz?`)) return;
    await bulk('delete', selectedProducts, {}, 'Ürünler silindi.');
    setSelectedProducts([]);
  };

  const handleMove = async (categoryId: string) => {
    if (!moveIds) return;
    const target = findNode(tree, categoryId);
    const ok = await bulk('move', moveIds, { categoryId }, `${moveIds.length} ürün "${target?.node.category ?? ''}" kategorisine taşındı.`);
    if (ok) setSelectedProducts([]);
  };

  /* ---------- Görünüm ---------- */

  const visibleItems = useMemo(() => {
    if (!selected) return [];
    const q = productFilter.trim().toLocaleLowerCase('tr-TR');
    if (!q) return selected.items;
    return selected.items.filter(
      (i) => i.title.toLocaleLowerCase('tr-TR').includes(q) || i.description.toLocaleLowerCase('tr-TR').includes(q)
    );
  }, [selected, productFilter]);

  const allVisibleSelected = visibleItems.length > 0 && visibleItems.every((i) => selectedProducts.includes(i.id));

  const toggleSelectAll = () =>
    setSelectedProducts(allVisibleSelected ? [] : visibleItems.map((i) => i.id));

  const toggleSelectProduct = (id: string) =>
    setSelectedProducts((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const iconBtn =
    'p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#333] transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400';

  const renderTreeRow = (node: MenuNode, siblings: MenuNode[], isSub: boolean) => {
    const isSelected = node.id === selected?.id;
    const isOpen = expanded.includes(node.id);
    const index = siblings.findIndex((s) => s.id === node.id);

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-1 rounded-lg pr-1 transition-colors ${
            isSub ? 'ml-6' : ''
          } ${isSelected ? 'bg-[#bc906b]/15 ring-1 ring-[#bc906b]/40' : 'hover:bg-[#222]'}`}
        >
          {!isSub && node.children.length > 0 ? (
            <button
              onClick={() => setExpanded((prev) => (prev.includes(node.id) ? prev.filter((i) => i !== node.id) : [...prev, node.id]))}
              className="p-2 text-gray-400 hover:text-white shrink-0"
              aria-label={isOpen ? 'Alt kategorileri gizle' : 'Alt kategorileri göster'}
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-8 shrink-0" />
          )}

          <button
            onClick={() => {
              selectCategory(node.id);
              if (!isSub && node.children.length > 0 && !isOpen) setExpanded((prev) => [...prev, node.id]);
            }}
            className="flex-1 min-w-0 flex items-center gap-2 py-2.5 text-left"
          >
            {isSelected ? (
              <FolderOpen className="w-4 h-4 text-[#bc906b] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-gray-500 shrink-0" />
            )}
            <span className={`truncate font-medium ${node.isActive ? 'text-white' : 'text-gray-500 line-through'}`}>
              {node.category}
            </span>
            {!node.isActive && <EyeOff className="w-3.5 h-3.5 text-gray-500 shrink-0" />}
            <span className="ml-auto text-xs text-gray-400 bg-[#2a2a2a] rounded-full px-2 py-0.5 shrink-0">
              {isSub ? node.items.length : productCount(node)}
            </span>
          </button>

          <div className="flex items-center shrink-0">
            <button
              className={iconBtn}
              onClick={() => moveCategory(node, siblings, -1)}
              disabled={index === 0 || isSaving}
              title="Yukarı taşı"
              aria-label="Yukarı taşı"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              className={iconBtn}
              onClick={() => moveCategory(node, siblings, 1)}
              disabled={index === siblings.length - 1 || isSaving}
              title="Aşağı taşı"
              aria-label="Aşağı taşı"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isSub && isOpen && (
          <div className="mt-1 space-y-1">{node.children.map((child) => renderTreeRow(child, node.children, true))}</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Menü Yönetimi</h1>
          <p className="text-gray-400">Kategorileri, alt kategorileri ve ürünleri buradan yönetin.</p>
        </div>
        <button
          onClick={() => setCategoryModal({ open: true, editing: null, parentId: null })}
          className="w-full md:w-auto bg-[#bc906b] hover:bg-[#a57c5a] text-black font-semibold py-2.5 px-5 rounded-lg flex items-center justify-center space-x-2 transition-all hover:scale-105 shadow-[0_0_15px_rgba(188,144,107,0.2)]"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Kategori</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[22rem_minmax(0,1fr)] gap-6 items-start">
        {/* Sol: kategori ağacı */}
        <aside className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-3 space-y-1">
          {tree.map((root) => renderTreeRow(root, tree, false))}
          {tree.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">Henüz hiç kategori eklenmemiş.</p>
          )}
        </aside>

        {/* Sağ: seçili kategori */}
        <section className="min-w-0">
          {selected ? (
            <>
              <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 mb-4">
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400 flex items-center gap-1 flex-wrap">
                      {selectedParent ? (
                        <>
                          <button onClick={() => selectCategory(selectedParent.id)} className="hover:text-[#bc906b] transition-colors">
                            {selectedParent.category}
                          </button>
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>Alt kategori</span>
                        </>
                      ) : (
                        <span>Ana kategori</span>
                      )}
                    </p>
                    <h2 className="text-2xl font-bold text-white mt-1 break-words">
                      {selected.category}
                      {!selected.isActive && (
                        <span className="ml-3 align-middle text-xs font-medium text-gray-400 bg-[#2a2a2a] rounded-full px-2.5 py-1">
                          Gizli
                        </span>
                      )}
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!selectedParent && (
                      <button
                        onClick={() => setCategoryModal({ open: true, editing: null, parentId: selected.id })}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-sm transition-colors"
                      >
                        <FolderPlus className="w-4 h-4" />
                        Alt Kategori Ekle
                      </button>
                    )}
                    <button
                      onClick={() => setCategoryModal({ open: true, editing: selected, parentId: null })}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-sm transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Düzenle
                    </button>
                    <button
                      onClick={() => toggleCategoryActive(selected)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-200 text-sm transition-colors"
                    >
                      {selected.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      {selected.isActive ? 'Gizle' : 'Göster'}
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(selected)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] hover:bg-red-500/20 text-gray-200 hover:text-red-400 text-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Sil
                    </button>
                  </div>
                </div>

                {/* Alt kategori kısayolları */}
                {selected.children.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex flex-wrap gap-2">
                    {selected.children.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => selectCategory(sub.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-[#333] hover:border-[#bc906b] text-sm text-gray-200 transition-colors"
                      >
                        {sub.category}
                        <span className="text-xs text-gray-500">{sub.items.length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Ürün araç çubuğu */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  <input
                    type="text"
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    placeholder="Bu kategoride ürün ara..."
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#bc906b] transition-colors"
                  />
                </div>
                <button
                  onClick={() => setProductModal({ open: true, editing: null })}
                  className="bg-[#bc906b] hover:bg-[#a57c5a] text-black font-semibold py-2.5 px-5 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Yeni Ürün</span>
                </button>
              </div>

              {/* Toplu işlem çubuğu */}
              {selected.items.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mb-3 px-1">
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#bc906b]"
                    />
                    Tümünü seç
                  </label>
                  {selectedProducts.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 ml-auto bg-[#bc906b]/10 border border-[#bc906b]/30 rounded-lg px-3 py-1.5">
                      <span className="text-sm text-[#bc906b] font-medium">{selectedProducts.length} seçili</span>
                      <button onClick={() => setMoveIds(selectedProducts)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[#bc906b]/20 text-sm text-white transition-colors">
                        <FolderInput className="w-4 h-4" /> Taşı
                      </button>
                      <button onClick={() => bulk('show', selectedProducts, {}, 'Ürünler gösterildi.')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[#bc906b]/20 text-sm text-white transition-colors">
                        <Eye className="w-4 h-4" /> Göster
                      </button>
                      <button onClick={() => bulk('hide', selectedProducts, {}, 'Ürünler gizlendi.')} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-[#bc906b]/20 text-sm text-white transition-colors">
                        <EyeOff className="w-4 h-4" /> Gizle
                      </button>
                      <button onClick={handleBulkDelete} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-red-500/20 text-sm text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" /> Sil
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Ürün listesi */}
              <div className="space-y-3">
                {visibleItems.map((item) => {
                  const index = selected.items.findIndex((i) => i.id === item.id);
                  const checked = selectedProducts.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`bg-[#1a1a1a] border rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center gap-3 group transition-colors ${
                        checked ? 'border-[#bc906b]' : 'border-[#2a2a2a] hover:border-[#bc906b]/50'
                      } ${item.isActive ? '' : 'opacity-60'}`}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelectProduct(item.id)}
                          className="w-4 h-4 mt-2 accent-[#bc906b] shrink-0"
                          aria-label={`${item.title} seç`}
                        />
                        <div className="w-16 h-16 rounded-lg bg-[#0a0a0a] overflow-hidden shrink-0 border border-[#333]">
                          {item.image && !item.image.includes('placeholder.webp') ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs text-center bg-[#2a2a2a]">Görsel yok</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-base font-semibold text-white line-clamp-2">
                              {item.title}
                              {!item.isActive && (
                                <span className="ml-2 align-middle text-xs font-medium text-gray-400 bg-[#2a2a2a] rounded-full px-2 py-0.5">Gizli</span>
                              )}
                            </h3>
                            <span className="text-[#bc906b] font-bold whitespace-nowrap">{item.price} ₺</span>
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2 mt-0.5">{item.description || 'Açıklama yok'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1 shrink-0 border-t border-[#2a2a2a] md:border-t-0 pt-3 md:pt-0">
                        <button
                          className={iconBtn}
                          onClick={() => moveProduct(item, selected.items, -1)}
                          disabled={index === 0 || !!productFilter || isSaving}
                          title="Yukarı taşı"
                          aria-label="Yukarı taşı"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          className={iconBtn}
                          onClick={() => moveProduct(item, selected.items, 1)}
                          disabled={index === selected.items.length - 1 || !!productFilter || isSaving}
                          title="Aşağı taşı"
                          aria-label="Aşağı taşı"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button className={iconBtn} onClick={() => setMoveIds([item.id])} title="Başka kategoriye taşı" aria-label="Başka kategoriye taşı">
                          <FolderInput className="w-4 h-4" />
                        </button>
                        <button className={iconBtn} onClick={() => toggleProductActive(item)} title={item.isActive ? 'Gizle' : 'Göster'} aria-label={item.isActive ? 'Gizle' : 'Göster'}>
                          {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                        <button className={iconBtn} onClick={() => setProductModal({ open: true, editing: item })} title="Düzenle" aria-label="Düzenle">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          className={`${iconBtn} hover:!text-red-400 hover:!bg-red-500/20`}
                          onClick={() => handleDeleteProduct(item)}
                          title="Sil"
                          aria-label="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {visibleItems.length === 0 && (
                  <div className="text-center py-14 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] border-dashed">
                    <p className="text-gray-400">
                      {productFilter
                        ? 'Aramanızla eşleşen ürün yok.'
                        : selected.children.length > 0
                          ? 'Bu kategoriye doğrudan bağlı ürün yok. Ürünler alt kategorilerde.'
                          : 'Bu kategoride henüz hiç ürün yok.'}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] border-dashed">
              <p className="text-gray-400">Başlamak için bir kategori ekleyin.</p>
            </div>
          )}
        </section>
      </div>

      <CategoryModal
        isOpen={categoryModal.open}
        onClose={() => setCategoryModal((m) => ({ ...m, open: false }))}
        onSave={handleSaveCategory}
        initialData={categoryModal.editing}
        defaultParentId={categoryModal.parentId}
        tree={tree}
      />

      {selected && (
        <ProductModal
          isOpen={productModal.open}
          onClose={() => setProductModal((m) => ({ ...m, open: false }))}
          onSave={handleSaveProduct}
          initialData={productModal.editing}
          categoryId={selected.id}
          tree={tree}
        />
      )}

      {selected && (
        <MoveProductsModal
          isOpen={moveIds !== null}
          onClose={() => setMoveIds(null)}
          onMove={handleMove}
          count={moveIds?.length ?? 0}
          currentCategoryId={selected.id}
          tree={tree}
        />
      )}

      {isSaving && (
        <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
          <div className="bg-[#1a1a1a] border border-[#bc906b] shadow-lg rounded-xl p-4 flex items-center space-x-3">
            <div className="w-5 h-5 border-2 border-[#bc906b] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm font-medium">Kaydediliyor...</p>
          </div>
        </div>
      )}

      {notice && !isSaving && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-4 fade-in duration-300 px-4 w-full max-w-md">
          <div
            role="status"
            className={`rounded-xl p-4 flex items-start gap-3 shadow-lg border ${
              notice.type === 'error' ? 'bg-red-950 border-red-500/50 text-red-100' : 'bg-[#1a1a1a] border-[#bc906b] text-white'
            }`}
          >
            <p className="text-sm font-medium flex-1">{notice.text}</p>
            <button onClick={() => setNotice(null)} aria-label="Kapat" className="opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
