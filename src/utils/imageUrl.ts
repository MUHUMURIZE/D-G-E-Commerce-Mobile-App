import { SERVER_BASE_URL } from '@/config/api';

export function resolveImageUrl(path: string | null | undefined): string | undefined {
  const imagePath = path?.trim();
  if (!imagePath) return undefined;

  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (!SERVER_BASE_URL) return undefined;

  try {
    const normalizedPath = imagePath.replace(/\\/g, '/');
    const baseUrl = new URL(SERVER_BASE_URL);
    const url = new URL(normalizedPath, `${baseUrl.origin}/`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
