import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
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
  website: string | null;
};

type ProfileRow = { user_id: string; my_club_id: string | null };

type ReviewItem = {
  id: string;
  club_id: string;
  rating: number | null;
  comment: string | null;
  category?: 'parent' | 'player' | 'staff' | null;
  inserted_at: string | null;
  clubs: Club;
};

const { height: SCREEN_H } = Dimensions.get('window');

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const mins = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
};

const Stars = ({ value = 0, size = 14 }: { value?: number | null; size?: number }) => {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return <Text style={{ fontSize: size }}>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</Text>;
};

const SwipeNudgeStaticUnderCard = () => (
  <View style={{ marginTop: 8, alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginRight: 8, color: '#6B7280' }}>{'‹'}</Text>
      <View style={{ width: 44, height: 3, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
      <Text style={{ fontSize: 20, marginLeft: 8, color: '#6B7280' }}>{'›'}</Text>
    </View>
  </View>
);

const SwipeNudgeOverlay = ({ bottom = -8 }: { bottom?: number }) => (
  <View style={{ position: 'absolute', left: 0, right: 0, bottom, alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, marginRight: 10, color: '#6B7280' }}>{'‹'}</Text>
      <View style={{ width: 56, height: 3.5, backgroundColor: '#CBD5E1', borderRadius: 2 }} />
      <Text style={{ fontSize: 22, marginLeft: 10, color: '#6B7280' }}>{'›'}</Text>
    </View>
  </View>
);

const HEIGHT_FULL = 110;
const HEIGHT_TILE = 110;
const TILE_WIDTH = 210;
const ACTIVITY_CARD_HEIGHT = 150;
const ACTIVITY_CARD_WIDTH = 280;

const BadgesRow = ({
  isMy,
  inWatch,
  category,
}: {
  isMy?: boolean;
  inWatch?: boolean;
  category?: 'parent' | 'player' | 'staff' | null;
}) => {
  const catStyles: Record<string, { bg: string; border: string; text: string; label: string }> = {
    parent: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C', label: 'PARENT' },
    player: { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', label: 'PLAYER' },
    staff:  { bg: '#ECFEFF', border: '#A5F3FC', text: '#155E75', label: 'STAFF'  },
  };

  const chips: Array<{ key: string; bg: string; border: string; text: string; label: string }> = [];
  if (isMy)    chips.push({ key: 'my',    bg: '#E8F5E9', border: '#CDE8D1', text: '#2E7D32', label: 'MY CLUB' });
  if (inWatch) chips.push({ key: 'watch', bg: '#E3F2FD', border: '#CDE7FB', text: '#1565C0', label: 'WATCHLIST' });
  if (category) {
    const s = catStyles[category];
    chips.push({ key: `cat-${category}`, bg: s.bg, border: s.border, text: s.text, label: s.label });
  }
  if (!chips.length) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
      {chips.map((c) => (
        <View
          key={c.key}
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: c.bg,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: c.text }}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [myClub, setMyClub] = useState<Club | null>(null);
  const [myClubAvg, setMyClubAvg] = useState<number | null>(null);
  const [myClubCount, setMyClubCount] = useState<number>(0);
  const [watchlist, setWatchlist] = useState<Club[]>([]);
  const [wlRatings, setWlRatings] = useState<Record<string, { avg: number | null; count: number }>>({});
  const [activity, setActivity] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const watchlistIds = useMemo(() => new Set(watchlist.map((w) => w.id)), [watchlist]);

  const CARD_BASE = {
    borderWidth: 1 as const,
    borderRadius: 12,
    backgroundColor: 'white',
    width: '100%' as const,
    padding: 12,
    overflow: 'hidden' as const,
  };

  const ClubCard = ({
    c,
    cardHeight,
    small = false,
    rating,
    widthOverride,
  }: {
    c: Club;
    cardHeight: number;
    small?: boolean;
    rating?: { avg: number | null; count: number };
    widthOverride?: number;
  }) => (
    <TouchableOpacity
      onPress={() => router.push(`/club/${c.id}`)}
      style={[
        CARD_BASE,
        small
          ? { height: cardHeight, width: widthOverride ?? TILE_WIDTH, padding: 12 }
          : { height: cardHeight, width: '100%' },
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: small ? 15 : 16, fontWeight: '700', flex: 1 }} numberOfLines={1}>
          {c.name}
        </Text>
        {!!rating && (
          <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
            <Stars value={Math.round(rating.avg || 0)} size={14} />
            <Text style={{ fontSize: 12, opacity: 0.7 }}>
              {rating.avg !== null ? rating.avg.toFixed(1) : '—'} · {rating.count}
            </Text>
          </View>
        )}
      </View>
      <Text style={{ marginTop: 4, color: '#333' }} numberOfLines={1}>
        {(c.city || 'Unknown')}, {c.state || '—'}
      </Text>
    </TouchableOpacity>
  );

  async function loadClubRating(clubId: string) {
    try {
      const [{ count }, { data }] = await Promise.all([
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('club_id', clubId),
        supabase.from('reviews').select('rating').eq('club_id', clubId),
      ]);
      const rows = (data as Array<{ rating: number | null }>) || [];
      const vals = rows.map((r) => Number(r.rating || 0)).filter((n) => !Number.isNaN(n));
      const avg = vals.length ? vals.reduce((s, n) => s + n, 0) / vals.length : null;
      setMyClubAvg(avg);
      setMyClubCount(typeof count === 'number' ? count : vals.length);
    } catch {
      setMyClubAvg(null);
      setMyClubCount(0);
    }
  }

  async function loadRatingsForClubs(ids: string[]) {
    if (!ids.length) {
      setWlRatings({});
      return;
    }
    const { data } = await supabase.from('reviews').select('club_id,rating').in('club_id', ids);
    const map: Record<string, { sum: number; n: number }> = {};
    (data || []).forEach((r: any) => {
      const cid = r.club_id as string;
      const v = Number(r.rating || 0);
      if (!Number.isNaN(v)) {
        if (!map[cid]) map[cid] = { sum: 0, n: 0 };
        map[cid].sum += v;
        map[cid].n += 1;
      }
    });
    const out: Record<string, { avg: number | null; count: number }> = {};
    ids.forEach((id) => {
      const m = map[id];
      out[id] = m ? { avg: m.sum / m.n, count: m.n } : { avg: null, count: 0 };
    });
    setWlRatings(out);
  }

  async function loadProfileAndWatchlist() {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      setProfile(null);
      setMyClub(null);
      setMyClubAvg(null);
      setMyClubCount(0);
      setWatchlist([]);
      setWlRatings({});
      setActivity([]);
      return;
    }

    await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id }, { onConflict: 'user_id', ignoreDuplicates: false });

    const [{ data: prof }, { data: wl }] = await Promise.all([
      supabase.from('user_profiles').select('user_id,my_club_id').single(),
      supabase
        .from('user_watchlist')
        .select('club_id, clubs(id,name,city,state,website)')
        .order('inserted_at', { ascending: false }),
    ]);

    if (prof) setProfile(prof as ProfileRow);

    const wlClubs = (wl || []).map((r: any) => r.clubs).filter(Boolean) as Club[];
    setWatchlist(wlClubs);

    if (prof?.my_club_id) {
      const { data: club } = await supabase
        .from('clubs')
        .select('id,name,city,state,website')
        .eq('id', prof.my_club_id)
        .maybeSingle();
      const mc = (club as Club) || null;
      setMyClub(mc);
      if (mc?.id) await loadClubRating(mc.id);
    } else {
      setMyClub(null);
      setMyClubAvg(null);
      setMyClubCount(0);
    }

    await loadRatingsForClubs(wlClubs.map((c) => c.id));
  }

  async function loadActivityFeed(targetClubIds: string[]) {
    if (targetClubIds.length === 0) {
      setActivity([]);
      return;
    }
    const { data } = await supabase
      .from('reviews')
      .select('id, club_id, rating, comment, category, inserted_at, clubs(id,name,city,state,website)')
      .in('club_id', targetClubIds)
      .order('inserted_at', { ascending: false })
      .limit(50);
    setActivity((data || []) as ReviewItem[]);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadProfileAndWatchlist();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const ids = [
      ...(myClub?.id ? [myClub.id] : []),
      ...Array.from(watchlistIds.values()),
    ];
    loadActivityFeed(Array.from(new Set(ids)));
  }, [myClub, watchlistIds]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfileAndWatchlist();
    const ids = [
      ...(myClub?.id ? [myClub.id] : []),
      ...Array.from(watchlistIds.values()),
    ];
    await loadActivityFeed(Array.from(new Set(ids)));
    setRefreshing(false);
  };

  const Header = (
    <View style={{ backgroundColor: 'white' }}>
      <View
        style={{
          paddingTop: 10,
          paddingBottom: 10,
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#E0E0E0',
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1565C0', letterSpacing: 0.5 }}>
          Soccer Connect
        </Text>
        <Text style={{ marginTop: 4, fontSize: 12, fontWeight: '700', color: '#5F6A7D', letterSpacing: 1.2 }}>
          REVIEW AND RATE SOCCER CLUBS
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/(tabs)/explore')}
          style={{
            marginTop: 12,
            backgroundColor: '#1565C0',
            borderRadius: 10,
            paddingVertical: 12,
            width: '90%',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Find Clubs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const ActivityCard = ({ r, width }: { r: ReviewItem; width: number }) => {
    const club = r.clubs;
    const isMy = !!myClub && club.id === myClub?.id;
    const isWatch = watchlistIds.has(club.id);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/review/${r.id}`)}  // <— open Review Detail
        style={[CARD_BASE, { height: ACTIVITY_CARD_HEIGHT, width }]}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }} numberOfLines={1}>{club.name}</Text>
          <Text style={{ opacity: 0.6 }}>{formatDate(r.inserted_at)}</Text>
        </View>
        <Text style={{ marginTop: 2 }} numberOfLines={1}>
          {(club.city || 'Unknown')}, {club.state || '—'}
        </Text>
        <View style={{ marginTop: 6, flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Stars value={r.rating || 0} />
          <Text style={{ fontWeight: '600' }}>{r.rating ?? '-'}/5</Text>
        </View>
        {r.comment ? (
          <Text style={{ marginTop: 6, color: '#111827' }} numberOfLines={2} ellipsizeMode="tail">
            {r.comment}
          </Text>
        ) : null}
        <BadgesRow isMy={isMy} inWatch={isWatch} category={r.category} />
      </TouchableOpacity>
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
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingBottom: Math.max(8, insets.bottom),
          minHeight: SCREEN_H - insets.top - 24,
          flexGrow: 1,
        }}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        alwaysBounceVertical
        overScrollMode="always"
      >
        {Header}

        {/* My Club */}
        <View style={{ paddingHorizontal: 16, marginTop: 10, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>My Club</Text>
          {myClub ? (
            <ClubCard
              c={myClub}
              cardHeight={HEIGHT_FULL}
              rating={{ avg: myClubAvg, count: myClubCount }}
            />
          ) : (
            <View style={[CARD_BASE, { height: HEIGHT_FULL }]}>
              <Text style={{ marginBottom: 4 }}>You haven’t set a club yet.</Text>
              <Text style={{ opacity: 0.7 }}>Open a club and set it as “My Club”.</Text>
            </View>
          )}
        </View>

        {/* Watchlist (horizontal swipe) */}
        <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Watchlist</Text>

          {watchlist.length === 0 && (
            <View style={[CARD_BASE, { height: HEIGHT_FULL, marginTop: 8 }]}>
              <Text>No clubs in your watchlist yet.</Text>
            </View>
          )}

          {watchlist.length === 1 && (
            <View style={{ marginTop: 8 }}>
              <ClubCard
                c={watchlist[0]}
                cardHeight={HEIGHT_FULL}
                rating={wlRatings[watchlist[0].id]}
              />
              <SwipeNudgeStaticUnderCard />
            </View>
          )}

          {watchlist.length > 1 && (
            <FlatList
              style={{ marginTop: 8 }}
              horizontal
              showsHorizontalScrollIndicator={false}
              data={watchlist}
              keyExtractor={(c) => c.id}
              contentContainerStyle={{ paddingRight: 16 }}
              renderItem={({ item, index }) => (
                <View style={{ marginRight: index === watchlist.length - 1 ? 0 : 10 }}>
                  <ClubCard
                    c={item}
                    small
                    cardHeight={HEIGHT_TILE}
                    rating={wlRatings[item.id]}
                  />
                  <SwipeNudgeStaticUnderCard />
                </View>
              )}
              getItemLayout={(_, index) => ({
                length: TILE_WIDTH + 10,
                offset: (TILE_WIDTH + 10) * index,
                index,
              })}
            />
          )}
        </View>

        {/* Recent Activity (horizontal; overlay icon) */}
        <View style={{ paddingHorizontal: 16, marginBottom: 0, flexGrow: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '700' }}>Recent activity</Text>
          <Text style={{ opacity: 0.6 }}>New ratings for your club and watchlist</Text>

          {activity.length ? (
            <View style={{ marginTop: 6, position: 'relative', paddingBottom: 18 }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={activity}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 16, paddingBottom: 0 }}
                renderItem={({ item, index }) => (
                  <View style={{ marginRight: index === activity.length - 1 ? 0 : 10 }}>
                    <ActivityCard r={item} width={ACTIVITY_CARD_WIDTH} />
                  </View>
                )}
                getItemLayout={(_, index) => ({
                  length: ACTIVITY_CARD_WIDTH + 10,
                  offset: (ACTIVITY_CARD_WIDTH + 10) * index,
                  index,
                })}
              />
              <SwipeNudgeOverlay bottom={-8} />
            </View>
          ) : (
            <View style={{ marginTop: 8, alignItems: 'center', position: 'relative', paddingBottom: 18 }}>
              <View style={[CARD_BASE, { height: ACTIVITY_CARD_HEIGHT, width: '100%' }]}>
                <Text style={{ marginBottom: 6 }}>No recent reviews yet.</Text>
                <Text style={{ opacity: 0.7 }}>
                  Add clubs to your watchlist or set your club to see activity here.
                </Text>
              </View>
              <SwipeNudgeOverlay bottom={-8} />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
