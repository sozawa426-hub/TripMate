import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, SegmentedButtons, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useRecordStore } from '../../features/record/store';
import { useAuthStore } from '../../features/auth/store';

export default function CreateRecordScreen() {
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const { createRecord } = useRecordStore();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [locationTags, setLocationTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title || !body || !dateFrom || !dateTo || !session?.user?.id) {
      Alert.alert('エラー', '必須項目を入力してください');
      return;
    }
    setLoading(true);
    try {
      await createRecord({
        user_id: session.user.id,
        title,
        body,
        date_from: dateFrom,
        date_to: dateTo,
        visibility,
        location_tags: locationTags ? locationTags.split(',').map((t) => t.trim()) : [],
        trip_id: null,
      });
      router.back();
    } catch {
      Alert.alert('エラー', '作成に失敗しました');
    }
    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput label="タイトル *" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
      <TextInput label="本文 *" value={body} onChangeText={setBody} mode="outlined" multiline numberOfLines={6} style={styles.input} />
      <TextInput label="開始日 (YYYY-MM-DD) *" value={dateFrom} onChangeText={setDateFrom} mode="outlined" style={styles.input} placeholder="2026-08-01" />
      <TextInput label="終了日 (YYYY-MM-DD) *" value={dateTo} onChangeText={setDateTo} mode="outlined" style={styles.input} placeholder="2026-08-03" />
      <TextInput label="場所タグ (カンマ区切り)" value={locationTags} onChangeText={setLocationTags} mode="outlined" style={styles.input} placeholder="京都, 清水寺" />
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
      <Button mode="contained" onPress={handleCreate} loading={loading} style={styles.button}>
        作成
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
