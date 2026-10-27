import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { palette } from '@/constants/palette';

export function Message({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return (
    <View style={[styles.box, error ? styles.errorBox : styles.infoBox]}>
      <Text style={[styles.text, error ? styles.errorText : undefined]}>{children}</Text>
    </View>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyMark}>D&amp;G</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 15, borderRadius: 14, marginVertical: 8 },
  infoBox: { backgroundColor: palette.goldLight },
  errorBox: { backgroundColor: '#FDECEA' },
  text: { color: palette.ink, fontSize: 13, lineHeight: 18 },
  errorText: { color: palette.danger },
  empty: { alignItems: 'center', justifyContent: 'center', padding: 36, gap: 12, borderRadius: 20, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  emptyMark: { color: palette.gold, fontSize: 22, letterSpacing: 5 },
  emptyTitle: { color: palette.ink, fontSize: 20, fontWeight: '800' },
  emptyBody: { color: palette.muted, textAlign: 'center', lineHeight: 22 },
});
