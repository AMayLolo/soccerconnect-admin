// app/review/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

type Category = 'parent' | 'player' | 'staff';

type ReviewRow = {
  id: string;
  club_id: string;
  user_id: string | null;
  rating: number | null;
  comment: string | null;
  category: Category | null;
  inserted_at: string | null;
  helpful_count?: number | null; // present if using reviews_with_counts
};

const Stars = ({ value = 0, size = 18 }: { value?: number | null; size?: number }) => {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  return <Text style={{ fontSize: size }}>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</Text>;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const Chip = ({ label, color = '#3730A3', bg = '#EEF2FF', border = '#C7D2FE' }) => (
  <View
    style={{
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: bg,
      borderWidth: 1,
      borderColor: border,
    }}
  >
    <Text style={{ fontSize: 12, fontWeight: '800', color }}>{label}</Text>
  </View>
);

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const reviewId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [review, setReview] = useState<ReviewRow | null>(null);
  const [clubName, setClubName] = useState<string>('Club');
  const [isOwner, setIsOwner] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState<number>(0);
  const [helpfulMine, setHelpfulMine] = useState<boolean>(false);

  const HEADER_HEIGHT = 52;

  const catLabel = useMemo(() => {
    const c = review?.category;
    if (c === 'parent') return 'Parent';
    if (c === 'player') return 'Player';
    if (c === 'staff') return 'Staff';
    return null;
  }, [review?.category]);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      // who am I
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id || null;

      // 1) Try to get from reviews_with_counts (if you created that view)
      let data: ReviewRow | null = null;
      let err1 = null;
      {
        const { data: rwc, error } = await supabase
          .from('reviews_with_counts')
          .select('id,club_id,user_id,rating,comment,category,inserted_at,helpful_count')
          .eq('id', reviewId)
          .maybeSingle();
        data = (rwc as any) || null;
        err1 = error;
      }

      // 2) Fallback to reviews table (without helpful_count)
      if (!data) {
        const { data: r, error } = await supabase
          .from('reviews')
          .select('id,club_id,user_id,rating,comment,category,inserted_at')
          .eq('id', reviewId)
          .maybeSingle();
        if (error) throw error;
        data = (r as any) || null;
      }

      if (!data) {
        Alert.alert('Not found', 'This review could not be found.');
        router.back();
        return;
      }

      setReview(data);
      setHelpfulCount(Number((data as any)?.helpful_count || 0));
      setIsOwner(!!uid && data.user_id === uid);

      // Club name
      if (data.club_id) {
        const { data: c } = await supabase.from('clubs').select('name').eq('id', data.club_id).maybeSingle();
        setClubName((c as any)?.name || 'Club');
      } else {
        setClubName('Club');
      }

      // Did I mark helpful?
      if (uid) {
        const { data: rh } = await supabase
          .from('review_helpful')
          .select('review_id')
          .eq('review_id', reviewId)
          .eq('user_id', uid);
        setHelpfulMine((rh || []).length > 0);
      } else {
        setHelpfulMine(false);
      }
    } finally {
      setLoading(false);
    }
  }, [reviewId, router]);

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  async function toggleHelpful() {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid) {
      Alert.alert('Sign in required', 'Please sign in to mark reviews helpful.');
      return;
    }
    if (!review) return;

    if (helpfulMine) {
      const { error } = await supabase
        .from('review_helpful')
        .delete()
        .eq('review_id', review.id)
        .eq('user_id', uid);
      if (error) return Alert.alert('Error', error.message);
      setHelpfulMine(false);
      setHelpfulCount((c) => Math.max(0, c - 1));
    } else {
      const { error } = await supabase
        .from('review_helpful')
        .insert({ review_id: review.id, user_id: uid });
      if (error) return Alert.alert('Error', error.message);
      setHelpfulMine(true);
      setHelpfulCount((c) => c + 1);
    }
  }

  async function reportReview() {
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    if (!uid || !review) {
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
              review_id: review.id,
              user_id: uid,
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
              review_id: review.id,
              user_id: uid,
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

  if (loading || !review) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}
      >
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading review…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />

      {/* Compact header (same as Edit/My Reviews) */}
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
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6, borderRadius: 999 }} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: '800' }}>Review</Text>
      </View>

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 8,
          paddingHorizontal: 16,
          paddingBottom: 24 + Math.max(insets.bottom, 8),
        }}
      >
        {/* Club name + link */}
        <TouchableOpacity
          onPress={() => review?.club_id && router.push(`/club/${review.club_id}`)}
          style={{ marginBottom: 10 }}
        >
          <Text style={{ fontWeight: '800', fontSize: 18 }}>{clubName}</Text>
          <Text style={{ color: '#6B7280' }}>Tap to open club</Text>
        </TouchableOpacity>

        {/* Rating + meta */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
          <Stars value={review.rating} />
          {catLabel ? <Chip label={catLabel.toUpperCase()} /> : null}
          <Text style={{ color: '#6B7280' }}>· {formatDate(review.inserted_at)}</Text>
        </View>

        {/* Comment */}
        {review.comment ? (
          <Text style={{ marginTop: 14, lineHeight: 20 }}>{review.comment}</Text>
        ) : (
          <Text style={{ marginTop: 14, color: '#6B7280' }}>No comment provided.</Text>
        )}

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
          <TouchableOpacity
            onPress={toggleHelpful}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderWidth: 1,
              borderRadius: 10,
              borderColor: helpfulMine ? '#1565C0' : '#E5E7EB',
              backgroundColor: helpfulMine ? '#E8F0FE' : 'white',
            }}
          >
            <Text style={{ fontWeight: '800', color: helpfulMine ? '#1565C0' : '#111827' }}>
              Helpful • {helpfulCount}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={reportReview}
            style={{ paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 10 }}
          >
            <Text style={{ fontWeight: '800' }}>Report</Text>
          </TouchableOpacity>

          {isOwner ? (
            <TouchableOpacity
              onPress={() => router.push(`/review/edit/${review.id}`)}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderRadius: 10 }}
            >
              <Text style={{ fontWeight: '800' }}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
