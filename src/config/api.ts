function cleanBaseUrl(value: string | undefined): string {
  return value?.trim().replace(/\/+$/, '') ?? '';
}

export const API_BASE_URL = cleanBaseUrl(process.env.EXPO_PUBLIC_API_URL);
export const SERVER_BASE_URL = cleanBaseUrl(process.env.EXPO_PUBLIC_SERVER_URL)
  || API_BASE_URL.replace(/\/api(?:\/.*)?$/i, '');
