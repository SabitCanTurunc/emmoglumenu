import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const key = pathSegments.join('/');

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
