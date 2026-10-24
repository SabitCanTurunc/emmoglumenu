import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

// Görseller Vercel Blob'a yüklenir; BLOB_READ_WRITE_TOKEN ortam değişkeni gereklidir.
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // "category" or "product"
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5 MB sınırını aşıyor' }, { status: 400 });
    }

    const folderName = type === 'category' ? 'emmoglumenu/categories' : 'emmoglumenu/products';
    const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : 'jpg';

    const blob = await put(`${folderName}/file.${extension}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
