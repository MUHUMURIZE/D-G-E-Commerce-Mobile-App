import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ProductCard } from '@/components/product-card';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setFilters } from '@/redux/slices/productSlice';

const priceRanges = [
  { label: 'Any price', min: undefined, max: undefined },
  { label: 'Under 100,000 RWF', min: undefined, max: 100000 },
  { label: '100,000–180,000 RWF', min: 100000, max: 180000 },
  { label: 'Over 180,000 RWF', min: 180000, max: undefined },
];

export default function CategoriesScreen() {
  const dispatch = useAppDispatch();
  const { items, filters } = useAppSelector((state) => state.products);
  const categories = Array.from(new Set(items.map((item) => item.category)));
  const selectedPrice = priceRanges.findIndex((range) => range.min === filters.minPrice && range.max === filters.maxPrice);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.eyebrow}>THE COLLECTION</Text>
      <Text style={styles.title}>Browse by category</Text>
      <View style={styles.options}>
        {['All', ...categories].map((category) => {
          const active = category === 'All' ? !filters.category : category === filters.category;
          return (
            <Text
              key={category}
              onPress={() => dispatch(setFilters({ ...filters, category: category === 'All' ? undefined : category }))}
              style={[styles.option, active && styles.activeOption]}>
              {category}
            </Text>
          );
        })}
      </View>
      <Text style={styles.subTitle}>PRICE</Text>
      <View style={styles.options}>
        {priceRanges.map((range, index) => (
          <Text
            key={range.label}
            onPress={() => dispatch(setFilters({
              ...filters,
              minPrice: range.min,
              maxPrice: range.max,
            }))}
            style={[styles.option, selectedPrice === index && styles.activeOption]}>
            {range.label}
          </Text>
        ))}
      </View>
      <Text style={styles.subTitle}>PRODUCTS · {items.length}</Text>
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
