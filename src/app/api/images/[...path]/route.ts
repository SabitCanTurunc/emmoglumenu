import { NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getR2Client, getR2Bucket } from '@/lib/r2';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const key = pathSegments.join('/');

    const data = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getR2Bucket(),
        Key: key,
      })
    );

    if (!data.Body) {
      return new NextResponse('Not found', { status: 404 });
    }

    const byteArray = await data.Body.transformToByteArray();

    return new NextResponse(Buffer.from(byteArray), {
      status: 200,
      headers: {
        'Content-Type': data.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    if (error?.name === 'NoSuchKey') {
      return new NextResponse('Not found', { status: 404 });
    }
    console.error('[/api/images] R2 fetch failed:', error?.message);
    return new NextResponse('Internal error', { status: 500 });
  }
}
