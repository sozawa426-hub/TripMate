import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../features/auth/store';

export default function ProfileScreen() {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">プロフィール</Text>
      <View style={styles.info}>
        <Text variant="bodyLarge">
          メール: {session?.user?.email}
        </Text>
        <Text variant="bodyLarge">
          表示名: {session?.user?.user_metadata?.display_name ?? '-'}
        </Text>
      </View>
      <Button mode="outlined" onPress={handleLogout} style={styles.logout}>
        ログアウト
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  info: { marginTop: 20, gap: 8 },
  logout: { marginTop: 30 },
});
