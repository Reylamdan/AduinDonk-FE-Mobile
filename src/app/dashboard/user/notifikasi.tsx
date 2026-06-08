import { useCallback, useEffect, useState } from 'react'
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert
} from 'react-native'
import Animated, { FadeInLeft, FadeOutRight, Layout } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { Colors } from '@/constants/colors'
import { getNotifications, markAllRead, deleteNotification, deleteAllNotifications } from '@/lib/notificationService'
import { useFadeInUp } from '@/hooks/useAnimations'

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

function getNotifStyle(message: string) {
  const msg = message?.toLowerCase() || ''
  if (msg.includes('diselesaikan')) return { icon: 'checkmark-circle', color: Colors.greenText, bg: Colors.greenBg }
  if (msg.includes('diproses'))     return { icon: 'time',             color: Colors.blue400,  bg: Colors.blueBg }
  if (msg.includes('ditolak'))      return { icon: 'close-circle',     color: Colors.redText,  bg: Colors.redBg }
  return { icon: 'notifications', color: Colors.white40, bg: Colors.white05 }
}

export default function NotifikasiScreen() {
  const { token } = useAuth()
  const router = useRouter()
  const [notifs, setNotifs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const headerAnim = useFadeInUp(0)
  const listAnim = useFadeInUp(80)

  const fetchNotifs = useCallback(async () => {
    if (!token) return
    try {
      const d = await getNotifications(token)
      setNotifs(d.data || [])
    } catch {}
    finally { setLoading(false) }
  }, [token])

  useEffect(() => {
    fetchNotifs()
    markAllRead(token!).catch(() => {})
  }, [])

  async function hapusSatu(id: number) {
    try {
      await deleteNotification(token!, id)
      setNotifs(prev => prev.filter(n => n.id !== id))
    } catch {}
  }

  function konfirmasiHapusSemua() {
    Alert.alert('Hapus Semua', 'Hapus semua notifikasi? Tindakan ini tidak bisa dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Ya, Hapus', style: 'destructive', onPress: async () => {
          try {
            await deleteAllNotifications(token!)
            setNotifs([])
          } catch {}
        }
      }
    ])
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.topBar, headerAnim]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Notifikasi</Text>
        {notifs.length > 0 && (
          <TouchableOpacity onPress={konfirmasiHapusSemua} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color={Colors.redText} />
          </TouchableOpacity>
        )}
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color={Colors.blue400} style={{ marginTop: 60 }} />
        ) : notifs.length === 0 ? (
          <Animated.View entering={FadeInLeft} style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={52} color={Colors.white20} />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </Animated.View>
        ) : (
          <Animated.View style={listAnim}>
            <Text style={styles.countText}>{notifs.length} notifikasi</Text>
            {notifs.map((n, i) => {
              const { icon, color, bg } = getNotifStyle(n.message)
              return (
                <Animated.View
                  key={n.id}
                  entering={FadeInLeft.delay(i * 50).duration(300)}
                  exiting={FadeOutRight.duration(250)}
                  layout={Layout.springify()}
                  style={[styles.card, !n.is_read && styles.cardUnread]}
                >
                  <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                    <Ionicons name={icon as any} size={18} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    {!n.is_read && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>Baru</Text>
                      </View>
                    )}
                    <Text style={styles.message}>{n.message}</Text>
                    <Text style={styles.time}>{timeAgo(n.created_at)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => hapusSatu(n.id)} style={styles.deleteBtn} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={15} color={Colors.white20} />
                  </TouchableOpacity>
                </Animated.View>
              )
            })}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.97)',
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { marginRight: 12, padding: 2 },
  pageTitle: { flex: 1, fontSize: 18, fontWeight: '800', color: Colors.white },
  clearBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.redBg, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  scroll: { padding: 16, paddingBottom: 100 },
  countText: { fontSize: 12, color: Colors.white40, fontWeight: '600', marginBottom: 12, paddingLeft: 4 },
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: Colors.white05, borderRadius: 20, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: Colors.border,
  },
  cardUnread: {
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderColor: 'rgba(59,130,246,0.25)',
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  newBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.blue500,
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginBottom: 4,
  },
  newBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  message: { fontSize: 14, fontWeight: '600', color: Colors.white90, lineHeight: 20 },
  time: { fontSize: 11, color: Colors.white40, marginTop: 3 },
  deleteBtn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  empty: { alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 14, color: Colors.white20 },
})
