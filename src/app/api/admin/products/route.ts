import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { fail, handleError, isValidId, revalidateMenu } from '@/lib/adminApi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const price = body.price !== undefined ? String(body.price).trim() : '';
    if (!title || !price) return fail('Ürün adı ve fiyat zorunludur.');
    if (!isValidId(body.category)) return fail('Geçerli bir kategori seçin.');

    await connectToDatabase();
    if (!(await Category.exists({ _id: body.category }))) return fail('Kategori bulunamadı.', 404);

    let order = Number(body.order);
    if (body.order === undefined || body.order === '' || !Number.isFinite(order)) {
      const last = await Product.findOne({ category: body.category }).sort({ order: -1 }).lean<{ order?: number }>();
      order = last ? (last.order || 0) + 1 : 0;
    }

    const created = await Product.create({
      title,
      price,
      description: body.description || '',
      image: body.image || '',
      category: body.category,
      order,
      isActive: body.isActive !== false,
    });

    revalidateMenu();
    return NextResponse.json({ success: true, id: String(created._id) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
