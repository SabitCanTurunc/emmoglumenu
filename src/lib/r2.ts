/**
 * Cloudflare R2 S3 Client
 *
 * Tek bir yerden yapılandırılır, tüm API route'ları bu modülden import eder.
 * Credential'lar SADECE environment variable'lardan okunur.
 *
 * Gerekli env değişkenleri:
 *   R2_ACCOUNT_ID
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 */

import { S3Client } from '@aws-sdk/client-s3';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let _client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${getRequiredEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: getRequiredEnv('R2_ACCESS_KEY_ID'),
        secretAccessKey: getRequiredEnv('R2_SECRET_ACCESS_KEY'),
      },
    });
  }
  return _client;
}

export function getR2Bucket(): string {
  return getRequiredEnv('R2_BUCKET_NAME');
}

