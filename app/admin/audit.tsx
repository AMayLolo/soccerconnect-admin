import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

type Snapshot = {
  id: number;
  run_at: string;
  payload: any;
};

export default function AdminAudit() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Snapshot[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Optional: guard so only you (or admins) can see this
      // const { data: u } = await supabase.auth.getUser();
      // if (u?.user?.id !== 'YOUR_USER_ID') { router.replace('/'); return; }

      const { data, error } = await supabase
        .from('audit_review_helpful_weekly')
        .select('id, run_at, payload')
        .order('run_at', { ascending: false })
        .limit(20);

      if (!error) setRows((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const renderItem = ({ item }: { item: Snapshot }) => {
    const top = Array.isArray(item.payload?.top) ? item.payload.top : [];
    return (
      <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 12, backgroundColor: 'white' }}>
        <Text style={{ fontWeight: '800', marginBottom: 6 }}>
          Snapshot: {new Date(item.run_at).toLocaleString()}
        </Text>
        {top.length === 0 ? (
          <Text style={{ color: '#6B7280' }}>No new helpful reviews for this window.</Text>
        ) : (
          top.map((r: any, idx: number) => (
            <TouchableOpacity key={idx} onPress={() => r.club_id && router.push(`/club/${r.club_id}`)} style={{ paddingVertical: 6 }}>
              <Text style={{ fontWeight: '700' }}>{r.club_name || 'Club'}</Text>
              <Text style={{ color: '#374151' }}>
                ⭐ {r.rating ?? '-'} /5 — {String(r.category || '-').toUpperCase()} · 👍 {r.helpful_count ?? 0} · {new Date(r.inserted_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
      <StatusBar style="dark" />
      <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 12 }}>Admin · Weekly Audit</Text>
      <FlatList data={rows} keyExtractor={(r) => String(r.id)} renderItem={renderItem} />
    </SafeAreaView>
  );
}
