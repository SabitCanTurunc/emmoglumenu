import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import type { Types } from 'mongoose';

interface LeanCategory {
  _id: Types.ObjectId;
  name: string;
  image?: string;
  order?: number;
  parent?: Types.ObjectId | null;
  isActive?: boolean;
}

interface LeanProduct {
  _id: Types.ObjectId;
  title: string;
  price: string;
  description?: string;
  image?: string;
  category: Types.ObjectId;
  order?: number;
  isActive?: boolean;
}

export interface MenuItem {
  id: string;
  title: string;
  price: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
}

export interface MenuNode {
  id: string;
  category: string;
  image: string;
  order: number;
  isActive: boolean;
  parent: string | null;
  items: MenuItem[];
  children: MenuNode[];
}

const byOrder = (a: { order: number }, b: { order: number }) => (a.order || 0) - (b.order || 0);

/**
 * Menü ağacını döndürür: ana kategoriler -> alt kategoriler -> ürünler.
 * includeHidden=false (herkese açık menü) iken gizli kategori/ürünler ve boş dallar elenir.
 */
export async function getMenuTree({ includeHidden = false } = {}): Promise<MenuNode[]> {
  await connectToDatabase();

  const [categories, products] = await Promise.all([
    Category.find({}).lean<LeanCategory[]>(),
    Product.find({}).lean<LeanProduct[]>(),
  ]);

  const itemsByCategory = new Map<string, MenuItem[]>();
  for (const p of products) {
    if (!includeHidden && p.isActive === false) continue;
    const key = String(p.category);
    const list = itemsByCategory.get(key) || [];
    list.push({
      id: String(p._id),
      title: p.title,
      price: p.price,
      description: p.description || '',
      image: p.image || '',
      order: p.order || 0,
      isActive: p.isActive !== false,
    });
    itemsByCategory.set(key, list);
  }

  const nodes = new Map<string, MenuNode>();
  for (const c of categories) {
    if (!includeHidden && c.isActive === false) continue;
    nodes.set(String(c._id), {
      id: String(c._id),
      category: c.name,
      image: c.image || '',
      order: c.order || 0,
      isActive: c.isActive !== false,
      parent: c.parent ? String(c.parent) : null,
      items: (itemsByCategory.get(String(c._id)) || []).sort(byOrder),
      children: [],
    });
  }

  const roots: MenuNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parent ? nodes.get(node.parent) : null;
    if (parent) parent.children.push(node);
    // Ebeveyni gizli/silinmiş alt kategoriler public menüde gösterilmez
    else if (!node.parent) roots.push(node);
  }

  roots.sort(byOrder);
  for (const root of roots) root.children.sort(byOrder);

  if (includeHidden) return roots;

  // Public menüde içi tamamen boş kategorileri gösterme
  return roots
    .map((root) => ({
      ...root,
      children: root.children.filter((c) => c.items.length > 0),
    }))
    .filter((root) => root.items.length > 0 || root.children.length > 0);
}
