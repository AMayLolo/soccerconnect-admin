// app/(tabs)/account/reviews.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '../../../lib/supabase';

type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  category: string | null;
  inserted_at: string;   // DB column
  club_id: string;
};

type ReviewVM = {
  id: string;
  rating: number;
  comment: string | null;
  category: string | null;
  created_at: string;    // UI field (mapped from inserted_at)
  club_name: string;
};

export default function ReviewsScreen() {
  const [items, setItems] = useState<ReviewVM[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u?.user?.id;
      if (!uid) {
        Alert.alert('Sign in required', 'Please log in to view your reviews.');
        router.replace('/auth/login');
        return;
      }

      // 1) Get reviews
      const { data: rows, error } = await supabase
        .from('reviews')
        .select('id, rating, comment, category, inserted_at, club_id')
        .eq('user_id', uid)
        .order('inserted_at', { ascending: false });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      const revs = (rows || []) as ReviewRow[];

      // 2) Fetch club names
      const clubIds = Array.from(new Set(revs.map(r => r.club_id))).filter(Boolean);
      const nameMap: Record<string, string> = {};
      if (clubIds.length) {
        const { data: clubs } = await supabase.from('clubs').select('id,name').in('id', clubIds);
        (clubs || []).forEach((c: any) => { nameMap[c.id] = c.name; });
      }

      // 3) Build VM
      setItems(
        revs.map(r => ({
          id: r.id,
          rating: Number(r.rating || 0),
          comment: r.comment,
          category: r.category,
          created_at: r.inserted_at,
          club_name: nameMap[r.club_id] || 'Unknown Club',
        }))
      );
      setLoading(false);
    })();
  }, [router]);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('reviews').delete().eq('id', id);
          if (error) Alert.alert('Error', error.message);
          else setItems(prev => prev.filter(r => r.id !== id));
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: ReviewVM }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push(`/review/${item.id}`)}
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
      <Text style={{ fontWeight: '700', fontSize: 16 }}>{item.club_name}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 8 }}>
        <Text style={{ fontSize: 16 }}>
          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
        </Text>
        {item.category ? <Text style={{ color: '#6B7280' }}>{item.category.toUpperCase()}</Text> : null}
      </View>
      {item.comment ? (
        <Text style={{ color: '#374151', marginTop: 6 }} numberOfLines={3}>
          {item.comment}
        </Text>
      ) : null}

      <View style={{ flexDirection: 'row', marginTop: 10, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.push(`/review/edit/${item.id}`)}
          style={{ flex: 1, backgroundColor: '#E0E7FF', borderRadius: 8, alignItems: 'center', paddingVertical: 8 }}
        >
          <Text style={{ color: '#1E40AF', fontWeight: '600' }}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={{ flex: 1, backgroundColor: '#FEE2E2', borderRadius: 8, alignItems: 'center', paddingVertical: 8 }}
        >
          <Text style={{ color: '#B91C1C', fontWeight: '600' }}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const HEADER_HEIGHT = 52;

  if (loading) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
        <StatusBar style="dark" />
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading reviews…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar style="dark" />

      {/* Header */}
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
        <Text style={{ fontSize: 18, fontWeight: '800' }}>My Reviews</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 8,
          paddingHorizontal: 16,
          paddingBottom: 40 + Math.max(insets.bottom, 8),
        }}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 80, color: '#6B7280' }}>
            You haven’t written any reviews yet.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
