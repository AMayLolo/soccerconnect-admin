import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase, SUPABASE_URL } from '../../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams<{ next?: string; id?: string }>();

  async function healthCheck() {
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/health`);
      Alert.alert('Auth health', `status: ${res.status}`);
    } catch (e: any) {
      Alert.alert('Health error', String(e?.message || e));
      console.log('Health error', e);
    }
  }

  async function signIn() {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.log('signIn error', error);
        return Alert.alert('Sign in failed', error.message);
      }
      if (params?.next) {
        router.replace({ pathname: String(params.next), params: { id: params?.id } });
      } else {
        router.back();
      }
    } catch (e: any) {
      console.log('signIn network error', e);
      Alert.alert('Network', String(e?.message || e));
    }
  }

  async function signUp() {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        console.log('signUp error', error);
        return Alert.alert('Sign up failed', error.message);
      }
      Alert.alert('Account created', 'You can sign in now.');
    } catch (e: any) {
      console.log('signUp network error', e);
      Alert.alert('Network', String(e?.message || e));
    }
  }

  async function resetPassword() {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://example.com',
      });
      if (error) return Alert.alert('Reset failed', error.message);
      Alert.alert('Check your email for reset instructions');
    } catch (e: any) {
      Alert.alert('Network', String(e?.message || e));
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 60 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 16 }}>Sign in</Text>

      <TouchableOpacity onPress={healthCheck} style={{ padding: 10, borderWidth: 1, borderRadius: 8, marginBottom: 16 }}>
        <Text style={{ textAlign: 'center' }}>Run Auth Health Check</Text>
      </TouchableOpacity>

      <Text style={{ marginBottom: 6 }}>Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 12 }}
      />

      <Text style={{ marginBottom: 6 }}>Password</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 16 }}
      />

      <TouchableOpacity onPress={signIn} style={{ padding: 12, borderWidth: 1, borderRadius: 8 }}>
        <Text style={{ textAlign: 'center' }}>Sign in</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signUp} style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginTop: 10 }}>
        <Text style={{ textAlign: 'center' }}>Create account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetPassword} style={{ padding: 12, borderRadius: 8, marginTop: 10 }}>
        <Text style={{ textAlign: 'center', color: '#007AFF' }}>Forgot password?</Text>
      </TouchableOpacity>
    </View>
  );
}

