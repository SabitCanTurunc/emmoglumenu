import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import { fail, handleError, isValidId, revalidateMenu } from '@/lib/adminApi';

// Body: { action: 'move' | 'delete' | 'show' | 'hide', ids: string[], categoryId?: string }
export async function POST(request: Request) {
  try {
    const { action, ids, categoryId } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isValidId)) return fail('Ürün seçilmedi.');
    await connectToDatabase();

    switch (action) {
      case 'move': {
        if (!isValidId(categoryId)) return fail('Geçerli bir hedef kategori seçin.');
        if (!(await Category.exists({ _id: categoryId }))) return fail('Hedef kategori bulunamadı.', 404);

        // Seçilen ürünleri mevcut sıralarını koruyarak hedef kategorinin sonuna ekle
        const last = await Product.findOne({ category: categoryId }).sort({ order: -1 }).lean<{ order?: number }>();
        let next = last ? (last.order || 0) + 1 : 0;
        const selected = await Product.find({ _id: { $in: ids } }).sort({ order: 1 }).select('_id').lean();
        await Product.bulkWrite(
          selected.map((p) => ({
            updateOne: {
              filter: { _id: p._id },
              update: { $set: { category: new mongoose.Types.ObjectId(categoryId), order: next++ } },
            },
          }))
        );
        break;
      }
      case 'delete':
        await Product.deleteMany({ _id: { $in: ids } });
        break;
      case 'show':
      case 'hide':
        await Product.updateMany({ _id: { $in: ids } }, { $set: { isActive: action === 'show' } });
        break;
      default:
        return fail('Geçersiz işlem.');
    }

    revalidateMenu();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
