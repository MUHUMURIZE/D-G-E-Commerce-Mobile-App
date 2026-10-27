import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';
import { navigateBack } from '@/utils/navigation';

export function AdminHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('back')} onPress={() => navigateBack('/admin')}>
        <Text style={styles.back}>‹  {t('back')}</Text>
      </Pressable>
      <Text style={styles.eyebrow}>{t('adminPanel')}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export const adminStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.paper },
  content: { padding: 20, paddingBottom: 36, gap: 14 },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 14,
    backgroundColor: palette.white,
    shadowColor: palette.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { color: palette.ink, fontSize: 18, fontWeight: '700' },
  muted: { color: palette.muted, fontSize: 13, lineHeight: 19 },
  action: { color: palette.gold, fontSize: 13, fontWeight: '700' },
  badge: { color: palette.gold, fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: palette.line, marginVertical: 10 },
});

const styles = StyleSheet.create({
  wrap: { gap: 7, marginBottom: 6 },
  back: { color: palette.muted, fontSize: 13, paddingVertical: 5 },
  eyebrow: { color: palette.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase' },
  title: { color: palette.ink, fontSize: 28, fontWeight: '800' },
  subtitle: { color: palette.muted, fontSize: 14, lineHeight: 20 },
});
