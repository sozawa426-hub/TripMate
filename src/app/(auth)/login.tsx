import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Link } from 'expo-router';
import { supabase } from '../../config/supabase';
import { useAuthStore } from '../../features/auth/store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setSession = useAuthStore((s) => s.setSession);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (authError) {
      setError(authError.message);
    } else {
      setSession(data.session);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        TripMate
      </Text>
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
      <Button mode="contained" onPress={handleLogin} loading={loading} style={styles.button}>
        ログイン
      </Button>
      <Link href="/(auth)/register" asChild>
        <Button mode="text">新規登録はこちら</Button>
      </Link>
      <Link href="/(auth)/reset-password" asChild>
        <Button mode="text">パスワードを忘れた</Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { textAlign: 'center', marginBottom: 30 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  error: { color: 'red', textAlign: 'center', marginBottom: 8 },
});
