import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../features/auth/store';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const setSession = useAuthStore((s) => s.setSession);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (authError) {
      setError(authError.message);
    } else if (data.session) {
      setSession(data.session);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Text variant="headlineMedium">確認メールを送信しました</Text>
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          メールアドレスに確認リンクを送信しました。リンクをクリックして登録を完了してください。
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
        label="表示名"
        value={displayName}
        onChangeText={setDisplayName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="メールアドレス"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="contained" onPress={handleRegister} loading={loading} style={styles.button}>
        新規登録
      </Button>
      <Link href="/(auth)/login" asChild>
        <Button mode="text">ログインはこちら</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  error: { color: 'red', textAlign: 'center', marginBottom: 8 },
});
