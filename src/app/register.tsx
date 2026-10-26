import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signUp } from '@/redux/slices/authSlice';

const schema = Yup.object({
  name: Yup.string().min(2, 'Enter your full name.').required('Name is required.'),
  email: Yup.string().email('Enter a valid email address.').required('Email is required.'),
  password: Yup.string()
    .min(10, 'Use at least 10 characters.')
    .matches(/[A-Z]/, 'Include at least one uppercase letter.')
    .matches(/[0-9]/, 'Include at least one number.')
    .required('Password is required.'),
  confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'Passwords must match.').required('Confirm your password.'),
});

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text onPress={() => router.back()} style={styles.back}>‹  BACK</Text>
      <Text style={styles.brand}>D&amp;G</Text>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.intro}>Join us for considered pieces and thoughtful service.</Text>
      {error ? <Message error>{error}</Message> : null}
      <Formik
        initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
        validationSchema={schema}
        onSubmit={async ({ name, email, password }) => {
          const result = await dispatch(signUp({ name, email, password }));
          if (signUp.fulfilled.match(result)) router.replace('/(tabs)');
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <AppInput label="Full name" value={values.name} onChangeText={handleChange('name')} onBlur={handleBlur('name')} error={touched.name ? errors.name : undefined} autoComplete="name" />
            <AppInput label="Email address" value={values.email} onChangeText={handleChange('email')} onBlur={handleBlur('email')} error={touched.email ? errors.email : undefined} autoCapitalize="none" keyboardType="email-address" />
            <AppInput label="Password" value={values.password} onChangeText={handleChange('password')} onBlur={handleBlur('password')} error={touched.password ? errors.password : undefined} secureTextEntry />
            <AppInput label="Confirm password" value={values.confirmPassword} onChangeText={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')} error={touched.confirmPassword ? errors.confirmPassword : undefined} secureTextEntry />
            <AppButton title="CREATE ACCOUNT" onPress={() => handleSubmit()} loading={isLoading} />
          </>
        )}
      </Formik>
      <Text style={styles.footer}>Already have an account? <Link href="/login" style={styles.link}>Sign in</Link></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 14, backgroundColor: palette.paper },
  back: { color: palette.muted, fontSize: 11, letterSpacing: 1 },
  brand: { color: palette.ink, fontSize: 32, letterSpacing: 7, textAlign: 'center', marginTop: 12 },
  title: { color: palette.ink, fontSize: 25, fontWeight: '600', textAlign: 'center', marginTop: 5 },
  intro: { color: palette.muted, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  footer: { color: palette.muted, fontSize: 13, textAlign: 'center', marginVertical: 12 },
  link: { color: palette.gold, textDecorationLine: 'underline' },
});
