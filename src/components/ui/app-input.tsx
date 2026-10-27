import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/constants/palette';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export function AppInput({ label, error, style, ...props }: AppInputProps) {
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = props.secureTextEntry === true;
  const input = (
    <TextInput
      placeholderTextColor={palette.muted}
      style={[styles.input, error ? styles.inputError : undefined, isPassword && styles.passwordInput, style]}
      accessibilityLabel={label}
      {...props}
      secureTextEntry={isPassword && !passwordVisible}
    />
  );

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      {isPassword ? (
        <View style={[styles.passwordField, error ? styles.inputError : undefined]}>
          {input}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(passwordVisible ? 'hidePassword' : 'showPassword')}
            accessibilityState={{ selected: passwordVisible }}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.visibilityButton}>
            <View style={styles.eye}>
              <View style={styles.pupil} />
              {!passwordVisible ? <View style={styles.eyeSlash} /> : null}
            </View>
          </Pressable>
        </View>
      ) : input}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: palette.ink, fontSize: 13, fontWeight: '700' },
  input: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 13,
    color: palette.ink,
    backgroundColor: palette.white,
    fontSize: 15,
  },
  passwordField: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 13,
    backgroundColor: palette.white,
  },
  passwordInput: { flex: 1, minWidth: 0, borderWidth: 0, backgroundColor: 'transparent' },
  visibilityButton: { width: 48, minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  eye: {
    width: 19,
    height: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: palette.muted,
    borderRadius: 10,
  },
  pupil: { width: 5, height: 5, borderRadius: 3, backgroundColor: palette.muted },
  eyeSlash: {
    position: 'absolute',
    width: 23,
    height: 1.5,
    backgroundColor: palette.muted,
    transform: [{ rotate: '45deg' }],
  },
  inputError: { borderColor: palette.danger },
  error: { color: palette.danger, fontSize: 12 },
});
