import { ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AdminHeader, adminStyles } from '@/components/admin/admin-header';
import { NotificationPlaceholder } from '@/components/notification-center';

export default function NotificationsScreen() {
  const { t } = useTranslation();
  return (
    <ScrollView style={adminStyles.screen} contentContainerStyle={adminStyles.content}>
      <AdminHeader title={t('notificationTitle')} />
      <NotificationPlaceholder />
    </ScrollView>
  );
}
