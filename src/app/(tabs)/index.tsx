import { useEffect, useMemo, useState } from 'react';
import {
  FlatList, ImageBackground, RefreshControl, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { ProductGridSkeleton } from '@/components/ui/loading-skeleton';
import { ProductCard } from '@/components/product-card';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { refreshProducts, setFilters } from '@/redux/slices/productSlice';

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, loading, error, filters } = useAppSelector((state) => state.products);
  const [search, setSearch] = useState(filters.search ?? '');

  useEffect(() => {
    void dispatch(refreshProducts({}));
  }, [dispatch]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((product) =>
      (!query || `${product.name} ${product.category}`.toLowerCase().includes(query))
      && (!filters.category || product.category === filters.category)
      && (filters.minPrice === undefined || product.price >= filters.minPrice)
      && (filters.maxPrice === undefined || product.price <= filters.maxPrice));
  }, [filters.category, filters.maxPrice, filters.minPrice, items, search]);

  const categories = ['All', ...Array.from(new Set(items.map((item) => item.category)))];

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={visibleProducts}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => <ProductCard product={item} />}
      ListHeaderComponent={
        <View>
          <View style={styles.topline}>
            <Text style={styles.brand}>D&amp;G</Text>
            <Text style={styles.location}>KIGALI · RWANDA</Text>
          </View>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200' }}
            style={styles.hero}
            imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <Text style={styles.heroEyebrow}>MADE FOR YOUR EVERY DAY</Text>
            <Text style={styles.heroTitle}>{t('featured')}</Text>
            <Text style={styles.heroCaption}>{t('shopNow')}</Text>
          </ImageBackground>
          <View style={styles.search}>
            <AppInput
              label={t('search')}
              placeholder={t('search')}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {categories.map((category) => {
              const selected = category === 'All' ? !filters.category : category === filters.category;
              return (
                <Text
                  key={category}
                  onPress={() => dispatch(setFilters({ ...filters, category: category === 'All' ? undefined : category }))}
                  style={[styles.chip, selected && styles.selectedChip]}>
                  {category}
                </Text>
              );
            })}
          </ScrollView>
          {error ? <Message error>{error} Showing the available collection while you retry.</Message> : null}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('featured')}</Text>
            <Text style={styles.count}>{visibleProducts.length} ITEMS</Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        loading ? <ProductGridSkeleton /> : <Text style={styles.empty}>No products match your search.</Text>
      }
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={() => { void dispatch(refreshProducts({})); }}
          tintColor={palette.gold}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { paddingHorizontal: 18, paddingBottom: 24 },
  topline: { height: 62, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 24, letterSpacing: 6, color: palette.ink, fontWeight: '500' },
  location: { fontSize: 9, letterSpacing: 1.5, color: palette.muted },
  hero: { height: 260, justifyContent: 'flex-end', padding: 22, marginBottom: 18, backgroundColor: '#766A60' },
  heroImage: { borderRadius: 4 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.28)' },
  heroEyebrow: { fontSize: 10, letterSpacing: 2, color: palette.white, marginBottom: 8 },
  heroTitle: { fontSize: 27, fontWeight: '600', color: palette.white, marginBottom: 12 },
  heroCaption: { fontSize: 11, letterSpacing: 1.5, color: palette.white },
  search: { marginBottom: 12 },
  chips: { gap: 8, paddingVertical: 6 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, overflow: 'hidden', color: palette.ink, backgroundColor: palette.white, fontSize: 12 },
  selectedChip: { color: palette.white, backgroundColor: palette.ink },
  sectionHeader: { marginTop: 22, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, color: palette.ink, fontWeight: '600' },
  count: { color: palette.muted, fontSize: 9, letterSpacing: 1.2 },
  row: { gap: 14 },
  empty: { padding: 30, textAlign: 'center', color: palette.muted },
});
