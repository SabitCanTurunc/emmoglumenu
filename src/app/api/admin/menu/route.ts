import { NextResponse } from 'next/server';
import { getMenuTree } from '@/lib/menu';
import { handleError } from '@/lib/adminApi';

export const dynamic = 'force-dynamic';

// Yönetim paneli için tüm ağaç (gizli kategori/ürünler dahil)
export async function GET() {
  try {
    return NextResponse.json(await getMenuTree({ includeHidden: true }));
  } catch (error) {
    return handleError(error);
  }
}
