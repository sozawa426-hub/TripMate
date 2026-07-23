import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function TripsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">旅程一覧</Text>
      <Text style={styles.empty}>まだ旅程がありません</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  empty: { marginTop: 20, textAlign: 'center', color: 'gray' },
});
