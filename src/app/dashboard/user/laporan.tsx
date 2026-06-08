import { useCallback, useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native'
import Animated from 'react-native-reanimated'
import { useFocusEffect, useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import BadgeStatus from '@/components/BadgeStatus'
import { useStaggerFadeIn, usePressScale } from '@/hooks/useAnimations'

const FILTERS = ['Semua', 'Pending', 'Diproses', 'Selesai', 'Ditolak']

function LaporanCard({ report: r, index, onPress }: { report: any; index: number; onPress: () => void }) {
  const anim = useStaggerFadeIn(index)
  const press = usePressScale()
  return (
    <Animated.View style={[anim, press.animatedStyle]}>
      <TouchableOpacity style={styles.card} onPress={onPress} onPressIn={press.onPressIn} onPressOut={press.onPressOut} activeOpacity={1}>
        {r.user_avatar
          ? <Image source={{ uri: r.user_avatar }} style={styles.avatarImg} />
          : <View style={styles.avatar}><Text style={styles.avatarText}>{r.user_name?.[0]?.toUpperCase() || 'U'}</Text></View>
        }
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{r.title}</Text>
          <Text style={styles.meta}>{r.category_name} · {new Date(r.created_at).toLocaleDateString('id-ID')}</Text>
        </View>
        <BadgeStatus status={r.status} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function LaporanScreen() {
  const { token } = useAuth()
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')

  const fetchReports = useCallback(() => {
    if (!token) return
    fetch(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setReports(d.data || [])).catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  // Fetch saat screen focus + polling 5 detik
  useFocusEffect(useCallback(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 5000)
    return () => clearInterval(interval)
  }, [fetchReports]))

  const filtered = reports.filter(r => {
    const matchSearch = r.title?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'Semua' || r.status?.toLowerCase() === filter.toLowerCase()
    return matchSearch && matchFilter
  })

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Laporan</Text>
        <TextInput style={styles.search} placeholder="Cari laporan..." placeholderTextColor={Colors.white20}
          value={search} onChangeText={setSearch} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {FILTERS.map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        {loading ? (
          <ActivityIndicator color={Colors.blue400} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <Text style={styles.empty}>Tidak ada laporan</Text>
        ) : filtered.map((r, idx) => (
          <LaporanCard key={r.id} report={r} index={idx} onPress={() => router.push(`/dashboard/user/detail/${r.id}`)} />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: 'rgba(15,23,42,0.8)', borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 12 },
  search: { backgroundColor: Colors.white05, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: Colors.white },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Colors.blue500, borderColor: Colors.blue500 },
  chipText: { fontSize: 12, fontWeight: '600', color: Colors.white60 },
  chipTextActive: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white05, borderRadius: 20, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.blueBg, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.blue400, fontWeight: '700', fontSize: 13 },
  avatarImg: { width: 36, height: 36, borderRadius: 10 },
  title: { fontSize: 14, fontWeight: '600', color: Colors.white90 },
  meta: { fontSize: 12, color: Colors.white40, marginTop: 2 },
  empty: { textAlign: 'center', color: Colors.white40, marginTop: 40 },
})
