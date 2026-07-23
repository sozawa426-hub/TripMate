import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { useAuthStore } from '../../features/auth/store';

export default function HomeScreen() {
  const session = useAuthStore((s) => s.session);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon size={40} icon="account" />
        <Text variant="titleLarge" style={styles.greeting}>
          こんにちは、{session?.user?.user_metadata?.display_name ?? 'ゲスト'}さん
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Title title="おすすめ旅行先" />
        <Card.Content>
          <Text>AI が提案する旅行先がここに表示されます</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="直近の旅程" />
        <Card.Content>
          <Text>予定されている旅行はありません</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Title title="旅の記録（最新）" />
        <Card.Content>
          <Text>まだ記録がありません</Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  greeting: { flex: 1 },
  card: { marginBottom: 12 },
});
