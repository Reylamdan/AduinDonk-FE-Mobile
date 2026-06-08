import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native'
import Animated from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import { useFadeInUp, usePressScale } from '@/hooks/useAnimations'

export default function BuatLaporanScreen() {
  const { token } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', category_id: '', description: '' })
  const [image, setImage] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formAnim = useFadeInUp(60)
  const btnPress = usePressScale()

  useEffect(() => {
    fetch(`${API_URL}/api/categories`).then(r => r.json()).then(d => setCategories(d.data || [])).catch(() => {})
  }, [])

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 })
    if (!result.canceled) setImage(result.assets[0])
  }

  async function handleSubmit() {
    if (!form.title || !form.category_id || !form.description) {
      setError('Semua field wajib diisi'); return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, image_url: null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      router.replace('/dashboard/user/laporan')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.pageTitle}>Buat Laporan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={formAnim}>
        <View style={styles.field}>
          <Text style={styles.label}>Judul Laporan</Text>
          <TextInput style={styles.input} placeholder="Contoh: Jalan Rusak di Jl. Merdeka"
            placeholderTextColor={Colors.white20} value={form.title}
            onChangeText={v => setForm({ ...form, title: v })} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kategori</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(c => (
              <TouchableOpacity key={c.id} onPress={() => setForm({ ...form, category_id: c.id })}
                style={[styles.chip, form.category_id == c.id && styles.chipActive]}>
                <Text style={[styles.chipText, form.category_id == c.id && styles.chipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Deskripsi</Text>
          <TextInput style={[styles.input, { height: 110, textAlignVertical: 'top' }]}
            placeholder="Jelaskan masalah secara detail..." placeholderTextColor={Colors.white20}
            multiline numberOfLines={4} value={form.description}
            onChangeText={v => setForm({ ...form, description: v })} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Foto Bukti <Text style={{ color: Colors.white20 }}>(opsional)</Text></Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.preview} />
            ) : (
              <Text style={styles.imagePickerText}>📷  Pilih Foto</Text>
            )}
          </TouchableOpacity>
        </View>

        {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

        <Animated.View style={btnPress.animatedStyle}>
          <TouchableOpacity
            onPress={handleSubmit}
            onPressIn={btnPress.onPressIn}
            onPressOut={btnPress.onPressOut}
            style={[styles.btn, loading && { opacity: 0.6 }]}
            disabled={loading}
            activeOpacity={1}
          >
            <View style={styles.btnInner}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Kirim Laporan</Text>}
            </View>
          </TouchableOpacity>
        </Animated.View>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topBar: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 14, backgroundColor: 'rgba(15,23,42,0.9)', borderBottomWidth: 1, borderBottomColor: Colors.border },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  scroll: { padding: 20, paddingBottom: 100 },
  field: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.white60, marginBottom: 8, paddingLeft: 2 },
  input: { backgroundColor: Colors.white05, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: Colors.white },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.border, marginRight: 8 },
  chipActive: { backgroundColor: Colors.blue500, borderColor: Colors.blue500 },
  chipText: { fontSize: 13, color: Colors.white60, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  imagePicker: { backgroundColor: Colors.white05, borderRadius: 16, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', height: 120, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  imagePickerText: { color: Colors.white40, fontSize: 15 },
  preview: { width: '100%', height: '100%' },
  btn: { borderRadius: 16, overflow: 'hidden' },
  btnInner: { backgroundColor: Colors.blue500, paddingVertical: 15, alignItems: 'center', borderRadius: 16 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 14, padding: 12, marginBottom: 12 },
  errorText: { color: '#f87171', fontSize: 13 },
})
