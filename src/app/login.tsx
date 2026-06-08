import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { API_URL } from '@/constants/api'
import { Colors } from '@/constants/colors'
import { useFadeInUp, usePressScale } from '@/hooks/useAnimations'

export default function LoginScreen() {
  const router = useRouter()
  const { saveAuth } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!form.email || !form.password) { setError('Email dan password wajib diisi'); return }
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login gagal')
      saveAuth({ token: data.token, user: data.user })
      
      // Mobile app hanya support dashboard user untuk saat ini
      router.replace('/dashboard/user')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={[styles.blob, { top: -100, left: -80, backgroundColor: 'rgba(37,99,235,0.2)' }]} />
      <View style={[styles.blob, { bottom: -100, right: -60, backgroundColor: 'rgba(8,145,178,0.15)', width: 300, height: 300 }]} />

      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/images/logo-small.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.logoText}>Aduin<Text style={{ color: Colors.blue400 }}>Donk</Text></Text>
          <Text style={styles.logoSub}>Sampaikan aspirasimu dengan mudah</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Masuk</Text>
          <Text style={styles.subtitle}>Silakan masuk ke akun Anda</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="email@kamu.com" placeholderTextColor={Colors.white20}
              value={form.email} onChangeText={v => setForm({ ...form, email: v })}
              autoCapitalize="none" keyboardType="email-address" />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={Colors.white20}
              value={form.password} onChangeText={v => setForm({ ...form, password: v })}
              secureTextEntry />
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <View style={styles.btn}>
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={[styles.btnGrad, loading && { opacity: 0.6 }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Masuk Sekarang</Text>}
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/register')} style={styles.link}>
            <Text style={styles.linkText}>Belum punya akun? <Text style={styles.linkBold}>Daftar di sini</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  blob: { position: 'absolute', width: 350, height: 350, borderRadius: 175 },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: { width: 72, height: 72, borderRadius: 20 },
  logoText: { fontSize: 28, fontWeight: '900', color: Colors.white, marginTop: 12 },
  logoSub: { marginTop: 4, color: Colors.white40, fontSize: 14, fontWeight: '500' },
  card: {
    backgroundColor: Colors.white05, borderRadius: 32, padding: 28,
    borderWidth: 1, borderColor: Colors.border,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.white, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.white40, marginTop: 2, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.white60, marginBottom: 6, paddingLeft: 4 },
  input: {
    backgroundColor: Colors.white05, borderRadius: 16, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 14, color: Colors.white,
  },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 14, padding: 12, marginBottom: 12 },
  errorText: { color: '#f87171', fontSize: 13 },
  btn: { marginTop: 8, borderRadius: 16, overflow: 'hidden' },
  btnGrad: {
    paddingVertical: 15, alignItems: 'center', borderRadius: 16,
    backgroundColor: Colors.blue500,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 13, color: Colors.white40 },
  linkBold: { color: Colors.blue400, fontWeight: '600' },
})
