import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all categories, sorted by order
    const categories = await Category.find({}).sort({ order: 1 }).lean();
    
    // For each category, fetch its products
    const menuData = await Promise.all(
      categories.map(async (cat: any) => {
        const products = await Product.find({ category: cat._id }).sort({ order: 1 }).lean();
        return {
          id: cat._id.toString(),
          category: cat.name,
          image: cat.image,
          order: cat.order,
          items: products.map((p: any) => ({
            id: p._id.toString(),
            title: p.title,
            price: p.price,
            description: p.description,
            image: p.image,
            order: p.order,
          })),
        };
      })
    );
    
    return NextResponse.json(menuData);
  } catch (error) {
    console.error('Error fetching menu from DB:', error);
    return NextResponse.json({ error: 'Failed to fetch menu data' }, { status: 500 });
  }
}

// Update menu structure (e.g. from Admin panel full save)
// This expects an array of categories with embedded items
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();
    
    // Clear existing DB (since the admin panel currently saves the entire tree)
    // NOTE: In a real production app, it's better to use specific PUT/DELETE endpoints for individual items
    // But to match the previous local JSON logic, we override the collection.
    
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    let catOrder = 0;
    for (const catData of body) {
      const newCat = await Category.create({
        name: catData.category,
        image: catData.image || '',
        order: catOrder++,
      });
      
      let prodOrder = 0;
      if (catData.items && Array.isArray(catData.items)) {
        for (const item of catData.items) {
          await Product.create({
            title: item.title,
            price: item.price,
            description: item.description || '',
            image: item.image || '',
            category: newCat._id,
            order: prodOrder++,
          });
        }
      }
    }
    
    return NextResponse.json({ success: true, message: 'Menu data updated successfully' });
  } catch (error) {
    console.error('Error updating menu in DB:', error);
    return NextResponse.json({ error: 'Failed to write menu data' }, { status: 500 });
  }
}
