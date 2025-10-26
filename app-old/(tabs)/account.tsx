// app/(tabs)/account.tsx
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

type Club = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
};

type ProfileRow = {
  user_id: string;
  my_club_id: string | null;
  // no bio, no avatar_url here
};

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [myClub, setMyClub] = useState<Club | null>(null);
  const [watchlistCount, setWatchlistCount] = useState<number>(0);
  const [myReviewsCount, setMyReviewsCount] = useState<number>(0);

  const CARD = useMemo(
    () => ({
      borderWidth: 1 as const,
      borderRadius: 12,
      backgroundColor: 'white',
      padding: 12,
      borderColor: '#E5E7EB',
    }),
    []
  );

  async function loadAll() {
    const { data: userRes, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      Alert.alert('Auth error', userErr.message);
      return;
    }
    const user = userRes?.user;

    if (!user) {
      setEmail(null);
      setProfile(null);
      setMyClub(null);
      setWatchlistCount(0);
      setMyReviewsCount(0);
      return;
    }
    setEmail(user.email ?? null);

    // Ensure row exists (safe upsert on PK user_id)
    await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: false });

    // Fetch YOUR profile (only select columns that exist)
    const { data: prof, error: profErr } = await supabase
      .from('user_profiles')
      .select('user_id,my_club_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profErr) Alert.alert('Profile error', profErr.message);
    setProfile((prof as ProfileRow) ?? null);

    // Counts, scoped to this user
    const [{ count: wlCount }, { count: revCount }] = await Promise.all([
      supabase.from('user_watchlist').select('club_id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setWatchlistCount(typeof wlCount === 'number' ? wlCount : 0);
    setMyReviewsCount(typeof revCount === 'number' ? revCount : 0);

    // Load My Club details if set
    if (prof?.my_club_id) {
      const { data: club } = await supabase
        .from('clubs')
        .select('id,name,city,state')
        .eq('id', prof.my_club_id)
        .maybeSingle();
      setMyClub((club as Club) || null);
    } else {
      setMyClub(null);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadAll();
      setLoading(false);
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setEmail(null);
    setProfile(null);
    setMyClub(null);
    setWatchlistCount(0);
    setMyReviewsCount(0);
    router.replace('/(tabs)/index');
  };

  const Header = () => {
    const initials = (email || 'U').slice(0, 1).toUpperCase();

    return (
      <View style={{ alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderColor: '#E5E7EB' }}>
        {/* Simple circle with initials (no avatar_url dependency) */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: '#DBEAFE',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1D4ED8' }}>{initials}</Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '800' }}>{email || 'Signed out'}</Text>

        <View style={{ marginTop: 12, width: '90%', flexDirection: 'row', gap: 10 }}>
          {email ? (
            <>
              <Link href="/(tabs)/account/edit" asChild>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: '#1565C0',
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Edit profile</Text>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity
                onPress={signOut}
                style={{
                  width: 120,
                  backgroundColor: '#EF4444',
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Sign out</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Link href="/auth/login" asChild>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#1565C0',
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: 'white', fontWeight: '700' }}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      </View>
    );
  };

  const MyClubCard = () => (
    <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>My Club</Text>
      {myClub ? (
        <Link href={`/club/${myClub.id}`} asChild>
          <TouchableOpacity style={[CARD]}>
            <Text style={{ fontWeight: '700' }} numberOfLines={1}>
              {myClub.name}
            </Text>
            <Text style={{ marginTop: 4 }} numberOfLines={1}>
              {(myClub.city || 'Unknown')}, {myClub.state || '—'}
            </Text>
            <Text style={{ marginTop: 8, color: '#1565C0', fontWeight: '700' }}>View club</Text>
          </TouchableOpacity>
        </Link>
      ) : (
        <View style={[CARD]}>
          <Text>You haven’t set a club yet.</Text>
          <Link href="/(tabs)/explore" asChild>
            <TouchableOpacity style={{ marginTop: 10 }}>
              <Text style={{ color: '#1565C0', fontWeight: '700' }}>Find clubs</Text>
            </TouchableOpacity>
          </Link>
        </View>
      )}
    </View>
  );

  const QuickLinks = () => (
    <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Your stuff</Text>
      <View style={{ gap: 10 }}>
        <Link href="/(tabs)/account/watchlist" asChild>
          <TouchableOpacity
            style={[CARD, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
          >
            <Text style={{ fontWeight: '700' }}>Watchlist</Text>
            <Text style={{ color: '#6B7280' }}>{watchlistCount}</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(tabs)/account/reviews" asChild>
          <TouchableOpacity
            style={[CARD, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
          >
            <Text style={{ fontWeight: '700' }}>My reviews</Text>
            <Text style={{ color: '#6B7280' }}>{myReviewsCount}</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView edges={['top','bottom']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top','bottom']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: Math.max(12, insets.bottom) }}
      >
        <Header />
        <MyClubCard />
        <QuickLinks />
      </ScrollView>
    </SafeAreaView>
  );
}
