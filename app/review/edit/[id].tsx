// app/review/edit/[id].tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

type Category = 'parent' | 'player' | 'staff';

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const reviewId = typeof id === 'string' ? id : '';
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<Category | null>(null);

  // Float the button with keyboard, but keep the gap tight
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    const show = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hide = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const s1 = Keyboard.addListener(show, (e) => setKbHeight(e.endCoordinates?.height ?? 0));
    const s2 = Keyboard.addListener(hide, () => setKbHeight(0));
    return () => { s1.remove(); s2.remove(); };
  }, []);

  // Lock page scroll while scrolling the comment box
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);

  const CHIP = useMemo(() => ({
    base: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, marginRight: 8, marginTop: 6 },
    active: { borderColor: '#1565C0', backgroundColor: '#E8F0FE' },
    idle:   { borderColor: '#E5E7EB', backgroundColor: 'white' },
  }), []);

  // Load the review
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) { Alert.alert('Sign in required'); router.replace('/auth/login'); return; }

      const { data, error } = await supabase
        .from('reviews')
        .select('rating, comment, category')
        .eq('id', reviewId)
        .eq('user_id', uid)
        .maybeSingle();

      if (error) { Alert.alert('Error', error.message); router.back(); return; }
      if (!data) { Alert.alert('Not found'); router.back(); return; }

      setRating(Number(data.rating || 0));
      setComment(String(data.comment || ''));
      setCategory((data.category as Category | null) ?? null);
      setLoading(false);
    })();
  }, [reviewId, router]);

  async function save() {
    if (!rating) { Alert.alert('Missing rating', 'Please choose a rating.'); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const uid = u?.user?.id;
    const { error } = await supabase
      .from('reviews')
      .update({ rating, comment: comment || null, category: category || null })
      .eq('id', reviewId)
      .eq('user_id', uid);
    setSaving(false);
    if (error) return Alert.alert('Save failed', error.message);
    router.replace('/(tabs)/account/reviews');
  }

  const RatingPicker = () => (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
      {[1,2,3,4,5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => setRating(n)}
          style={{
            width: 44, height: 44, borderRadius: 8, borderWidth: 1,
            borderColor: n <= rating ? '#1D4ED8' : '#E5E7EB',
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: n <= rating ? '#EFF6FF' : 'white',
          }}
        >
          <Text style={{ fontSize: 18 }}>{n <= rating ? '★' : '☆'}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const CategoryPicker = () => {
    const opts: Category[] = ['parent', 'player', 'staff'];
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 }}>
        {opts.map((opt) => {
          const active = category === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => setCategory(opt)}
              style={[CHIP.base, active ? CHIP.active : CHIP.idle]}
            >
              <Text style={{ fontWeight: '700', color: active ? '#1565C0' : '#111827' }}>
                {opt === 'parent' ? 'Parent' : opt === 'player' ? 'Player' : 'Staff'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView edges={['top','bottom']} style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  const HEADER_HEIGHT = 52;

  // tighter gap above keyboard for floating button
  const buttonBottom =
    Math.max(insets.bottom, 6) + Math.max(kbHeight - 10, 0); // was 16 + kbHeight

  return (
    <SafeAreaView edges={['top','bottom']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />

      {/* Fixed top header inside safe area */}
      <View
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
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
        <Text style={{ fontSize: 18, fontWeight: '800' }}>Edit Review</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.top + HEADER_HEIGHT}
        style={{ flex: 1 }}
      >
        <ScrollView
          scrollEnabled={outerScrollEnabled}
          keyboardDismissMode="none"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{
            paddingTop: HEADER_HEIGHT + 8,     // nudge down a bit from header
            paddingHorizontal: 16,
            paddingBottom: 90 + Math.max(insets.bottom, 8),
          }}
        >
          <Text style={{ fontWeight: '700' }}>Rating</Text>
          <RatingPicker />

          <Text style={{ fontWeight: '700', marginTop: 14 }}>Category</Text>
          <CategoryPicker />

          <Text style={{ fontWeight: '700', marginTop: 14 }}>Comment</Text>

          {/* Comment area (scrolls independently) */}
          <View
            style={{
              marginTop: 6,
              minHeight: 120,
              maxHeight: 240,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ flexGrow: 1 }}
              onTouchStart={() => setOuterScrollEnabled(false)}
              onTouchEnd={() => setOuterScrollEnabled(true)}
              onScrollBeginDrag={() => setOuterScrollEnabled(false)}
              onScrollEndDrag={() => setOuterScrollEnabled(true)}
            >
              <TextInput
                multiline
                value={comment}
                onChangeText={setComment}
                placeholder="Share your experience…"
                scrollEnabled
                style={{ padding: 10, textAlignVertical: 'top', minHeight: 120 }}
              />
            </ScrollView>
          </View>
        </ScrollView>

        {/* Floating Save button (reduced gap to keyboard) */}
        <View
          style={{
            position: 'absolute',
            left: 16, right: 16,
            bottom: buttonBottom,
            borderRadius: 12,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
        >
          <TouchableOpacity
            onPress={save}
            disabled={saving}
            style={{ paddingVertical: 12, backgroundColor: saving ? '#93C5FD' : '#1565C0', alignItems: 'center' }} // slightly thinner
          >
            <Text style={{ color: 'white', fontWeight: '700' }}>{saving ? 'Saving…' : 'Save changes'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
