import { Redirect } from 'expo-router';
import { useAppSelector } from '@/redux/hooks';

export default function IndexRoute() {
  const { initialized, session } = useAppSelector((state) => state.auth);
  if (!initialized || !session) return <Redirect href="/login" />;
  return <Redirect href={session.user.role === 'admin' ? '/admin' : '/(tabs)'} />;
}
