import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signUp } from '@/redux/slices/authSlice';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const schema = Yup.object({
    name: Yup.string().min(2, t('nameMin')).required(t('required')),
    email: Yup.string().email(t('invalidEmail')).required(t('required')),
    phone: Yup.string().matches(/^(\+?250\d{9}|0\d{9})$/, t('invalidRwandaPhone')).required(t('required')),
    password: Yup.string()
      .min(10, t('passwordRegisterMin'))
      .matches(/[A-Z]/, t('passwordUppercase'))
      .matches(/[0-9]/, t('passwordNumber'))
      .required(t('required')),
    confirmPassword: Yup.string().oneOf([Yup.ref('password')], t('passwordsMatch')).required(t('required')),
  });

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text onPress={() => router.back()} style={styles.back}>‹  {t('back')}</Text>
      <Text style={styles.brandMark}>{t('brand')}</Text>
      <Text style={styles.title}>{t('createYourAccount')}</Text>
      <Text style={styles.intro}>{t('joinIntro')}</Text>
      <Formik
        initialValues={{ name: '', email: '', phone: '', password: '', confirmPassword: '' }}
        validationSchema={schema}
        onSubmit={async ({ name, email, phone, password }) => {
          const result = await dispatch(signUp({ name, email, phone, password }));
          if (signUp.fulfilled.match(result)) router.replace(result.payload.user.role === 'admin' ? '/admin' : '/(tabs)');
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.card}>
            {error ? <Message error>{error}</Message> : null}
            <AppInput label={t('fullName')} value={values.name} onChangeText={handleChange('name')} onBlur={handleBlur('name')} error={touched.name ? errors.name : undefined} autoComplete="name" />
            <AppInput label={t('email')} value={values.email} onChangeText={handleChange('email')} onBlur={handleBlur('email')} error={touched.email ? errors.email : undefined} autoCapitalize="none" keyboardType="email-address" />
            <AppInput label={t('phone')} value={values.phone} onChangeText={handleChange('phone')} onBlur={handleBlur('phone')} error={touched.phone ? errors.phone : undefined} keyboardType="phone-pad" placeholder="+250 7XX XXX XXX" />
            <AppInput label={t('password')} value={values.password} onChangeText={handleChange('password')} onBlur={handleBlur('password')} error={touched.password ? errors.password : undefined} secureTextEntry />
            <AppInput label={t('confirmPassword')} value={values.confirmPassword} onChangeText={handleChange('confirmPassword')} onBlur={handleBlur('confirmPassword')} error={touched.confirmPassword ? errors.confirmPassword : undefined} secureTextEntry />
            <AppButton title={t('createAccount')} onPress={() => handleSubmit()} loading={isLoading} />
          </View>
        )}
      </Formik>
      <Text style={styles.footer}>{t('alreadyHaveAccount')} <Link href="/login" style={styles.footerLink}>{t('signIn')}</Link></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 36, gap: 14, backgroundColor: palette.paper },
  back: { width: '100%', maxWidth: 440, color: palette.muted, fontSize: 13, fontWeight: '600', paddingVertical: 8 },
  brandMark: { color: palette.gold, fontSize: 20, letterSpacing: 5, fontWeight: '800', textAlign: 'center', marginTop: 8 },
  title: { maxWidth: 420, color: palette.ink, fontSize: 30, fontWeight: '800', textAlign: 'center', marginTop: 5 },
  intro: { maxWidth: 360, color: palette.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 8 },
  card: { width: '100%', maxWidth: 440, gap: 15, padding: 22, borderRadius: 22, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  footer: { color: palette.muted, fontSize: 14, textAlign: 'center', marginVertical: 12 },
  footerLink: { color: palette.gold, fontWeight: '700' },
});
