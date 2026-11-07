import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const key = pathSegments.join('/');

    const bucket = process.env.R2_BUCKET_NAME || 'emmoglu-menu';

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const data = await s3.send(command);

    if (!data.Body) {
      return new NextResponse('Empty body', { status: 404 });
    }

    const contentType = data.ContentType || 'image/jpeg';
    const byteArray = await data.Body.transformToByteArray();

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('R2 Image Fetch Error:', error);
    return new NextResponse(`Error: ${error?.message || error}`, {
      status: 502,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
