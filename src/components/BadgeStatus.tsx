import { View, Text, StyleSheet } from 'react-native'

const map: Record<string, { bg: string; text: string }> = {
  pending:  { bg: 'rgba(234,179,8,0.15)',   text: '#eab308' },
  diproses: { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa' },
  selesai:  { bg: 'rgba(34,197,94,0.15)',   text: '#22c55e' },
  ditolak:  { bg: 'rgba(239,68,68,0.15)',   text: '#ef4444' },
}

export default function BadgeStatus({ status }: { status: string }) {
  const key = status?.toLowerCase() || 'pending'
  const s = map[key] || map.pending
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{status}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  text: { fontSize: 11, fontWeight: '700' },
})
