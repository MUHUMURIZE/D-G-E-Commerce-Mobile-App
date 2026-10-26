import { useState } from 'react';
import { Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { authService } from '@/api/authService';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';

const schema = Yup.object({ email: Yup.string().email('Enter a valid email address.').required('Email is required.') });

export default function ForgotPasswordScreen() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>D&amp;G</Text>
      <Text style={styles.title}>Reset your password</Text>
      <Text style={styles.intro}>Enter your account email and we’ll send reset instructions if it exists.</Text>
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
            setMessage('If an account exists for this email, reset instructions have been sent.');
          } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unable to send reset instructions.');
          } finally {
            setLoading(false);
          }
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <AppInput
              label="Email address"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email ? errors.email : undefined}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <AppButton title="SEND INSTRUCTIONS" onPress={() => handleSubmit()} loading={loading} />
          </>
        )}
      </Formik>
      <Link href="/login" style={styles.link}>Back to sign in</Link>
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
