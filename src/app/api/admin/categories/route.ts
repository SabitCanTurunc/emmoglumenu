import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { fail, handleError, isValidId, revalidateMenu } from '@/lib/adminApi';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) return fail('Kategori adı zorunludur.');

    await connectToDatabase();

    let parent: string | null = null;
    if (body.parent) {
      if (!isValidId(body.parent)) return fail('Geçersiz üst kategori.');
      const parentDoc = await Category.findById(body.parent).lean<{ parent?: unknown }>();
      if (!parentDoc) return fail('Üst kategori bulunamadı.', 404);
      if (parentDoc.parent) return fail('Alt kategorinin altına yeni kategori eklenemez (en fazla 2 seviye).');
      parent = body.parent;
    }

    let order = Number(body.order);
    if (!Number.isFinite(order)) {
      const last = await Category.findOne({ parent }).sort({ order: -1 }).lean<{ order?: number }>();
      order = last ? (last.order || 0) + 1 : 0;
    }

    const created = await Category.create({
      name,
      image: body.image || '',
      parent,
      order,
      isActive: body.isActive !== false,
    });

    revalidateMenu();
    return NextResponse.json({ success: true, id: String(created._id) }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
