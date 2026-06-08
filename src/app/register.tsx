import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native'
import Animated from 'react-native-reanimated'
import { useRouter } from 'expo-router'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import { useFadeInUp, usePressScale } from '@/hooks/useAnimations'

export default function RegisterScreen() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const logoAnim = useFadeInUp(0)
  const cardAnim = useFadeInUp(120)
  const btnPress = usePressScale()

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) { setError('Semua field wajib diisi'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      router.replace('/login')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.blob, { top: -100, left: -80 }]} />
      <View style={[styles.blob, { bottom: -80, right: -60, backgroundColor: 'rgba(8,145,178,0.15)' }]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.logoWrap, logoAnim]}>
          <Image source={require('../../assets/images/logo-small.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoSub}>Buat akun baru</Text>
        </Animated.View>

        <Animated.View style={[styles.card, cardAnim]}>
          <Text style={styles.title}>Daftar</Text>
          <Text style={styles.subtitle}>Bergabung dengan AduinDonk</Text>

          {[
            { key: 'name', label: 'Nama Lengkap', placeholder: 'Nama kamu', secure: false, kb: 'default' as const },
            { key: 'email', label: 'Email', placeholder: 'email@kamu.com', secure: false, kb: 'email-address' as const },
            { key: 'password', label: 'Password', placeholder: '••••••••', secure: true, kb: 'default' as const },
          ].map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor={Colors.white20}
                secureTextEntry={f.secure} keyboardType={f.kb}
                autoCapitalize={f.key === 'name' ? 'words' : 'none'}
                value={(form as any)[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })} />
            </View>
          ))}

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Animated.View style={[styles.btn, btnPress.animatedStyle]}>
            <TouchableOpacity
              onPressIn={btnPress.onPressIn}
              onPressOut={btnPress.onPressOut}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={1}
            >
              <View style={[styles.btnGrad, loading && { opacity: 0.6 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Daftar</Text>}
              </View>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => router.push('/login')} style={styles.link}>
            <Text style={styles.linkText}>Sudah punya akun? <Text style={styles.linkBold}>Masuk di sini</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  blob: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: 'rgba(37,99,235,0.2)' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 72, height: 72, borderRadius: 20 },
  logoSub: { marginTop: 10, color: Colors.white40, fontSize: 14, fontWeight: '500' },
  card: { backgroundColor: Colors.white05, borderRadius: 32, padding: 28, borderWidth: 1, borderColor: Colors.border },
  title: { fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.white40, marginTop: 2, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.white60, marginBottom: 6, paddingLeft: 4 },
  input: { backgroundColor: Colors.white05, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 13, fontSize: 14, color: Colors.white },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 14, padding: 12, marginBottom: 12 },
  errorText: { color: '#f87171', fontSize: 13 },
  btn: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  btnGrad: { paddingVertical: 15, alignItems: 'center', borderRadius: 16, backgroundColor: Colors.blue500 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 13, color: Colors.white40 },
  linkBold: { color: Colors.blue400, fontWeight: '600' },
})
