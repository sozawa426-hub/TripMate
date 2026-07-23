import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRecordStore } from '../../features/record/store';
import type { Record } from '../../shared/types';
import { supabase } from '../../config/supabase';

export default function EditRecordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { updateRecord } = useRecordStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [locationTags, setLocationTags] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      supabase
        .from('records')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          const r = data as Record;
          setTitle(r.title);
          setBody(r.body);
          setDateFrom(r.date_from);
          setDateTo(r.date_to);
          setVisibility(r.visibility);
          setLocationTags(r.location_tags.join(', '));
        });
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!id || !title || !body || !dateFrom || !dateTo) {
      Alert.alert('エラー', '必須項目を入力してください');
      return;
    }
    setLoading(true);
    try {
      await updateRecord(id, {
        title,
        body,
        date_from: dateFrom,
        date_to: dateTo,
        visibility,
        location_tags: locationTags ? locationTags.split(',').map((t) => t.trim()) : [],
      });
      router.back();
    } catch {
      Alert.alert('エラー', '更新に失敗しました');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput label="タイトル *" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
      <TextInput label="本文 *" value={body} onChangeText={setBody} mode="outlined" multiline numberOfLines={6} style={styles.input} />
      <TextInput label="開始日 (YYYY-MM-DD) *" value={dateFrom} onChangeText={setDateFrom} mode="outlined" style={styles.input} />
      <TextInput label="終了日 (YYYY-MM-DD) *" value={dateTo} onChangeText={setDateTo} mode="outlined" style={styles.input} />
      <TextInput label="場所タグ (カンマ区切り)" value={locationTags} onChangeText={setLocationTags} mode="outlined" style={styles.input} />
      <Text variant="bodyMedium" style={styles.label}>公開範囲</Text>
      <SegmentedButtons
        value={visibility}
        onValueChange={(v) => setVisibility(v as 'private' | 'public')}
        buttons={[
          { value: 'private', label: '非公開' },
          { value: 'public', label: '公開' },
        ]}
        style={styles.input}
      />
      <Button mode="contained" onPress={handleUpdate} loading={loading} style={styles.button}>
        更新
      </Button>
      <Button mode="text" onPress={() => router.back()}>
        キャンセル
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 12 },
  label: { marginBottom: 8 },
  button: { marginTop: 8 },
});
