import { useEffect, useRef, useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Image, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import BadgeStatus from '@/components/BadgeStatus'
import { Ionicons } from '@expo/vector-icons'

const stepIndex: Record<string, number> = { pending: 0, diproses: 1, selesai: 2 }
const steps = [
  { key: 'pending', label: 'Laporan Dikirim', color: Colors.yellowText },
  { key: 'diproses', label: 'Sedang Diproses', color: Colors.blue400 },
  { key: 'selesai', label: 'Selesai', color: Colors.greenText },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  return `${Math.floor(hrs / 24)} hari lalu`
}

export default function DetailLaporanScreen() {
  const { id } = useLocalSearchParams()
  const { token } = useAuth()
  const router = useRouter()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<any[]>([])
  const [commentText, setCommentText] = useState('')
  const [sending, setSending] = useState(false)

  const fetchReport = () => {
    if (!token || !id) return
    fetch(`${API_URL}/api/reports/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setReport(d.data)).catch(() => {})
      .finally(() => setLoading(false))
  }

  const fetchComments = () => {
    if (!id) return
    fetch(`${API_URL}/api/comments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => setComments(d.data || [])).catch(() => {})
  }

  useEffect(() => {
    fetchReport()
    fetchComments()
    const interval = setInterval(() => { fetchReport(); fetchComments() }, 5000)
    return () => clearInterval(interval)
  }, [token, id])

  async function handleSendComment() {
    if (!commentText.trim()) return
    setSending(true)
    try {
      const res = await fetch(`${API_URL}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ report_id: id, comment: commentText.trim() }),
      })
      if (res.ok) { setCommentText(''); fetchComments() }
    } catch {} finally { setSending(false) }
  }

  const currentIdx = stepIndex[report?.status?.toLowerCase()] ?? 0
  const isDitolak = report?.status?.toLowerCase() === 'ditolak'

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Detail Laporan</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.blue400} style={{ marginTop: 60 }} />
      ) : !report ? (
        <Text style={styles.empty}>Laporan tidak ditemukan</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
          {report.image_url && <Image source={{ uri: report.image_url }} style={styles.image} />}

          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[styles.title, { flex: 1, marginRight: 12 }]}>{report.title}</Text>
              <BadgeStatus status={report.status} />
            </View>
            <Text style={styles.meta}>{report.category_name} · {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
            <Text style={styles.desc}>{report.description}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Progress</Text>
            {isDitolak ? (
              <View style={styles.rejectedBox}>
                <Text style={styles.rejectedText}>❌  Laporan Ditolak</Text>
                <Text style={{ color: Colors.redText, fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                  {report.rejection_reason || 'Laporan tidak dapat diproses'}
                </Text>
              </View>
            ) : (
              steps.map((step, i) => (
                <View key={step.key} style={styles.stepRow}>
                  <View style={[styles.stepDot, i <= currentIdx && { backgroundColor: step.color }]} />
                  {i < steps.length - 1 && <View style={[styles.stepLine, i < currentIdx && { backgroundColor: steps[i + 1].color }]} />}
                  <Text style={[styles.stepLabel, i <= currentIdx && { color: Colors.white90, fontWeight: '700' }]}>{step.label}</Text>
                </View>
              ))
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Info Laporan</Text>
            {[
              { label: 'ID Laporan', value: `#${report.id}` },
              { label: 'Pelapor', value: report.user_name },
              { label: 'Status', value: report.status },
            ].map((item, i) => (
              <View key={i} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{item.label}</Text>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          {/* Komentar */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Komentar ({comments.length})</Text>
            {comments.length === 0 ? (
              <Text style={styles.emptyComment}>Belum ada komentar</Text>
            ) : (
              comments.map(c => (
                <View key={c.id} style={styles.commentItem}>
                  {c.user_avatar
                    ? <Image source={{ uri: c.user_avatar }} style={styles.commentAvatar} />
                    : <View style={styles.commentAvatarFallback}>
                        <Text style={styles.commentAvatarText}>{c.user_name?.[0]?.toUpperCase()}</Text>
                      </View>
                  }
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={styles.commentName}>{c.user_name}</Text>
                      <Text style={styles.commentTime}>{timeAgo(c.created_at)}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.comment}</Text>
                  </View>
                </View>
              ))
            )}

            {/* Input komentar */}
            <View style={styles.commentInput}>
              <TextInput
                style={styles.input}
                placeholder="Tulis komentar..."
                placeholderTextColor={Colors.white20}
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity onPress={handleSendComment} disabled={sending || !commentText.trim()} style={[styles.sendBtn, (!commentText.trim() || sending) && { opacity: 0.4 }]}>
                <Ionicons name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: 'rgba(15,23,42,0.9)', borderBottomWidth: 1, borderBottomColor: Colors.border },
  back: { fontSize: 14, color: Colors.blue400, fontWeight: '600', marginBottom: 4 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  empty: { textAlign: 'center', color: Colors.white40, marginTop: 40 },
  image: { width: '100%', height: 200, borderRadius: 20, marginBottom: 14 },
  card: { backgroundColor: Colors.white05, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '800', color: Colors.white },
  meta: { fontSize: 12, color: Colors.white40, marginTop: 6, marginBottom: 10 },
  desc: { fontSize: 14, color: Colors.white60, lineHeight: 22 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  stepDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.white10 },
  stepLine: { position: 'absolute', left: 6, top: 14, width: 2, height: 20, backgroundColor: Colors.white10 },
  stepLabel: { fontSize: 14, color: Colors.white40 },
  rejectedBox: { backgroundColor: Colors.redBg, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  rejectedText: { color: Colors.redText, fontWeight: '700', fontSize: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  infoLabel: { fontSize: 13, color: Colors.white40 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.white60 },
  emptyComment: { fontSize: 13, color: Colors.white20, textAlign: 'center', paddingVertical: 12 },
  commentItem: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  commentAvatar: { width: 34, height: 34, borderRadius: 10 },
  commentAvatarFallback: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.blueBg, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { color: Colors.blue400, fontWeight: '700', fontSize: 13 },
  commentName: { fontSize: 13, fontWeight: '700', color: Colors.white90 },
  commentTime: { fontSize: 11, color: Colors.white40 },
  commentText: { fontSize: 13, color: Colors.white60, marginTop: 3, lineHeight: 18 },
  commentInput: { flexDirection: 'row', gap: 10, marginTop: 14, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: Colors.white05, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: Colors.white, maxHeight: 80 },
  sendBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.blue500, justifyContent: 'center', alignItems: 'center' },
})
