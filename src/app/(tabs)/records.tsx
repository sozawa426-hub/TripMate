import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, FAB, Searchbar, SegmentedButtons } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useRecordStore } from '../../features/record/store';
import { useAuthStore } from '../../features/auth/store';
import type { Record } from '../../shared/types';

export default function RecordsListScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { records, loading, fetchRecords } = useRecordStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('mine');

  useEffect(() => {
    if (session?.user?.id) {
      if (filter === 'mine') {
        fetchRecords(session.user.id);
      } else if (filter === 'public') {
        fetchRecords();
      } else {
        fetchRecords();
      }
    }
  }, [filter]);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location_tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === 'mine') return r.user_id === session?.user?.id && matchesSearch;
    if (filter === 'public') return r.visibility === 'public' && matchesSearch;
    return matchesSearch;
  });

  const renderItem = ({ item }: { item: Record }) => (
    <Card style={styles.card} onPress={() => router.push(`/records/${item.id}`)}>
      <Card.Title title={item.title} subtitle={`${item.date_from} 〜 ${item.date_to}`} />
      <Card.Content>
        <Text numberOfLines={2}>{item.body}</Text>
        {item.location_tags.length > 0 && (
          <Text variant="bodySmall" style={styles.tags}>
            {item.location_tags.join(', ')}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Searchbar placeholder="検索..." value={searchQuery} onChangeText={setSearchQuery} style={styles.search} />
      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as typeof filter)}
        buttons={[
          { value: 'mine', label: '自分の記録' },
          { value: 'public', label: '公開記録' },
          { value: 'all', label: 'すべて' },
        ]}
        style={styles.filter}
      />
      <FlatList
        data={filteredRecords}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={() => fetchRecords()}
        contentContainerStyle={styles.list}
      />
      <FAB icon="plus" style={styles.fab} onPress={() => router.push('/records/create')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  search: { margin: 16 },
  filter: { marginHorizontal: 16 },
  list: { padding: 16 },
  card: { marginBottom: 12 },
  tags: { marginTop: 4, color: 'gray' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
