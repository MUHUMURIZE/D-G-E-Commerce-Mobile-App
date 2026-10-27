import { useState } from 'react';
import { Link, Redirect } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { authService } from '@/api/authService';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppSelector } from '@/redux/hooks';

export default function ForgotPasswordScreen() {
  const { session } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const schema = Yup.object({ email: Yup.string().email(t('invalidEmail')).required(t('required')) });

  if (session) return <Redirect href={session.user.role === 'admin' ? '/admin' : '/(tabs)'} />;

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>D&amp;G</Text>
      <Text style={styles.title}>{t('resetPassword')}</Text>
      <Text style={styles.intro}>{t('resetIntro')}</Text>
      {message ? <Message>{message}</Message> : null}
      {error ? <Message error>{error}</Message> : null}
      <Formik
        initialValues={{ email: '' }}
        validationSchema={schema}
        onSubmit={async ({ email }) => {
          setLoading(true);
          setError(null);
          setMessage(null);
          try {
            await authService.forgotPassword(email);
            setMessage(t('resetInstructions'));
          } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : t('unknownError'));
          } finally {
            setLoading(false);
          }
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <AppInput
              label={t('email')}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email ? errors.email : undefined}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AppButton title={t('sendInstructions')} onPress={() => handleSubmit()} loading={loading} />
          </>
        )}
      </Formik>
      <Link href="/login" style={styles.link}>{t('backToSignIn')}</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 16, backgroundColor: palette.paper },
  brand: { color: palette.ink, fontSize: 32, letterSpacing: 7, textAlign: 'center' },
  title: { color: palette.ink, fontSize: 25, fontWeight: '600', textAlign: 'center' },
  intro: { color: palette.muted, fontSize: 14, textAlign: 'center', lineHeight: 21 },
  link: { color: palette.gold, textAlign: 'center', textDecorationLine: 'underline', padding: 10 },
});
