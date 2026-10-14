import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { fail, handleError, isValidId, revalidateMenu } from '@/lib/adminApi';

export async function PATCH(request: Request, ctx: RouteContext<'/api/admin/products/[id]'>) {
  try {
    const { id } = await ctx.params;
    if (!isValidId(id)) return fail('Geçersiz ürün.');
    const body = await request.json();
    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) return fail('Ürün bulunamadı.', 404);

    if (body.title !== undefined) {
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title) return fail('Ürün adı zorunludur.');
      product.title = title;
    }
    if (body.price !== undefined) {
      const price = String(body.price).trim();
      if (!price) return fail('Fiyat zorunludur.');
      product.price = price;
    }
    if (body.description !== undefined) product.description = body.description || '';
    if (body.image !== undefined) product.image = body.image || '';
    if (body.isActive !== undefined) product.isActive = !!body.isActive;
    if (body.order !== undefined && Number.isFinite(Number(body.order))) product.order = Number(body.order);

    // Kategori / alt kategori değişimi (taşıma)
    if (body.category !== undefined && String(product.category) !== body.category) {
      if (!isValidId(body.category)) return fail('Geçersiz kategori.');
      if (!(await Category.exists({ _id: body.category }))) return fail('Kategori bulunamadı.', 404);
      product.category = body.category;
      if (body.order === undefined) {
        const last = await Product.findOne({ category: body.category }).sort({ order: -1 }).lean<{ order?: number }>();
        product.order = last ? (last.order || 0) + 1 : 0;
      }
    }

    await product.save();
    revalidateMenu();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<'/api/admin/products/[id]'>) {
  try {
    const { id } = await ctx.params;
    if (!isValidId(id)) return fail('Geçersiz ürün.');
    await connectToDatabase();
    const res = await Product.deleteOne({ _id: id });
    if (!res.deletedCount) return fail('Ürün bulunamadı.', 404);
    revalidateMenu();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
