import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { fail, handleError, isValidId, revalidateMenu } from '@/lib/adminApi';

// Body: { ids: string[] } — verilen sıraya göre order değerlerini yazar
export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || !ids.every(isValidId)) return fail('Geçersiz istek.');
    await connectToDatabase();

    await Product.bulkWrite(
      ids.map((id: string, index: number) => ({
        updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
      }))
    );

    revalidateMenu();
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
