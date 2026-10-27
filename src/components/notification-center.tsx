import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';

interface NotificationContextValue {
  notify: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const notify = useCallback((nextMessage: string) => setMessage(nextMessage), []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {message ? (
        <Pressable accessibilityRole="button" onPress={() => setMessage(null)} style={styles.toast}>
          <Text style={styles.toastText}>{message}</Text>
        </Pressable>
      ) : null}
    </NotificationContext.Provider>
  );
}

export function NotificationPlaceholder() {
  const { t } = useTranslation();
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderTitle}>{t('notificationTitle')}</Text>
      <Text style={styles.placeholderBody}>{t('notificationPlaceholder')}</Text>
    </View>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used inside NotificationProvider.');
  return context;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 28,
    padding: 15,
    borderRadius: 12,
    backgroundColor: palette.ink,
  },
  toastText: { color: palette.white, fontSize: 14, fontWeight: '600' },
  placeholder: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: palette.white,
    borderColor: palette.line,
    borderWidth: 1,
  },
  placeholderTitle: { color: palette.ink, fontSize: 16, fontWeight: '700' },
  placeholderBody: { color: palette.muted, marginTop: 5, fontSize: 13, lineHeight: 19 },
});
