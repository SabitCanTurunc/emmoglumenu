// İmzalı admin oturum token'ı. Web Crypto kullandığı için hem middleware (edge)
// hem de Node tarafında çalışır.
export const SESSION_COOKIE = 'admin_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 1 hafta (saniye)

const encoder = new TextEncoder();

// SESSION_SECRET tanımlıysa onu, değilse ADMIN_PASSWORD'ü imza anahtarı olarak kullanır.
function getSecret(): string | null {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Sabit zamanlı karşılaştırma
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getSecret();
  if (!secret) return null;
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expires}.${await sign(expires, secret)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = getSecret();
  if (!secret || !token) return false;
  const [expires, signature] = token.split('.');
  if (!expires || !signature) return false;
  if (!(Number(expires) > Date.now())) return false;
  return safeEqual(signature, await sign(expires, secret));
}
