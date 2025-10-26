// app/(tabs)/account/watchlist.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

type WatchRow = { club_id: string };
type Club = { id: string; name: string; city: string | null; state: string | null };

type ClubVM = Club & {
  avg: number | null;
  count: number;
};

const Stars = ({ value = 0, size = 14 }: { value?: number | null; size?: number }) => {
  const v = Math.max(0, Math.min(5, Math.round(Number(value || 0))));
  return <Text style={{ fontSize: size }}>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</Text>;
};

export default function WatchlistScreen() {
  const [items, setItems] = useState<ClubVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 52;

  const loadData = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) {
      Alert.alert('Sign in required', 'Please log in to view your watchlist.');
      router.replace('/auth/login');
      return;
    }

    // 1) Get watchlist club ids
    const { data: wl, error: wErr } = await supabase
      .from('user_watchlist')
      .select('club_id');
    if (wErr) {
      Alert.alert('Error', wErr.message);
      return;
    }

    const clubIds = Array.from(new Set((wl || []).map((r: WatchRow) => r.club_id))).filter(Boolean);
    if (!clubIds.length) {
      setItems([]);
      setLoading(false);
      return;
    }

    // 2) Fetch clubs
    const { data: clubs, error: cErr } = await supabase
      .from('clubs')
      .select('id,name,city,state')
      .in('id', clubIds);
    if (cErr) {
      Alert.alert('Error', cErr.message);
      return;
    }
    const clubMap: Record<string, Club> = {};
    (clubs || []).forEach((c: any) => { clubMap[c.id] = c as Club; });

    // 3) Fetch reviews for these clubs, compute avg + count in JS
    const { data: revs, error: rErr } = await supabase
      .from('reviews')
      .select('club_id,rating')
      .in('club_id', clubIds);
    if (rErr) {
      Alert.alert('Error', rErr.message);
      return;
    }
    const buckets: Record<string, number[]> = {};
    (revs || []).forEach((r: any) => {
      const cid = String(r.club_id);
      if (!buckets[cid]) buckets[cid] = [];
      const v = Number(r.rating || 0);
      if (Number.isFinite(v) && v > 0) buckets[cid].push(v);
    });

    const result: ClubVM[] = clubIds
      .map((cid) => {
        const base = clubMap[cid];
        if (!base) return null;
        const arr = buckets[cid] || [];
        const avg = arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : null;
        return {
          ...base,
          avg,
          count: arr.length,
        };
      })
      .filter(Boolean) as ClubVM[];

    // Sort by name (optional)
    result.sort((a, b) => a.name.localeCompare(b.name));

    setItems(result);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadData();
    })();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const renderItem = ({ item }: { item: ClubVM }) => (
    <TouchableOpacity
      onPress={() => router.push(`/club/${item.id}`)}
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
      }}
    >
      <Text style={{ fontWeight: '800', fontSize: 16 }}>{item.name}</Text>
      <Text style={{ color: '#6B7280', marginTop: 2 }}>
        {item.city || 'Unknown'}, {item.state || '—'}
      </Text>

      {/* Rating row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
        <Stars value={item.avg} size={16} />
        <Text style={{ fontWeight: '700' }}>
          {item.avg !== null ? item.avg.toFixed(1) : '—'}/5
        </Text>
        <Text style={{ color: '#6B7280' }}>
          · {item.count} {item.count === 1 ? 'review' : 'reviews'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading watchlist…</Text>
      </SafeAreaView>
    );
  }

  const Header = (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: insets.top + 4,
        paddingBottom: 10,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        zIndex: 10,
      }}
    >
      <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, borderRadius: 999 }}>
        <Ionicons name="chevron-back" size={22} color="#111827" />
      </TouchableOpacity>
      <Text style={{ fontSize: 18, fontWeight: '800' }}>My Watchlist</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      {Header}

      <FlatList
        data={items}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 8, // match the compact header offset
          paddingHorizontal: 16,
          paddingBottom: 40 + Math.max(insets.bottom, 8),
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80, gap: 12 }}>
            <Text style={{ color: '#6B7280' }}>Your watchlist is empty.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/explore')}
              style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 }}
            >
              <Text style={{ fontWeight: '700' }}>Find Clubs</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
