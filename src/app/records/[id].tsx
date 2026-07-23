import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, Button, Chip, ActivityIndicator, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../config/supabase';
import { useRecordStore } from '../../features/record/store';
import { useAuthStore } from '../../features/auth/store';
import type { Record } from '../../shared/types';

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { deleteRecord } = useRecordStore();
  const [record, setRecord] = useState<Record | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      supabase
        .from('records')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          setRecord(data as Record);
          setLoading(false);
        });
    }
  }, [id]);

  const handleDelete = async () => {
    if (record) {
      await deleteRecord(record.id);
      router.back();
    }
  };

  if (loading) return <ActivityIndicator style={styles.loading} />;
  if (!record) return <Text>記録が見つかりません</Text>;

  const isOwner = session?.user?.id === record.user_id;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">{record.title}</Text>
        {isOwner && (
          <View style={styles.actions}>
            <IconButton icon="pencil" onPress={() => router.push(`/records/${record.id}/edit`)} />
            <IconButton icon="delete" onPress={handleDelete} />
          </View>
        )}
      </View>
      <Text variant="bodySmall" style={styles.date}>
        {record.date_from} 〜 {record.date_to}
      </Text>
      <Chip style={styles.visibility}>
        {record.visibility === 'public' ? '公開' : '非公開'}
      </Chip>
      {record.location_tags.length > 0 && (
        <View style={styles.tags}>
          {record.location_tags.map((tag) => (
            <Chip key={tag} style={styles.tag}>{tag}</Chip>
          ))}
        </View>
      )}
      <Text style={styles.body}>{record.body}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  loading: { flex: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row' },
  date: { color: 'gray', marginBottom: 8 },
  visibility: { alignSelf: 'flex-start', marginBottom: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 12 },
  tag: { marginRight: 4 },
  body: { marginTop: 8, lineHeight: 24 },
});
