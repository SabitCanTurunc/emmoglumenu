import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

export const isValidId = (id: unknown): id is string =>
  typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);

export const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export function revalidateMenu() {
  revalidatePath('/menu');
}

export function handleError(error: unknown) {
  const e = error as { code?: number; message?: string };
  if (e?.code === 11000) {
    return fail('Bu isimde bir kategori zaten mevcut.', 409);
  }
  console.error('Admin API error:', error);
  return fail('Sunucu hatası', 500);
}
