import { useState } from 'react';
import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { authService } from '@/api/authService';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const schema = Yup.object({
    email: Yup.string().email(t('invalidEmail')).required(t('required')),
  });

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brandMark}>{t('brand')}</Text>
      <Text style={styles.title}>{t('forgotPasswordTitle')}</Text>
      <Text style={styles.intro}>{t('forgotPasswordIntro')}</Text>
      {submitted ? (
        <View style={styles.card}>
          <Message>{t('forgotPasswordSent')}</Message>
          <AppButton title={t('continueToReset')} onPress={() => router.push('/reset-password')} />
        </View>
      ) : (
        <Formik
          initialValues={{ email: '' }}
          validationSchema={schema}
          onSubmit={async ({ email }) => {
            setError(null);
            try {
              await authService.forgotPassword(email);
              setSubmitted(true);
            } catch (submitError) {
              setError(submitError instanceof Error ? submitError.message : t('unknownError'));
            }
          }}>
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View style={styles.card}>
              {error ? <Message error>{error}</Message> : null}
              <AppInput
                label={t('email')}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                error={touched.email ? errors.email : undefined}
              />
              <AppButton
                title={t('sendInstructions')}
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
  footerLink: { color: palette.gold, fontWeight: '700', textAlign: 'center' },
});
