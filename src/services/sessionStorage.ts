import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthSession } from '@/types';

const SESSION_KEY = '@dg/session';

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) return false;
  const session = value as Record<string, unknown>;
  if (typeof session.token !== 'string' || typeof session.user !== 'object' || session.user === null) return false;
  const user = session.user as Record<string, unknown>;
  return typeof user.id === 'string' && typeof user.name === 'string' && typeof user.email === 'string';
}

export async function readSession(): Promise<AuthSession | null> {
  const stored = await AsyncStorage.getItem(SESSION_KEY);
  if (!stored) return null;

  try {
    const parsed: unknown = JSON.parse(stored);
    if (isAuthSession(parsed)) return parsed;
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function writeSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
