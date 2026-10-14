import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { fail, handleError, isValidId, revalidateMenu } from '@/lib/adminApi';

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/categories/[id]'>) {
  try {
    const { id } = await ctx.params;
    if (!isValidId(id)) return fail('Geçersiz kategori.');
    const body = await request.json();
    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) return fail('Kategori bulunamadı.', 404);

    if (body.name !== undefined) {
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (!name) return fail('Kategori adı zorunludur.');
      category.name = name;
    }
    if (body.image !== undefined) category.image = body.image || '';
    if (body.isActive !== undefined) category.isActive = !!body.isActive;
    if (body.order !== undefined && Number.isFinite(Number(body.order))) category.order = Number(body.order);

    // Taşıma: ana kategori <-> alt kategori
    if (body.parent !== undefined) {
      const newParent: string | null = body.parent || null;
      const currentParent = category.parent ? String(category.parent) : null;

      if (newParent !== currentParent) {
        if (newParent) {
          if (!isValidId(newParent)) return fail('Geçersiz üst kategori.');
          if (newParent === id) return fail('Bir kategori kendi altına taşınamaz.');
          const parentDoc = await Category.findById(newParent).lean<{ parent?: unknown }>();
          if (!parentDoc) return fail('Üst kategori bulunamadı.', 404);
          if (parentDoc.parent) return fail('Alt kategorinin altına taşınamaz (en fazla 2 seviye).');
          if (await Category.exists({ parent: id })) {
            return fail('Alt kategorileri olan bir kategori başka bir kategorinin altına taşınamaz. Önce alt kategorilerini taşıyın.');
          }
        }
        category.parent = newParent ? new mongoose.Types.ObjectId(newParent) : null;
        if (body.order === undefined) {
          const last = await Category.findOne({ parent: newParent }).sort({ order: -1 }).lean<{ order?: number }>();
          category.order = last ? (last.order || 0) + 1 : 0;
        }
      }
    }

    await category.save();
    revalidateMenu();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

// Kategoriyi, alt kategorilerini ve içindeki tüm ürünleri siler.
export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/categories/[id]'>) {
  try {
    const { id } = await ctx.params;
    if (!isValidId(id)) return fail('Geçersiz kategori.');
    await connectToDatabase();

    const category = await Category.findById(id).lean();
    if (!category) return fail('Kategori bulunamadı.', 404);

    const children = await Category.find({ parent: id }).select('_id').lean();
    const ids = [id, ...children.map((c) => String(c._id))];

    const products = await Product.deleteMany({ category: { $in: ids } });
    await Category.deleteMany({ _id: { $in: ids } });

    revalidateMenu();
    return NextResponse.json({ success: true, deletedProducts: products.deletedCount });
  } catch (error) {
    return handleError(error);
  }
}
