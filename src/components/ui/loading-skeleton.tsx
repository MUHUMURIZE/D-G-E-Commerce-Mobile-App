import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';

export function ProductGridSkeleton() {
  const { t } = useTranslation();
  return (
    <View accessibilityLabel={t('loadingProducts')} style={styles.row}>
      {[0, 1].map((item) => (
        <View key={item} style={styles.card}>
          <View style={styles.image} />
          <View style={styles.shortLine} />
          <View style={styles.longLine} />
          <View style={styles.mediumLine} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, paddingVertical: 16 },
  card: { flex: 1, gap: 9 },
  image: { width: '100%', aspectRatio: 0.82, borderRadius: 4, backgroundColor: palette.line },
  shortLine: { width: '35%', height: 8, borderRadius: 4, backgroundColor: palette.line, marginTop: 4 },
  longLine: { width: '78%', height: 11, borderRadius: 4, backgroundColor: palette.line },
  mediumLine: { width: '48%', height: 9, borderRadius: 4, backgroundColor: palette.line },
});
