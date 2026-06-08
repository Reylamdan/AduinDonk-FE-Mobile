import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import Animated from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import BadgeStatus from '@/components/BadgeStatus'
import { useFadeInUp, useStaggerFadeIn, usePressScale } from '@/hooks/useAnimations'
import { getNotifications } from '@/lib/notificationService'

function ReportItem({ report: r, index, onPress }: { report: any; index: number; onPress: () => void }) {
  const anim = useStaggerFadeIn(index)
  const press = usePressScale()
  return (
    <Animated.View style={[anim, press.animatedStyle]}>
      <TouchableOpacity style={styles.reportItem} onPress={onPress} onPressIn={press.onPressIn} onPressOut={press.onPressOut} activeOpacity={1}>
        {r.user_avatar
          ? <Image source={{ uri: r.user_avatar }} style={styles.avatarImg} />
          : <View style={styles.avatar}><Text style={styles.avatarText}>{r.user_name?.[0]?.toUpperCase() || 'U'}</Text></View>
        }
        <View style={{ flex: 1 }}>
          <Text style={styles.reportTitle} numberOfLines={1}>{r.title}</Text>
          <Text style={styles.reportMeta}>{r.user_name} · {r.category_name}</Text>
        </View>
        <BadgeStatus status={r.status} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function UserDashboard() {
  const { token, user } = useAuth()
  const router = useRouter()
  const [myReports, setMyReports] = useState<any[]>([])
  const [allReports, setAllReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = useCallback(() => {
    if (!token) return
    getNotifications(token).then(d => {
      const unread = (d.data || []).filter((n: any) => !n.is_read).length
      setUnreadCount(unread)
    }).catch(() => {})
  }, [token])

  useFocusEffect(useCallback(() => {
    fetchUnread()
  }, [fetchUnread]))

  useEffect(() => {
    if (!token) return
    fetch(`${API_URL}/api/reports`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setMyReports(d.data || [])).catch(() => {})
    fetch(`${API_URL}/api/reports/public`)
      .then(r => r.json()).then(d => setAllReports(d.data || [])).catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const stats = [
    { label: 'Total', value: myReports.length, color: Colors.blue400 },
    { label: 'Diproses', value: myReports.filter(r => r.status?.toLowerCase() === 'diproses').length, color: Colors.yellowText },
    { label: 'Selesai', value: myReports.filter(r => r.status?.toLowerCase() === 'selesai').length, color: Colors.greenText },
    { label: 'Ditolak', value: myReports.filter(r => r.status?.toLowerCase() === 'ditolak').length, color: Colors.redText },
  ]

  return (
    <View style={styles.container}>
      <View style={[styles.blob, { top: -80, left: -60 }]} />
      <View style={[styles.blob, { bottom: -80, right: -40, width: 250, height: 250, backgroundColor: 'rgba(8,145,178,0.12)' }]} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../../../assets/images/logo-small.png')} style={styles.logo} resizeMode="contain" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>Halo, {user?.name} 👋</Text>
            <Text style={styles.greetingSub}>Selamat datang kembali</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/dashboard/user/notifikasi')} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color={unreadCount > 0 ? Colors.blue400 : Colors.white60} />
            {unreadCount > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={styles.statsCard}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statItem, i < stats.length - 1 && styles.statDivider]}>
              <Text style={[styles.statValue, { color: s.color }]}>{loading ? '—' : s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View>
          <TouchableOpacity
            onPress={() => router.push('/dashboard/user/buat')}
            style={styles.cta}
            activeOpacity={0.7}
          >
            <Text style={styles.ctaText}>+ Buat Laporan Baru</Text>
          </TouchableOpacity>
        </View>

        {/* Feed */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Laporan Terbaru</Text>
          {loading ? (
            <ActivityIndicator color={Colors.blue400} style={{ marginTop: 20 }} />
          ) : allReports.length === 0 ? (
            <Text style={styles.empty}>Belum ada laporan</Text>
          ) : (
            allReports.slice(0, 5).map((r, idx) => (
              <ReportItem key={r.id} report={r} index={idx} onPress={() => router.push(`/dashboard/user/detail/${r.id}`)} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(37,99,235,0.15)' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logo: { width: 44, height: 44, borderRadius: 12 },
  greeting: { fontSize: 18, fontWeight: '800', color: Colors.white },
  greetingSub: { fontSize: 13, color: Colors.white40 },
  statsCard: {
    flexDirection: 'row', backgroundColor: Colors.white05, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.border, marginBottom: 16, overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  statDivider: { borderRightWidth: 1, borderRightColor: Colors.border },
  statValue: { fontSize: 22, fontWeight: '850', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: Colors.white40, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },
  cta: {
    backgroundColor: Colors.blue500, borderRadius: 18,
    paddingVertical: 16, alignItems: 'center', marginBottom: 20,
  },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  section: {
    backgroundColor: Colors.white05, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: Colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.white, marginBottom: 14 },
  empty: { textAlign: 'center', color: Colors.white20, fontSize: 13, paddingVertical: 20 },
  reportItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.white10,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: Colors.blueBg, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.blue400, fontWeight: '700', fontSize: 14 },
  avatarImg: { width: 38, height: 38, borderRadius: 12 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: Colors.white90 },
  reportMeta: { fontSize: 12, color: Colors.white40, marginTop: 2 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.redText, borderWidth: 1.5, borderColor: Colors.bg,
  },
})
