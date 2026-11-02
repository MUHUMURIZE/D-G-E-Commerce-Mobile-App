import { useState } from 'react';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { authService } from '@/api/authService';

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const schema = Yup.object({
    token: Yup.string().trim().required(t('required')),
    newPassword: Yup.string().min(8, t('passwordMin')).required(t('required')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('passwordsMatch'))
      .required(t('required')),
  });

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brandMark}>{t('brand')}</Text>
      <Text style={styles.title}>{t('resetPasswordTitle')}</Text>
      <Text style={styles.intro}>{t('resetPasswordIntro')}</Text>
      {complete ? (
        <View style={styles.card}>
          <Message>{t('passwordResetSuccess')}</Message>
          <AppButton title={t('returnToLogin')} onPress={() => router.replace('/login')} />
        </View>
      ) : (
        <Formik
          initialValues={{
            token: typeof token === 'string' ? token : '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={schema}
          onSubmit={async ({ token: resetToken, newPassword }) => {
            setError(null);
            try {
              await authService.resetPassword(resetToken, newPassword);
              setComplete(true);
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : t('unknownError'));
            }
          }}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.card}>
              {error ? <Message error>{error}</Message> : null}
              <AppInput
                label={t('resetToken')}
                value={values.token}
                onChangeText={handleChange('token')}
                onBlur={handleBlur('token')}
                autoCapitalize="none"
                autoCorrect={false}
                error={touched.token ? errors.token : undefined}
              />
              <AppInput
                label={t('newPassword')}
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                secureTextEntry
                error={touched.newPassword ? errors.newPassword : undefined}
              />
              <AppInput
                label={t('confirmPassword')}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                secureTextEntry
                error={touched.confirmPassword ? errors.confirmPassword : undefined}
              />
              <AppButton
                title={t('resetPassword')}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
              />
            </View>
          )}
        </Formik>
      )}
      <Text style={styles.footer}>
        {t('alreadyHaveAccount')} <Link href="/login" style={styles.footerLink}>{t('signIn')}</Link>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36, gap: 14, backgroundColor: palette.paper },
  brandMark: { color: palette.gold, fontSize: 20, letterSpacing: 5, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  title: { maxWidth: 420, color: palette.ink, fontSize: 30, textAlign: 'center', fontWeight: '800' },
  intro: { maxWidth: 360, color: palette.muted, textAlign: 'center', marginBottom: 12, fontSize: 15, lineHeight: 22 },
  card: { width: '100%', maxWidth: 440, gap: 16, padding: 22, borderRadius: 22, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  footer: { color: palette.muted, textAlign: 'center', fontSize: 14, marginTop: 8 },
  footerLink: { color: palette.gold, fontWeight: '700' },
});
