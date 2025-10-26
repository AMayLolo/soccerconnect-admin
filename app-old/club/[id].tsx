// app/club/[id].tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { supabase } from '../../lib/supabase';

type Category = 'parent' | 'player' | 'staff';
type Club = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
};

type ReviewRow = {
  id: string;
  club_id: string;
  user_id: string | null;
  rating: number | null;
  comment: string | null;
  category: Category | null;
  inserted_at: string | null;
  helpful_count: number | null;
};

const Stars = ({ value = 0, size = 14 }: { value?: number | null; size?: number }) => {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return <Text style={{ fontSize: size }}>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</Text>;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const CatChip = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: active ? '#1565C0' : '#E5E7EB',
      backgroundColor: active ? '#E8F0FE' : 'white',
    }}
  >
    <Text style={{ fontWeight: '700', color: active ? '#1565C0' : '#111827' }}>{label}</Text>
  </TouchableOpacity>
);

// ---------- Rating breakdown helpers ----------
type Breakdown = {
  overall: { avg: number | null; count: number };
  perCat: Record<Category, { avg: number | null; count: number }>;
};

function computeBreakdown(rows: Array<{ rating: number | null; category: Category | null }>): Breakdown {
  const all: number[] = [];
  const by: Record<Category, number[]> = { parent: [], player: [], staff: [] };
  rows.forEach((r) => {
    const v = Number(r.rating ?? 0);
    if (!Number.isFinite(v) || v <= 0) return;
    all.push(v);
    if (r.category && by[r.category]) by[r.category].push(v);
  });
  const avg = (arr: number[]) => (arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : null);
  return {
    overall: { avg: avg(all), count: all.length },
    perCat: {
      parent: { avg: avg(by.parent), count: by.parent.length },
      player: { avg: avg(by.player), count: by.player.length },
      staff: { avg: avg(by.staff), count: by.staff.length },
    },
  };
}

const ProgBar = ({ value }: { value: number }) => (
  <View style={{ height: 6, backgroundColor: '#E5E7EB', borderRadius: 999, overflow: 'hidden' }}>
    <View style={{ width: `${Math.max(0, Math.min(100, value))}%`, height: '100%', backgroundColor: '#1565C0' }} />
  </View>
);

// ---------- Main screen ----------
export default function ClubScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const clubId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<'all' | Category>('all');
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [pageFrom, setPageFrom] = useState(0);
  const [isEnd, setIsEnd] = useState(false);
  const PAGE_SIZE = 12;
  const [userId, setUserId] = useState<string | null>(null);
  const [myClubId, setMyClubId] = useState<string | null>(null);
  const [inWatch, setInWatch] = useState<boolean>(false);
  const isMyClub = club && myClubId === club?.id;

  const [breakdown, setBreakdown] = useState<Breakdown>({
    overall: { avg: null, count: 0 },
    perCat: { parent: { avg: null, count: 0 }, player: { avg: null, count: 0 }, staff: { avg: null, count: 0 } },
  });

  // Load club, profile, watchlist, reviews, and breakdown
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      setUserId(u?.user?.id ?? null);
      const { data: c } = await supabase
        .from('clubs')
        .select('id,name,city,state,website')
        .eq('id', clubId)
        .maybeSingle();
      setClub((c as Club) || null);
      const [{ data: prof }, { data: wl }] = await Promise.all([
        supabase.from('user_profiles').select('my_club_id').maybeSingle(),
        supabase.from('user_watchlist').select('club_id').eq('club_id', clubId),
      ]);
      setMyClubId(prof?.my_club_id ?? null);
      setInWatch((wl || []).length > 0);
      await Promise.all([resetAndLoadReviews(), loadRatingBreakdown()]);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  // ---------- Data fetching ----------
  const fetchReviews = useCallback(
    async (from: number) => {
      let query = supabase
        .from('reviews_with_counts')
        .select('id,club_id,user_id,rating,comment,category,inserted_at,helpful_count')
        .eq('club_id', clubId)
        .order('inserted_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (cat !== 'all') query = query.eq('category', cat);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ReviewRow[];
    },
    [clubId, cat]
  );

  const resetAndLoadReviews = useCallback(
    async () => {
      setIsEnd(false);
      setPageFrom(0);
      const page = await fetchReviews(0);
      setReviews(page);
      if (page.length < PAGE_SIZE) setIsEnd(true);
    },
    [fetchReviews]
  );

  const loadMore = useCallback(async () => {
    if (isEnd || loading) return;
    const nextFrom = pageFrom + PAGE_SIZE;
    const page = await fetchReviews(nextFrom);
    setReviews((prev) => [...prev, ...page]);
    setPageFrom(nextFrom);
    if (page.length < PAGE_SIZE) setIsEnd(true);
  }, [fetchReviews, isEnd, loading, pageFrom]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([resetAndLoadReviews(), loadRatingBreakdown()]);
    setRefreshing(false);
  };

  useEffect(() => {
    resetAndLoadReviews();
  }, [cat, resetAndLoadReviews]);

  async function toggleWatch() {
    if (!userId || !club) {
      Alert.alert('Sign in required', 'Please sign in to use watchlist.');
      return;
    }
    if (inWatch) {
      const { error } = await supabase.from('user_watchlist').delete().eq('club_id', club.id);
      if (error) return Alert.alert('Error', error.message);
      setInWatch(false);
    } else {
      const { error } = await supabase.from('user_watchlist').insert({ club_id: club.id });
      if (error) return Alert.alert('Error', error.message);
      setInWatch(true);
    }
  }

  async function setAsMyClub() {
    if (!userId || !club) {
      Alert.alert('Sign in required', 'Please sign in to set your club.');
      return;
    }
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, my_club_id: club.id }, { onConflict: 'user_id' });
    if (error) return Alert.alert('Error', error.message);
    setMyClubId(club.id);
  }

  async function toggleHelpful(review: ReviewRow) {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to mark reviews helpful.');
      return;
    }
    const { data: existing } = await supabase
      .from('review_helpful')
      .select('review_id')
      .eq('review_id', review.id)
      .eq('user_id', uid);
    const already = (existing || []).length > 0;
    if (already) {
      await supabase.from('review_helpful').delete().eq('review_id', review.id).eq('user_id', uid);
    } else {
      await supabase.from('review_helpful').insert({ review_id: review.id, user_id: uid });
    }
    const { data: updated } = await supabase
      .from('reviews_with_counts')
      .select('helpful_count')
      .eq('id', review.id)
      .maybeSingle();
    setReviews((prev) =>
      prev.map((r) =>
        r.id === review.id
          ? { ...r, helpful_count: (updated as any)?.helpful_count ?? r.helpful_count }
          : r
      )
    );
  }

  async function reportReview(reviewId: string) {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user?.id) {
      Alert.alert('Sign in required', 'Please sign in to report reviews.');
      return;
    }
    Alert.alert(
      'Report review',
      'Why are you reporting this review?',
      [
        {
          text: 'Spam / Off-topic',
          onPress: async () => {
            const { error } = await supabase.from('review_reports').insert({
              review_id: reviewId,
              user_id: u.user.id,
              reason: 'spam',
            });
            if (error) return Alert.alert('Error', error.message);
            Alert.alert('Reported', 'Thanks for the heads up.');
          },
        },
        {
          text: 'Abusive / Harassment',
          onPress: async () => {
            const { error } = await supabase.from('review_reports').insert({
              review_id: reviewId,
              user_id: u.user.id,
              reason: 'abuse',
            });
            if (error) return Alert.alert('Error', error.message);
            Alert.alert('Reported', 'We’ll take a look.');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }

  async function loadRatingBreakdown() {
    const { data } = await supabase.from('reviews').select('rating,category').eq('club_id', clubId);
    const rows = (data || []) as Array<{ rating: number | null; category: Category | null }>;
    setBreakdown(computeBreakdown(rows));
  }

  // ---------- Header ----------
  const header = (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 4,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        backgroundColor: 'white',
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: '800' }}>{club?.name}</Text>
      <Text style={{ marginTop: 4, color: '#374151' }}>
        {(club?.city || 'Unknown')}, {club?.state || '—'}
      </Text>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <TouchableOpacity
          onPress={setAsMyClub}
          style={{ paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: '700' }}>{isMyClub ? 'My Club ✓' : 'Set as My Club'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleWatch}
          style={{ paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: '700' }}>{inWatch ? 'Watching ✓' : 'Add to Watchlist'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push({ pathname: '/review/new', params: { id: clubId } })}
          style={{ paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 10 }}
        >
          <Text style={{ fontWeight: '700' }}>Add Review</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Breakdown */}
      <View style={{ marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Stars value={breakdown.overall.avg || 0} size={18} />
            <Text style={{ fontSize: 18, fontWeight: '800' }}>
              {breakdown.overall.avg !== null ? breakdown.overall.avg.toFixed(1) : '—'}/5
            </Text>
          </View>
          <Text style={{ color: '#6B7280' }}>
            {breakdown.overall.count} {breakdown.overall.count === 1 ? 'review' : 'reviews'}
          </Text>
        </View>

        <View style={{ marginTop: 12, gap: 10 }}>
          {(['parent', 'player', 'staff'] as Category[]).map((k) => {
            const row = breakdown.perCat[k];
            const share = breakdown.overall.count ? (row.count / breakdown.overall.count) * 100 : 0;
            const label = k === 'parent' ? 'Parent' : k === 'player' ? 'Player' : 'Staff';
            return (
              <View key={k}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '700' }}>{label}</Text>
                  <Text style={{ color: '#6B7280' }}>
                    {row.avg !== null ? row.avg.toFixed(1) : '—'}/5 · {row.count}
                  </Text>
                </View>
                <View style={{ marginTop: 6 }}>
                  <ProgBar value={share} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Category filters */}
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <CatChip label="All" active={cat === 'all'} onPress={() => setCat('all')} />
        <CatChip label="Parent" active={cat === 'parent'} onPress={() => setCat('parent')} />
        <CatChip label="Player" active={cat === 'player'} onPress={() => setCat('player')} />
        <CatChip label="Staff" active={cat === 'staff'} onPress={() => setCat('staff')} />
      </View>
    </View>
  );

  // ---------- Review items (now tappable) ----------
  const renderReview = ({ item }: { item: ReviewRow }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/review/${item.id}`)}
      style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Stars value={item.rating || 0} />
        <Text style={{ opacity: 0.6 }}>{formatDate(item.inserted_at)}</Text>
      </View>
      {item.category && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 999,
              backgroundColor: '#EEF2FF',
              borderWidth: 1,
              borderColor: '#C7D2FE',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#3730A3' }}>
              {String(item.category).toUpperCase()}
            </Text>
          </View>
        </View>
      )}
      {item.comment ? <Text style={{ marginTop: 8 }} numberOfLines={3}>{item.comment}</Text> : null}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
        <TouchableOpacity onPress={() => toggleHelpful(item)} style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
          <Text style={{ color: '#1565C0', fontWeight: '700' }}>
            Helpful • {item.helpful_count ?? 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => reportReview(item.id)} style={{ paddingVertical: 6, paddingHorizontal: 8 }}>
          <Text style={{ color: '#6B7280', fontWeight: '700' }}>Report</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading || !club) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading club…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />
      <FlatList
        data={reviews}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={header}
        renderItem={renderReview}
        onEndReachedThreshold={0.3}
        onEndReached={loadMore}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={<View style={{ padding: 24 }}><Text>No reviews yet for this filter.</Text></View>}
      />
    </SafeAreaView>
  );
}
