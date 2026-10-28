import { SERVER_BASE_URL } from '@/config/api';

export function resolveImageUrl(path: string | null | undefined): string | undefined {
  const imagePath = path?.trim();
  if (!imagePath) return undefined;

  if (/^https?:\/\//i.test(imagePath)) return imagePath;
  if (!SERVER_BASE_URL) return undefined;

  try {
    const normalizedPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
    const serverUrl = new URL(SERVER_BASE_URL);
    const url = new URL(normalizedPath, `${serverUrl.origin}/`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
