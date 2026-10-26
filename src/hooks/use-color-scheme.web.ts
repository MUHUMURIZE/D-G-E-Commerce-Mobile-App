import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const subscribeHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribeHydration, getClientSnapshot, getServerSnapshot);
  const colorScheme = useRNColorScheme();
  return hasHydrated ? colorScheme : 'light';
}
