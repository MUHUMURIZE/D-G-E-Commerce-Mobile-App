import { Stack } from 'expo-router';
import { AdminGate } from '@/components/admin-gate';
import { palette } from '@/constants/palette';

export default function AdminLayout() {
  return (
    <AdminGate>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.paper },
      }} />
    </AdminGate>
  );
}
