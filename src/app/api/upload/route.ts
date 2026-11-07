import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';

const accountId = process.env.R2_ACCOUNT_ID || '1e13166db0d2d879e56c328a0649f691';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '471a360ec817989cff7df4c29570885f';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'e52d10dbbe1c07e40095206a72cd1a3c4b99ec833b84ef9a188e58b3927d3b73';
const bucket = process.env.R2_BUCKET_NAME || 'emmoglu-menu';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

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

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type || 'image/jpeg',
      })
    );

    // Kendi güvenli Image Proxy endpoint'imiz üzerinden döndürür
    const publicUrl = `/api/images/${key}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('R2 Upload Error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
