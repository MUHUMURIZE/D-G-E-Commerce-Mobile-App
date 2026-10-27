import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/constants/palette';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
}

export function AppButton({ title, onPress, secondary, loading, disabled, variant = 'primary' }: AppButtonProps) {
  const isSecondary = secondary || variant === 'secondary';
  const gradientColors = variant === 'danger'
    ? ['#EF4444', '#B91C1C'] as const
    : variant === 'success'
      ? ['#22C55E', '#15803D'] as const
      : ['#3B82F6', '#1D4ED8'] as const;
  const content = loading
    ? <ActivityIndicator color={isSecondary ? palette.gold : palette.white} />
    : <Text style={[styles.label, isSecondary && styles.secondaryLabel]}>{title}</Text>;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        isSecondary && styles.secondary,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}>
      {isSecondary
        ? <>{content}</>
        : (
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}>
            {content}
          </LinearGradient>
        )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    minWidth: 120,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
    shadowColor: palette.gold,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  secondary: { backgroundColor: palette.white, borderWidth: 1, borderColor: palette.gold, shadowOpacity: 0, elevation: 0 },
  gradient: { minHeight: 54, width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  label: { color: palette.white, fontSize: 14, fontWeight: '700', letterSpacing: 0.2 },
  secondaryLabel: { color: palette.gold },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
});
