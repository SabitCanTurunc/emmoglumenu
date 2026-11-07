import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Bucket } from '@/lib/r2';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string; // "category" or "product"

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 5 MB sınırını aşıyor' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Güvenli dosya adı ve uzantı oluşturma
    let ext = path.extname(file.name || '').toLowerCase();
    if (!ext || ext.length < 2) {
      const mime = file.type || '';
      if (mime.includes('png')) ext = '.png';
      else if (mime.includes('webp')) ext = '.webp';
      else if (mime.includes('gif')) ext = '.gif';
      else ext = '.jpg';
    }

    const folder = type === 'category' ? 'categories' : 'products';
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const key = `${folder}/${uniqueName}`;

    await getR2Client().send(
      new PutObjectCommand({
        Bucket: getR2Bucket(),
        Key: key,
        Body: buffer,
        ContentType: file.type || 'image/jpeg',
      })
    );

    const publicUrl = `/api/images/${key}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('[/api/upload] R2 upload error:', error?.message);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
