import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { adminService, type AdminProduct } from '@/api/adminService';
import { ProductImage } from '@/components/product-image';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { EmptyState, Message } from '@/components/ui/message';
import { useNotifications } from '@/components/notification-center';
import { palette } from '@/constants/palette';
import { formatRwf } from '@/utils/formatCurrency';
import { resolveImageUrl } from '@/utils/imageUrl';
import { useAppDispatch } from '@/redux/hooks';
import { removeProduct } from '@/redux/slices/productSlice';

export default function AdminProductsScreen() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { notify } = useNotifications();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await adminService.products());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const filtered = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesStock = stockFilter === 'all'
      || (stockFilter === 'low' && product.stock > 0 && product.stock <= 5)
      || (stockFilter === 'out' && product.stock === 0);
    return matchesSearch && matchesStock;
  }), [products, search, stockFilter]);

  const deleteProduct = useCallback(async (product: AdminProduct) => {
    try {
      await adminService.deleteProduct(product.id);
      dispatch(removeProduct(product.id));
      notify(t('productDeleted'));
      await load();
    } catch (reason: unknown) {
      const message = reason instanceof Error ? reason.message : t('deleteFailed');
      setError(message);
      notify(message, 'error');
    }
  }, [dispatch, load, notify, t]);

  const confirmDelete = useCallback((product: AdminProduct) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${t('deleteProduct')}\n${t('deleteConfirm')}`)) {
        void deleteProduct(product);
      }
      return;
    }

    Alert.alert(t('deleteProduct'), t('deleteConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('delete'), style: 'destructive', onPress: () => { void deleteProduct(product); } },
    ]);
  }, [deleteProduct, t]);

  return (
    <FlatList
      style={adminStyles.screen}
      contentContainerStyle={adminStyles.content}
      data={filtered}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void load(); }} tintColor={palette.gold} />}
      ListHeaderComponent={
        <View style={styles.header}>
          <AdminHeader title={t('allProducts')} subtitle={`${products.length} ${t('products').toLowerCase()}`} />
          {error ? <Message error>{error}</Message> : null}
          <AppInput label={t('searchProducts')} value={search} onChangeText={setSearch} />
          <View style={styles.filters}>
            {([
              ['all', 'allProducts'],
              ['low', 'lowStockItems'],
              ['out', 'outOfStockItems'],
            ] as const).map(([value, label]) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: stockFilter === value }}
                onPress={() => setStockFilter(value)}
                style={[styles.filter, stockFilter === value && styles.selectedFilter]}>
                <Text style={[styles.filterText, stockFilter === value && styles.selectedFilterText]}>{t(label)}</Text>
              </Pressable>
            ))}
          </View>
          <AppButton title={t('createProduct')} variant="success" onPress={() => router.push('/admin/products/new')} />
        </View>
      }
      ListEmptyComponent={
        loading
          ? <ActivityIndicator style={styles.loading} color={palette.gold} />
          : <EmptyState
            title={error ? t('errorTitle') : t('noProducts')}
            body={error ?? t('refreshError')}
          />
      }
      renderItem={({ item }) => (
        <View style={adminStyles.card}>
          <View style={adminStyles.row}>
            <ProductImage uri={resolveImageUrl(item.imageUrl)} style={styles.image} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={adminStyles.muted}>{t(item.category)}</Text>
              <Text style={styles.price}>{formatRwf(item.price)}</Text>
              <Text style={item.stock === 0 ? styles.out : item.stock <= 5 ? styles.low : styles.stock}>
                {item.stock === 0 ? t('outOfStockLabel') : item.stock <= 5 ? t('lowStockWarning', { count: item.stock }) : `${item.stock} ${t('stockQuantity').toLowerCase()}`}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <Pressable onPress={() => router.push({ pathname: '/admin/products/[id]/edit', params: { id: item.id } })}><Text style={adminStyles.action}>{t('edit')}</Text></Pressable>
            <Pressable onPress={() => router.push({ pathname: '/admin/products/[id]/restock', params: { id: item.id } })}><Text style={styles.restock}>{t('restock')}</Text></Pressable>
            <Pressable onPress={() => confirmDelete(item)}><Text style={styles.delete}>{t('delete')}</Text></Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { gap: 12, marginBottom: 4 },
  loading: { marginTop: 24 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 18, backgroundColor: palette.white },
  selectedFilter: { backgroundColor: palette.gold },
  filterText: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  selectedFilterText: { color: palette.white },
  image: { width: 76, height: 88, borderRadius: 10, backgroundColor: palette.goldLight },
  info: { flex: 1, gap: 4 },
  name: { color: palette.ink, fontSize: 15, fontWeight: '700' },
  price: { color: palette.ink, fontWeight: '700', fontSize: 14 },
  stock: { color: palette.success, fontSize: 12, fontWeight: '700' },
  low: { color: palette.warning, fontSize: 12, fontWeight: '700' },
  out: { color: palette.danger, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, paddingTop: 14 },
  restock: { color: palette.warning, fontSize: 13, fontWeight: '700' },
  delete: { color: palette.danger, fontSize: 13, fontWeight: '700' },
});
