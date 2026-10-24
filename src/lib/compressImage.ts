// Görselleri yüklemeden önce tarayıcıda küçültüp sıkıştırır.
// Amaç: Vercel Blob'un aylık depolama/veri aktarımı limitlerini korumak ve
// Vercel'in 4,5 MB istek gövdesi sınırına takılmamak.

const MAX_DIMENSION = 1200; // en uzun kenar (px)
const QUALITY = 0.8;

// Sıkıştırılamayan (animasyonlu/vektör) türler olduğu gibi gönderilir.
const SKIP_TYPES = ['image/gif', 'image/svg+xml'];

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(file: File): Promise<File> {
  if (SKIP_TYPES.includes(file.type)) return file;

  // EXIF yönünü uygular; telefon fotoğrafları yan dönmez.
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  // WebP'yi desteklemeyen tarayıcılar (eski Safari) PNG döndürür; o durumda JPEG'e düşülür.
  let blob = await canvasToBlob(canvas, 'image/webp', QUALITY);
  if (!blob || blob.type !== 'image/webp') {
    // JPEG şeffaflık taşımaz; şeffaf alanlar siyah yerine beyaz olsun.
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    blob = await canvasToBlob(canvas, 'image/jpeg', QUALITY);
  }
  bitmap.close();

  // Zaten küçük bir dosya sıkıştırınca büyüyorsa orijinali kullan.
  if (!blob || (scale === 1 && blob.size >= file.size)) return file;

  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return new File([blob], `${baseName}.${extension}`, { type: blob.type });
}
