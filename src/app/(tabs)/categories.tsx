import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  const categories = useMemo(
    () => Array.from(new Set(items.map((product) => product.category.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [items],
  );
  const selectedPrice = priceRanges.findIndex((range) => range.min === filters.minPrice && range.max === filters.maxPrice);
  const filteredProducts = items.filter((product) =>
    (!filters.category || product.category === filters.category)
    && (filters.minPrice === undefined || product.price >= filters.minPrice)
    && (filters.maxPrice === undefined || product.price <= filters.maxPrice));

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
      {error ? <Message error>{error}</Message> : null}
      {loading && !items.length ? <ActivityIndicator style={styles.loading} color={palette.gold} /> : null}
      {!loading && !items.length && !error ? <EmptyState title={t('noProducts')} body={t('loadProductsError')} /> : null}
      {!!items.length ? (
        <>
          <Text style={styles.subTitle}>{t('categoriesAvailable', { count: categories.length })}</Text>
          <View style={styles.categories}>
            <CategoryTile
              label={t('all')}
              count={items.length}
              active={!filters.category}
              onPress={() => dispatch(setFilters({ ...filters, category: undefined }))}
            />
            {categories.map((category) => {
              const count = items.filter((product) => product.category.trim() === category).length;
              return (
                <CategoryTile
                  key={category}
                  label={t(category)}
                  count={count}
                  active={category === filters.category}
                  onPress={() => dispatch(setFilters({ ...filters, category }))}
                />
              );
            })}
          </View>
          <Text style={styles.subTitle}>{t('priceRwf')}</Text>
          <View style={styles.options}>
            {priceRanges.map((range, index) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: selectedPrice === index }}
                key={range.key}
                onPress={() => dispatch(setFilters({
                  ...filters,
                  minPrice: range.min,
                  maxPrice: range.max,
                }))}
                style={[styles.option, selectedPrice === index && styles.activeOption]}>
                <Text style={[styles.optionText, selectedPrice === index && styles.activeOptionText]}>
                  {range.key === 'anyPrice'
                    ? t(range.key)
                    : range.key === 'betweenAmounts'
                      ? t(range.key, { min: '100,000', max: '180,000' })
                      : t(range.key, { amount: range.key === 'underAmount' ? '100,000' : '180,000' })}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.productsHeader}>
            <Text style={styles.subTitle}>{t('productsCount', { count: filteredProducts.length })}</Text>
            {filters.category ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => dispatch(setFilters({ ...filters, category: undefined }))}
                style={styles.clearCategory}>
                <Text style={styles.clearCategoryText}>{t('clearCategory')}</Text>
              </Pressable>
            ) : null}
          </View>
          {filteredProducts.length ? (
            <View style={styles.grid}>
              {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </View>
          ) : (
            <EmptyState title={t('noMatchingProducts')} body={t('clearCategory')} />
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

function CategoryTile({ label, count, active, onPress }: { label: string; count: number; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.categoryTile, active && styles.activeCategoryTile]}>
      <Text numberOfLines={1} style={[styles.categoryName, active && styles.activeCategoryText]}>{label}</Text>
      <Text style={[styles.categoryCount, active && styles.activeCategoryText]}>{count}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36 },
  eyebrow: { marginTop: 12, color: palette.gold, fontSize: 10, letterSpacing: 2 },
  title: { marginTop: 8, marginBottom: 8, fontSize: 26, fontWeight: '700', color: palette.ink },
  loading: { marginTop: 28 },
  subTitle: { color: palette.muted, letterSpacing: 0.4, fontSize: 12, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryTile: { width: '46%', minHeight: 68, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: palette.line, borderRadius: 13, backgroundColor: palette.white },
  activeCategoryTile: { backgroundColor: palette.gold, borderColor: palette.gold },
  categoryName: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  categoryCount: { marginTop: 4, color: palette.muted, fontSize: 11 },
  activeCategoryText: { color: palette.white },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { paddingVertical: 9, paddingHorizontal: 12, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, borderRadius: 20 },
  activeOption: { backgroundColor: palette.gold, borderColor: palette.gold },
  optionText: { color: palette.ink, fontSize: 12, fontWeight: '600' },
  activeOptionText: { color: palette.white },
  productsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  clearCategory: { paddingVertical: 8, paddingHorizontal: 10 },
  clearCategoryText: { color: palette.gold, fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12 },
});
