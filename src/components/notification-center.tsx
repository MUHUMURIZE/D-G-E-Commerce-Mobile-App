import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';

type NotificationType = 'success' | 'error';

interface ToastMessage {
  id: number;
  message: string;
  type: NotificationType;
}

interface NotificationContextValue {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);
  const notify = useCallback((message: string, type: NotificationType = 'success') => {
    setToast({ id: ++nextId.current, message, type });
  }, []);
  const value = useMemo(() => ({ notify }), [notify]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(
      () => setToast((current) => current?.id === toast.id ? null : current),
      toast.type === 'error' ? 4000 : 3000,
    );
    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {toast ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLiveRegion="polite"
          onPress={() => setToast(null)}
          style={[styles.toast, toast.type === 'error' ? styles.errorToast : styles.successToast]}>
          <Text style={styles.toastIcon}>{toast.type === 'error' ? '×' : '✓'}</Text>
          <Text style={styles.toastText}>{toast.message}</Text>
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
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: palette.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  successToast: { backgroundColor: palette.success },
  errorToast: { backgroundColor: palette.danger },
  toastIcon: { color: palette.white, fontSize: 20, fontWeight: '800' },
  toastText: { flex: 1, color: palette.white, fontSize: 14, fontWeight: '600' },
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
