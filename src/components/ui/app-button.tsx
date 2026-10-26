import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { palette } from '@/constants/palette';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export function AppButton({ title, onPress, secondary, loading, disabled }: AppButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={secondary ? palette.ink : palette.white} />
      ) : (
        <Text style={[styles.label, secondary && styles.secondaryLabel]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: palette.ink,
  },
  secondary: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line },
  label: { color: palette.white, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  secondaryLabel: { color: palette.ink },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.82 },
});
