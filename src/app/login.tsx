import { useEffect } from 'react';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { clearAuthError, signIn } from '@/redux/slices/authSlice';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email address.').required('Email is required.'),
  password: Yup.string().min(8, 'Use at least 8 characters.').required('Password is required.'),
});

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error, session } = useAppSelector((state) => state.auth);
  const params = useLocalSearchParams<{ returnTo?: string }>();

  useEffect(() => {
    if (session) {
      const destination = params.returnTo;
      if (destination === '/checkout') router.replace('/checkout');
      else if (destination === '/(tabs)/orders') router.replace('/(tabs)/orders');
      else if (destination === '/(tabs)/profile') router.replace('/(tabs)/profile');
      else router.replace('/(tabs)');
    }
  }, [params.returnTo, session]);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brand}>D&amp;G</Text>
      <Text style={styles.eyebrow}>WELCOME BACK</Text>
      <Text style={styles.title}>Sign in to your account</Text>
      <Text style={styles.intro}>Sign in to checkout and keep track of your orders.</Text>
      {error ? <Message error>{error}</Message> : null}
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={schema}
        onSubmit={async (values) => {
          await dispatch(signIn(values));
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <AppInput
              label="Email address"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              error={touched.email ? errors.email : undefined}
            />
            <AppInput
              label="Password"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              error={touched.password ? errors.password : undefined}
            />
            <Link href="/forgot-password" style={styles.link}>Forgot password?</Link>
            <AppButton title="SIGN IN" onPress={() => handleSubmit()} loading={isLoading} />
          </>
        )}
      </Formik>
      <Text style={styles.footer}>New to D&amp;G? <Link href="/register" style={styles.link}>Create an account</Link></Text>
      <Text onPress={() => { dispatch(clearAuthError()); router.replace('/(tabs)'); }} style={styles.guest}>Continue browsing as a guest</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 15, backgroundColor: palette.paper },
  brand: { color: palette.ink, fontSize: 34, letterSpacing: 8, textAlign: 'center' },
  eyebrow: { color: palette.gold, fontSize: 10, textAlign: 'center', letterSpacing: 2, marginTop: 14 },
  title: { color: palette.ink, fontSize: 25, textAlign: 'center', fontWeight: '600' },
  intro: { color: palette.muted, textAlign: 'center', marginBottom: 10, fontSize: 14 },
  link: { color: palette.gold, textDecorationLine: 'underline', fontSize: 13, alignSelf: 'flex-end' },
  footer: { color: palette.muted, textAlign: 'center', fontSize: 13, marginTop: 8 },
  guest: { color: palette.muted, textAlign: 'center', textDecorationLine: 'underline', padding: 10 },
});
