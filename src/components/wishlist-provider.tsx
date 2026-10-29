import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { wishlistService } from '@/api/wishlistService';
import { useNotifications } from '@/components/notification-center';
import type { WishlistEntry } from '@/types';

interface WishlistContextValue {
  entries: WishlistEntry[];
  productIds: ReadonlySet<string>;
  loading: boolean;
  refresh: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<boolean>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const user = useAppSelector((state) => state.auth.session?.user);
  const { notify } = useNotifications();
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'customer') {
      setEntries([]);
      return;
    }
    setLoading(true);
    try {
      setEntries(await wishlistService.list());
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not load wishlist.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify, user]);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  const remove = useCallback(async (productId: string) => {
    try {
      await wishlistService.remove(productId);
      setEntries((current) => current.filter((entry) => entry.productId !== productId));
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not update wishlist.', 'error');
      return false;
    }
  }, [notify]);

  const toggle = useCallback(async (productId: string) => {
    if (entries.some((entry) => entry.productId === productId)) return remove(productId);
    try {
      const entry = await wishlistService.add(productId);
      setEntries((current) => current.some((item) => item.productId === productId)
        ? current : [entry, ...current]);
      return true;
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not update wishlist.', 'error');
      return false;
    }
  }, [entries, notify, remove]);

  const productIds = useMemo(() => new Set(entries.map((entry) => entry.productId)), [entries]);
  const value = useMemo(() => ({ entries, productIds, loading, refresh, toggle, remove }), [
    entries, productIds, loading, refresh, toggle, remove,
  ]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider.');
  return context;
}
