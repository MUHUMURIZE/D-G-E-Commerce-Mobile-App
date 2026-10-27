import { Link } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/ui/app-button';
import { AppInput } from '@/components/ui/app-input';
import { Message } from '@/components/ui/message';
import { palette } from '@/constants/palette';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { signIn } from '@/redux/slices/authSlice';

export default function LoginScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const schema = Yup.object({
    email: Yup.string().email(t('invalidEmail')).required(t('required')),
    password: Yup.string().min(8, t('passwordMin')).required(t('required')),
  });

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.brandMark}>{t('brand')}</Text>
      <Text style={styles.eyebrow}>{t('welcomeBack')}</Text>
      <Text style={styles.title}>{t('signInTitle')}</Text>
      <Text style={styles.intro}>{t('signInIntro')}</Text>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={schema}
        onSubmit={async (values) => {
          await dispatch(signIn(values));
        }}>
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.card}>
            {error ? <Message error>{error}</Message> : null}
            <AppInput
              label={t('email')}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              autoCapitalize="none"
              keyboardType="email-address"
              error={touched.email ? errors.email : undefined}
            />
            <AppInput
              label={t('password')}
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              secureTextEntry
              error={touched.password ? errors.password : undefined}
            />
            <AppButton title={t('signIn')} onPress={() => handleSubmit()} loading={isLoading} />
          </View>
        )}
      </Formik>
      <Text style={styles.footer}>{t('newToStore')} <Link href="/register" style={styles.footerLink}>{t('createAccount')}</Link></Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 36, gap: 14, backgroundColor: palette.paper },
  brandMark: { color: palette.gold, fontSize: 20, letterSpacing: 5, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  eyebrow: { color: palette.gold, fontSize: 11, textAlign: 'center', letterSpacing: 2, marginTop: 8, textTransform: 'uppercase' },
  title: { maxWidth: 420, color: palette.ink, fontSize: 30, textAlign: 'center', fontWeight: '800' },
  intro: { maxWidth: 360, color: palette.muted, textAlign: 'center', marginBottom: 12, fontSize: 15, lineHeight: 22 },
  card: { width: '100%', maxWidth: 440, gap: 16, padding: 22, borderRadius: 22, backgroundColor: palette.white, borderWidth: 1, borderColor: palette.line, shadowColor: palette.shadow, shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  footer: { color: palette.muted, textAlign: 'center', fontSize: 14, marginTop: 8 },
  footerLink: { color: palette.gold, fontWeight: '700' },
});
