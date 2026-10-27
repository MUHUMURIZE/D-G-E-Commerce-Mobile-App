import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';
import type { OrderStatus } from '@/types';

const steps: { status: OrderStatus; title: string }[] = [
  { status: 'Pending', title: 'pending' },
  { status: 'Confirmed', title: 'confirmed' },
  { status: 'Packing', title: 'packing' },
  { status: 'Shipped', title: 'shipped' },
  { status: 'Delivered', title: 'delivered' },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const { t } = useTranslation();
  const activeIndex = steps.findIndex((step) => step.status === status);
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const complete = index <= activeIndex;
        return (
          <View key={step.status} style={styles.step}>
            <View style={styles.track}>
              <View style={[styles.dot, complete && styles.activeDot]} />
              {index < steps.length - 1 ? <View style={[styles.line, index < activeIndex && styles.activeLine]} /> : null}
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, complete && styles.activeText]}>{t(step.title)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  step: { minHeight: 58, flexDirection: 'row', gap: 14 },
  track: { width: 20, alignItems: 'center' },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: palette.line, backgroundColor: palette.white, zIndex: 1 },
  activeDot: { borderColor: palette.success, backgroundColor: palette.success },
  line: { position: 'absolute', top: 12, bottom: 0, width: 1, backgroundColor: palette.line },
  activeLine: { backgroundColor: palette.success },
  copy: { flex: 1, paddingBottom: 16 },
  title: { color: palette.muted, fontSize: 14, fontWeight: '600' },
  activeText: { color: palette.ink, fontWeight: '800' },
  description: { marginTop: 4, color: palette.muted, fontSize: 12 },
});
