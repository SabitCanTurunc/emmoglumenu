import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { Product } from '@/models/Product';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    await connectToDatabase();

    // Check if we already have categories, to avoid duplicate migration
    const count = await Category.countDocuments();
    if (count > 0) {
      return NextResponse.json({ message: 'Migration already completed previously.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src', 'data', 'menu.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    let categoryOrder = 0;
    
    for (const catData of data) {
      // Create Category
      const newCategory = await Category.create({
        name: catData.category,
        image: catData.image || '',
        order: categoryOrder++,
      });

      // Create Products for this category
      let productOrder = 0;
      if (catData.items && Array.isArray(catData.items)) {
        for (const item of catData.items) {
          await Product.create({
            title: item.title,
            price: item.price,
            description: item.description || '',
            image: item.image || '',
            category: newCategory._id,
            order: productOrder++,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Migration completed successfully!' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error.message }, { status: 500 });
  }
}
