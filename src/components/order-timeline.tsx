import { StyleSheet, Text, View } from 'react-native';
import { palette } from '@/constants/palette';
import type { OrderStatus } from '@/types';

const steps: { status: OrderStatus; title: string; description: string }[] = [
  { status: 'placed', title: 'Order placed', description: 'We have received your order.' },
  { status: 'confirmed', title: 'Confirmed', description: 'The order is being prepared.' },
  { status: 'shipped', title: 'On its way', description: 'Your order is with our delivery team.' },
  { status: 'delivered', title: 'Delivered', description: 'Your order has arrived.' },
];

export function OrderTimeline({ status }: { status: OrderStatus }) {
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
              <Text style={[styles.title, complete && styles.activeText]}>{step.title}</Text>
              <Text style={styles.description}>{step.description}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  step: { minHeight: 70, flexDirection: 'row', gap: 14 },
  track: { width: 20, alignItems: 'center' },
  dot: { width: 13, height: 13, borderRadius: 7, borderWidth: 1, borderColor: palette.line, backgroundColor: palette.white, zIndex: 1 },
  activeDot: { borderColor: palette.gold, backgroundColor: palette.gold },
  line: { position: 'absolute', top: 12, bottom: 0, width: 1, backgroundColor: palette.line },
  activeLine: { backgroundColor: palette.gold },
  copy: { flex: 1, paddingBottom: 16 },
  title: { color: palette.muted, fontSize: 14, fontWeight: '600' },
  activeText: { color: palette.ink },
  description: { marginTop: 4, color: palette.muted, fontSize: 12 },
});
