import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { palette } from '@/constants/palette';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, style, ...props }: AppInputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={palette.muted}
        style={[styles.input, error ? styles.inputError : undefined, style]}
        accessibilityLabel={label}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: palette.ink, fontSize: 13, fontWeight: '600' },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 4,
    color: palette.ink,
    backgroundColor: palette.white,
    fontSize: 15,
  },
  inputError: { borderColor: palette.danger },
  error: { color: palette.danger, fontSize: 12 },
});
