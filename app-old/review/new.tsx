import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';

type Category = 'parent' | 'player' | 'staff';

const CategoryPill = ({
  label,
  value,
  active,
  onPress,
}: {
  label: string;
  value: Category;
  active: boolean;
  onPress: (v: Category) => void;
}) => {
  const colors: Record<Category, { bg: string; border: string; text: string }> = {
    parent: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
    player: { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3' },
    staff:  { bg: '#ECFEFF', border: '#A5F3FC', text: '#155E75' },
  };
  const c = colors[value];

  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        backgroundColor: active ? c.bg : 'white',
        borderColor: active ? c.border : '#E5E7EB',
      }}
    >
      <Text style={{ fontWeight: '700', color: active ? c.text : '#111827' }}>{label}</Text>
    </TouchableOpacity>
  );
};

const Stars = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity key={n} onPress={() => onChange(n)} style={{ padding: 6 }}>
          <Text style={{ fontSize: 24 }}>{n <= value ? '★' : '☆'}</Text>
        </TouchableOpacity>
      ))}
      <Text style={{ marginLeft: 8, opacity: 0.7 }}>{value}/5</Text>
    </View>
  );
};

export default function NewReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  const [category, setCategory] = useState<Category>('parent');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const clubId = useMemo(() => (typeof id === 'string' ? id : ''), [id]);

  async function submitReview() {
    if (!clubId) {
      Alert.alert('Missing club', 'No club specified for this review.');
      return;
    }
    if (rating < 1 || rating > 5) {
      Alert.alert('Invalid rating', 'Please select a rating from 1 to 5 stars.');
      return;
    }

    try {
      setSubmitting(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        setSubmitting(false);
        Alert.alert('Not signed in', 'Please sign in to post a review.');
        return;
      }

      const { error } = await supabase.from('reviews').insert({
        club_id: clubId,
        rating,
        comment: comment?.trim() || null,
        category,            // <— NEW
        user_id: userRes.user.id,
      });

      setSubmitting(false);

      if (error) {
        Alert.alert('Could not submit', error.message);
        return;
      }

      Alert.alert('Thanks!', 'Your review has been posted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (e: any) {
      setSubmitting(false);
      Alert.alert('Error', e?.message || 'Something went wrong.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 })}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Add a Review</Text>
          <Text style={{ opacity: 0.7, marginBottom: 16 }}>
            Choose a category, set a rating, and share your experience.
          </Text>

          {/* Category */}
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Review as</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <CategoryPill label="Parent" value="parent" active={category === 'parent'} onPress={setCategory} />
            <CategoryPill label="Player" value="player" active={category === 'player'} onPress={setCategory} />
            <CategoryPill label="Staff"  value="staff"  active={category === 'staff'}  onPress={setCategory} />
          </View>

          {/* Rating */}
          <Text style={{ fontWeight: '700', marginTop: 18, marginBottom: 8 }}>Rating</Text>
          <Stars value={rating} onChange={setRating} />

          {/* Comment */}
          <Text style={{ fontWeight: '700', marginTop: 18, marginBottom: 8 }}>Comment (optional)</Text>
          <TextInput
            placeholder="What stood out? Coaching, communication, facilities…"
            multiline
            value={comment}
            onChangeText={setComment}
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 10,
              padding: 12,
              textAlignVertical: 'top',
              backgroundColor: 'white',
            }}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={submitReview}
            disabled={submitting}
            style={{
              marginTop: 20,
              backgroundColor: '#1565C0',
              borderRadius: 10,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Submit review</Text>
            )}
          </TouchableOpacity>

          {/* Cancel */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
