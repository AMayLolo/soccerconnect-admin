import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../lib/supabase';

// --- State lookup (full name <-> abbrev)
const STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon',
  PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota',
  TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia',
  WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'District of Columbia',
};
const NAME_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATES).map(([ab, name]) => [name.toLowerCase(), ab])
);

type Club = { id: string; name: string; city: string | null; state: string | null; website: string | null };

const RECENTS_KEY = 'recent_clubs_v1';

// normalize user input into 2-letter state if possible
function normalizeState(input: string): string | null {
  const q = input.trim().toLowerCase();
  if (!q) return null;
  if (q.length <= 3) {
    const ab = q.toUpperCase();
    return STATES[ab] ? ab : null;
  }
  return NAME_TO_ABBR[q] ?? null;
}

async function loadRecents(): Promise<Club[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENTS_KEY);
    return raw ? (JSON.parse(raw) as Club[]) : [];
  } catch {
    return [];
  }
}

async function saveRecentClub(c: Club) {
  try {
    const current = await loadRecents();
    const filtered = current.filter((x) => x.id !== c.id);
    const next = [c, ...filtered].slice(0, 12);
    await AsyncStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {}
}

export default function Explore() {
  const router = useRouter();

  // UI state
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [stateModal, setStateModal] = useState(false);
  const [stateQuery, setStateQuery] = useState('');
  const [clubs, setClubs] = useState<Club[]>([]);
  const [recents, setRecents] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // debounce search
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const debouncedSearch = useMemo(() => search.trim(), [search]);

  const hasActiveFilters = debouncedSearch.length > 0 || !!stateFilter;

  async function fetchClubs() {
    // If no filters, don't hit DB — show recents
    if (!hasActiveFilters) {
      setLoading(false);
      const r = await loadRecents();
      setRecents(r);
      setClubs([]);
      return;
    }

    setLoading(true);
    try {
      let query = supabase.from('clubs').select('id,name,city,state,website');

      // text query across name OR city
      const q = debouncedSearch;
      if (q) {
        query = query.or(`name.ilike.%${q}%,city.ilike.%${q}%`);
      }

      // state filter (2-letter)
      if (stateFilter) {
        query = query.eq('state', stateFilter);
      }

      const { data, error } = await query.order('name', { ascending: true }).limit(200);
      if (error) throw error;
      setClubs((data || []) as Club[]);
      setRecents([]); // hide recents while actively filtering
    } catch (e) {
      console.log('fetchClubs error', e);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // initial: show recents
    (async () => {
      setLoading(true);
      const r = await loadRecents();
      setRecents(r);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(fetchClubs, 250);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, stateFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClubs();
    setRefreshing(false);
  };

  function clearFilters() {
    setSearch('');
    setStateFilter(null);
  }

  const openClub = async (c: Club) => {
    await saveRecentClub(c);
    setRecents(await loadRecents());
    router.push(`/club/${c.id}`);
  };

  // --- UI pieces
  const SearchBar = (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {/* State button */}
      <TouchableOpacity
        onPress={() => {
          setStateQuery('');
          setStateModal(true);
        }}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderRadius: 10,
          minWidth: 90,
          alignItems: 'center',
          backgroundColor: 'white',
        }}
      >
        <Text>{stateFilter ? stateFilter : 'State'}</Text>
      </TouchableOpacity>

      {/* Text search */}
      <View style={{ flex: 1, borderWidth: 1, borderRadius: 10, backgroundColor: 'white' }}>
        <TextInput
          placeholder="Search by club or city…"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          style={{ paddingHorizontal: 12, paddingVertical: 10 }}
          returnKeyType="search"
        />
      </View>

      {/* Clear link */}
      {(search || stateFilter) && (
        <TouchableOpacity onPress={clearFilters} style={{ justifyContent: 'center', paddingHorizontal: 4 }}>
          <Text style={{ color: '#1565C0', fontWeight: '600' }}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const StatePicker = (
    <Modal visible={stateModal} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: 'white',
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '70%',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Select state</Text>
          <View style={{ borderWidth: 1, borderRadius: 10, marginBottom: 10 }}>
            <TextInput
              placeholder="Search states… (TX or Texas)"
              value={stateQuery}
              onChangeText={(t) => {
                setStateQuery(t);
                const ab = normalizeState(t);
                if (ab) setStateFilter(ab);
              }}
              autoCapitalize="none"
              style={{ paddingHorizontal: 12, paddingVertical: 10 }}
            />
          </View>

          {/* Quick list */}
          <FlatList
            data={Object.entries(STATES)
              .filter(([ab, name]) => {
                const q = stateQuery.trim().toLowerCase();
                return !q || ab.toLowerCase().includes(q) || name.toLowerCase().includes(q);
              })
              .map(([ab, name]) => ({ ab, name }))}
            keyExtractor={(item) => item.ab}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            style={{ maxHeight: 280 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setStateFilter(item.ab);
                  setStateModal(false);
                }}
                style={{ padding: 12, borderWidth: 1, borderRadius: 10 }}
              >
                <Text style={{ fontWeight: '700' }}>
                  {item.name} ({item.ab})
                </Text>
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              <TouchableOpacity
                onPress={() => {
                  setStateFilter(null);
                  setStateModal(false);
                }}
                style={{ padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 10 }}
              >
                <Text>All states</Text>
              </TouchableOpacity>
            }
          />

          <TouchableOpacity onPress={() => setStateModal(false)} style={{ alignItems: 'center', marginTop: 14 }}>
            <Text style={{ color: '#1565C0', fontWeight: '700' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const ClubRow = ({ c }: { c: Club }) => (
    <TouchableOpacity
      onPress={() => openClub(c)}
      style={{ padding: 16, borderWidth: 1, borderRadius: 10, backgroundColor: 'white' }}
    >
      <Text style={{ fontWeight: '700' }}>{c.name}</Text>
      <Text style={{ marginTop: 2 }}>
        {(c.city || 'Unknown')}, {c.state || '—'}
      </Text>
      {!!c.website && <Text style={{ marginTop: 2, opacity: 0.7 }}>{c.website}</Text>}
    </TouchableOpacity>
  );

  const showRecents = !hasActiveFilters;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 }}>
          {SearchBar}
        </View>

        {/* subtle separation */}
        <View style={{ height: 1, backgroundColor: '#EAEAEA', marginHorizontal: 16 }} />
        <View style={{ height: 10 }} />

        {loading && clubs.length === 0 && !showRecents ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8 }}>Loading…</Text>
          </View>
        ) : showRecents ? (
          <FlatList
            data={recents}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 16 }}>
                <ClubRow c={item} />
              </View>
            )}
            ListHeaderComponent={
              <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700' }}>Recently searched</Text>
              </View>
            }
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text>No recent searches yet. Try searching for a club.</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <FlatList
            data={clubs}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <View style={{ paddingHorizontal: 16 }}>
                <ClubRow c={item} />
              </View>
            )}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
              <View style={{ padding: 16 }}>
                <Text>No clubs match your search.</Text>
              </View>
            }
            contentContainerStyle={{ paddingBottom: 16 }}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>

      {StatePicker}
    </SafeAreaView>
  );
}
