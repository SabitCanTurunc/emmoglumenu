import { NextResponse } from 'next/server';
import { getMenuTree } from '@/lib/menu';

export const dynamic = 'force-dynamic';

// Herkese açık menü: ana kategoriler -> alt kategoriler -> ürünler (gizli olanlar hariç)
export async function GET() {
  try {
    return NextResponse.json(await getMenuTree());
  } catch (error) {
    console.error('Error fetching menu from DB:', error);
    return NextResponse.json({ error: 'Failed to fetch menu data' }, { status: 500 });
  }
}
