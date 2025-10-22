import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SUPABASE_URL } from '../../lib/supabase';

export default function NetDebug() {
  const [log, setLog] = useState<string>('');

  async function run() {
    const lines: string[] = [];
    const add = (s: string) => { lines.push(s); setLog(lines.join('\n')); };

    add(`SUPABASE_URL: ${SUPABASE_URL}`);

    // 1) Public internet sanity check
    try {
      const r = await fetch('https://api.ipify.org?format=json');
      add(`ipify status: ${r.status}`);
      add(`ipify body: ${await r.text()}`);
    } catch (e: any) {
      add(`ipify error: ${String(e?.message || e)}`);
    }

    // 2) Supabase Auth health
    try {
      const r = await fetch(`${SUPABASE_URL}/auth/v1/health`);
      add(`auth health status: ${r.status}`);
      add(`auth health body: ${await r.text()}`);
    } catch (e: any) {
      add(`auth health error: ${String(e?.message || e)}`);
    }

    // 3) Supabase REST hello (should 200/404 but NOT network error)
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/`);
      add(`rest root status: ${r.status}`);
      add(`rest root body: ${await r.text()}`);
    } catch (e: any) {
      add(`rest root error: ${String(e?.message || e)}`);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, paddingTop: 60 }}>
      <TouchableOpacity onPress={run} style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 12 }}>
        <Text style={{ textAlign: 'center' }}>Run Network Tests</Text>
      </TouchableOpacity>
      <ScrollView style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Courier', fontSize: 12, lineHeight: 18 }}>{log || 'Tap the button above…'}</Text>
      </ScrollView>
    </View>
  );
}
