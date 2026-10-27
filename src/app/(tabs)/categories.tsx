import { useEffect } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/product-card';
import { EmptyState, Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshProducts, setFilters } from '@/redux/slices/productSlice';

const priceRanges = [
  { key: 'anyPrice', min: undefined, max: undefined },
  { key: 'underAmount', min: undefined, max: 100000 },
  { key: 'betweenAmounts', min: 100000, max: 180000 },
  { key: 'overAmount', min: 180000, max: undefined },
];

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { items, filters, loading, error } = useAppSelector((state) => state.products);
  useEffect(() => { void dispatch(refreshProducts({})); }, [dispatch]);
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const selectedPrice = priceRanges.findIndex((range) => range.min === filters.minPrice && range.max === filters.maxPrice);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => { void dispatch(refreshProducts({})); }}
          tintColor={palette.gold}
        />
      }>
      <Text style={styles.eyebrow}>{t('featuredCollection')}</Text>
      <Text style={styles.title}>{t('browseByCategory')}</Text>
      <View style={styles.options}>
        {['all', ...categories].map((category) => {
          const active = category === 'all' ? !filters.category : category === filters.category;
          return (
            <Text
              key={category}
              onPress={() => dispatch(setFilters({ ...filters, category: category === 'all' ? undefined : category }))}
              style={[styles.option, active && styles.activeOption]}>
              {category === 'all' ? t('all') : t(category)}
            </Text>
          );
        })}
      </View>
      <Text style={styles.subTitle}>{t('priceRwf')}</Text>
      <View style={styles.options}>
        {priceRanges.map((range, index) => (
          <Text
            key={range.key}
            onPress={() => dispatch(setFilters({
              ...filters,
              minPrice: range.min,
              maxPrice: range.max,
            }))}
            style={[styles.option, selectedPrice === index && styles.activeOption]}>
            {range.key === 'anyPrice'
              ? t(range.key)
              : range.key === 'betweenAmounts'
                ? t(range.key, { min: '100,000', max: '180,000' })
                : t(range.key, { amount: range.key === 'underAmount' ? '100,000' : '180,000' })}
          </Text>
        ))}
      </View>
      <Text style={styles.subTitle}>{t('productsCount', { count: items.length }).toUpperCase()}</Text>
      {error ? <Message error>{error}</Message> : null}
      {loading && !items.length ? <ActivityIndicator color={palette.gold} /> : null}
      {!loading && !items.length ? (
        <EmptyState title={t('noProducts')} body={t('loadProductsError')} />
      ) : null}
      <View style={styles.grid}>
        {items.filter((product) =>
          (!filters.category || product.category === filters.category)
          && (filters.minPrice === undefined || product.price >= filters.minPrice)
          && (filters.maxPrice === undefined || product.price <= filters.maxPrice))
          .map((product) => <ProductCard key={product.id} product={product} />)}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, marginBottom: 20, fontSize: 26, fontWeight: '600', color: palette.ink },
  subTitle: { color: palette.muted, letterSpacing: 1.2, fontSize: 10, marginTop: 22, marginBottom: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingVertical: 9, paddingHorizontal: 12, backgroundColor: palette.white, color: palette.ink, overflow: 'hidden', borderRadius: 3, fontSize: 12 },
  activeOption: { backgroundColor: palette.ink, color: palette.white },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
});
