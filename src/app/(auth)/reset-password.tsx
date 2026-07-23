import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { supabase } from '../../config/supabase';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'tripmate://reset-password',
    });
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium">リセットメールを送信しました</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          パスワードリセットのリンクをメールで送信しました。
        </Text>
        <Link href="/(auth)/login" asChild>
          <Button mode="contained" style={{ marginTop: 20 }}>
            ログイン画面へ
          </Button>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        label="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleReset} loading={loading}>
        リセットメールを送信
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { marginBottom: 12 },
  error: { color: 'red', textAlign: 'center', marginBottom: 8 },
});
