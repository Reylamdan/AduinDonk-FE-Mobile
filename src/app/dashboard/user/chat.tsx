import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native'
import Animated from 'react-native-reanimated'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import { useStaggerFadeIn, usePressScale } from '@/hooks/useAnimations'

function ChatBubble({ item, isMine, index }: { item: any; isMine: boolean; index: number }) {
  const anim = useStaggerFadeIn(index)
  return (
    <Animated.View style={[{ alignItems: isMine ? 'flex-end' : 'flex-start' }, anim]}>
      {!isMine && <Text style={styles.senderName}>{item.sender_name}</Text>}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.bubbleText, isMine && { color: '#fff' }]}>{item.message}</Text>
        <Text style={[styles.bubbleTime, isMine && { color: 'rgba(255,255,255,0.5)' }]}>
          {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Animated.View>
  )
}

export default function ChatScreen() {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef<FlatList>(null)

  async function fetchMessages() {
    try {
      const res = await fetch(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setMessages(data.data || [])
    } catch {}
  }

  useEffect(() => {
    if (!token) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    if (messages.length > 0) setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100)
  }, [messages])

  async function handleSend() {
    if (!text.trim()) return
    setSending(true)
    try {
      await fetch(`${API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text.trim() }),
      })
      setText('')
      await fetchMessages()
    } catch {}
    finally { setSending(false) }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat dengan Admin</Text>
        <Text style={styles.headerSub}>Diperbarui tiap 5 detik</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 20 }}
          renderItem={({ item, index }) => {
            const isMine = item.sender_id === user?.id
            return <ChatBubble item={item} isMine={isMine} index={index} />
          }}
        />

        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Tulis pesan..." placeholderTextColor={Colors.white20}
            value={text} onChangeText={setText} multiline />
          <TouchableOpacity onPress={handleSend} disabled={sending || !text.trim()}
            style={[styles.sendBtn, (!text.trim() || sending) && { opacity: 0.4 }]}>
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: 'rgba(15,23,42,0.9)', borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 12, color: Colors.white40, marginTop: 2 },
  senderName: { fontSize: 11, fontWeight: '600', color: Colors.blue400, marginBottom: 3, marginLeft: 4 },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: Colors.blue500, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: Colors.white90 },
  bubbleTime: { fontSize: 10, color: Colors.white40, marginTop: 3, textAlign: 'right' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 10, backgroundColor: 'rgba(15,23,42,0.9)', borderTopWidth: 1, borderTopColor: Colors.border },
  input: { flex: 1, backgroundColor: Colors.white05, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: Colors.white, maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.blue500, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#fff', fontWeight: '700', fontSize: 18 },
})
