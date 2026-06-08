import { useCallback, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, Image, ActivityIndicator } from 'react-native'
import Animated from 'react-native-reanimated'
import * as ImagePicker from 'expo-image-picker'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { Colors } from '@/constants/colors'
import { API_URL } from '@/constants/api'
import { useFadeInUp, usePressScale } from '@/hooks/useAnimations'

export default function ProfilScreen() {
  const { user, token, logout, updateUser } = useAuth()
  const router = useRouter()

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Password
  const [pwForm, setPwForm] = useState({ current: '', newPassword: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')

  const avatarAnim = useFadeInUp(0)
  const cardAnim = useFadeInUp(80)
  const pwAnim = useFadeInUp(140)
  const dangerAnim = useFadeInUp(180)
  const savePress = usePressScale()
  const logoutPress = usePressScale(0.97)

  useEffect(() => {
    setForm({ name: user?.name || '', email: user?.email || '' })
  }, [user])

  useFocusEffect(useCallback(() => {
    if (!token) return
    fetch(`${API_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.data) updateUser(d.data) }).catch(() => {})
  }, [token]))

  function handleLogout() { logout(); router.replace('/login') }

  async function handleSave() {
    setError(''); setSuccess('')
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      updateUser(data.user, data.token)
      setSuccess('Profil berhasil disimpan')
      setEditMode(false)
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  async function handlePickAvatar() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsEditing: true, aspect: [1, 1],
    })
    if (result.canceled) return
    setUploading(true); setError(''); setSuccess('')
    try {
      const asset = result.assets[0]
      const fd = new FormData()
      if (asset.uri.startsWith('blob:') || asset.uri.startsWith('data:')) {
        const blobRes = await fetch(asset.uri)
        const blob = await blobRes.blob()
        const ext = blob.type.split('/')[1] || 'jpg'
        fd.append('avatar', blob, `avatar.${ext}`)
      } else {
        const ext = asset.uri.split('.').pop() || 'jpg'
        fd.append('avatar', { uri: asset.uri, name: `avatar.${ext}`, type: `image/${ext}` } as any)
      }
      const res = await fetch(`${API_URL}/api/profile/avatar`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      updateUser(data.user, data.token)
      setSuccess('Foto profil berhasil diperbarui')
    } catch (err: any) { setError(err.message) }
    finally { setUploading(false) }
  }

  async function handleChangePassword() {
    setPwError(''); setPwSuccess('')
    if (!pwForm.current || !pwForm.newPassword || !pwForm.confirm) { setPwError('Semua field wajib diisi'); return }
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Password baru tidak cocok'); return }
    setPwSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setPwSuccess('Password berhasil diubah')
      setPwForm({ current: '', newPassword: '', confirm: '' })
    } catch (err: any) { setPwError(err.message) }
    finally { setPwSaving(false) }
  }

  async function handleDeleteAccount() {
    try {
      await fetch(`${API_URL}/api/profile`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      logout(); router.replace('/login')
    } catch {}
  }

  return (
    <View style={styles.container}>
      <View style={[styles.blob, { top: -60, right: -60, backgroundColor: 'rgba(37,99,235,0.15)' }]} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.pageTitle}>Profil</Text>

        {/* Avatar */}
        <Animated.View style={[styles.avatarWrap, avatarAnim]}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: `${user.avatar_url}?t=${Date.now()}` }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBtn} onPress={handlePickAvatar} disabled={uploading}>
              {uploading ? <ActivityIndicator size={12} color="#fff" /> : <Ionicons name="camera" size={14} color="#fff" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}><Text style={styles.roleText}>{user?.role?.replace('_', ' ')}</Text></View>
        </Animated.View>

        {/* Info Akun */}
        <Animated.View style={[styles.card, cardAnim]}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionTitle}>Informasi Akun</Text>
            <TouchableOpacity onPress={() => { setEditMode(!editMode); setError(''); setSuccess('') }} style={styles.editBtn}>
              <Ionicons name={editMode ? 'close' : 'pencil'} size={14} color={Colors.white60} />
              <Text style={styles.editBtnText}>{editMode ? 'Batal' : 'Edit'}</Text>
            </TouchableOpacity>
          </View>
          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
          {success ? <View style={styles.successBox}><Text style={styles.successText}>{success}</Text></View> : null}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nama</Text>
            <TextInput style={[styles.input, !editMode && styles.inputDisabled]} value={editMode ? form.name : user?.name}
              onChangeText={v => setForm({ ...form, name: v })} editable={editMode} placeholderTextColor={Colors.white20} />
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput style={[styles.input, !editMode && styles.inputDisabled]} value={editMode ? form.email : user?.email}
              onChangeText={v => setForm({ ...form, email: v })} editable={editMode} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={Colors.white20} />
          </View>
          {editMode && (
            <Animated.View style={savePress.animatedStyle}>
              <TouchableOpacity onPress={handleSave} onPressIn={savePress.onPressIn} onPressOut={savePress.onPressOut}
                disabled={saving} style={[styles.saveBtn, saving && { opacity: 0.6 }]} activeOpacity={1}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan Perubahan</Text>}
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>

        {/* Ganti Password */}
        <Animated.View style={[styles.card, pwAnim]}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.blue400} />
            <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Ganti Password</Text>
          </View>
          {pwError ? <View style={styles.errorBox}><Text style={styles.errorText}>{pwError}</Text></View> : null}
          {pwSuccess ? <View style={styles.successBox}><Text style={styles.successText}>{pwSuccess}</Text></View> : null}
          {[
            { key: 'current', label: 'Password Saat Ini' },
            { key: 'newPassword', label: 'Password Baru' },
            { key: 'confirm', label: 'Konfirmasi Password Baru' },
          ].map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput style={styles.input} value={(pwForm as any)[f.key]} secureTextEntry
                onChangeText={v => setPwForm({ ...pwForm, [f.key]: v })} placeholder="••••••••" placeholderTextColor={Colors.white20} />
            </View>
          ))}
          <TouchableOpacity onPress={handleChangePassword} disabled={pwSaving} style={[styles.saveBtn, pwSaving && { opacity: 0.6 }]}>
            {pwSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Simpan Password</Text>}
          </TouchableOpacity>
        </Animated.View>

        {/* Logout & Hapus Akun */}
        <Animated.View style={dangerAnim}>
          <Animated.View style={logoutPress.animatedStyle}>
            <TouchableOpacity onPress={() => setShowLogoutConfirm(true)} onPressIn={logoutPress.onPressIn} onPressOut={logoutPress.onPressOut}
              style={styles.logoutBtn} activeOpacity={1}>
              <Text style={styles.logoutText}>Keluar</Text>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.redText} />
            <Text style={styles.deleteBtnText}>Hapus Akun</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Modal logout */}
      <Modal transparent visible={showLogoutConfirm} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Yakin ingin keluar?</Text>
            <Text style={styles.modalSub}>Kamu harus login lagi untuk mengakses dashboard.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={handleLogout} style={styles.btnRed}><Text style={{ color: '#fff', fontWeight: '700' }}>Ya, Keluar</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLogoutConfirm(false)} style={styles.btnCancel}><Text style={{ color: Colors.white60, fontWeight: '600' }}>Batal</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal hapus akun */}
      <Modal transparent visible={showDeleteConfirm} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Hapus Akun?</Text>
            <Text style={styles.modalSub}>Semua data akan hilang permanen. Tindakan ini tidak bisa dibatalkan.</Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={handleDeleteAccount} style={styles.btnRed}><Text style={{ color: '#fff', fontWeight: '700' }}>Ya, Hapus</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={styles.btnCancel}><Text style={{ color: Colors.white60, fontWeight: '600' }}>Batal</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  blob: { position: 'absolute', width: 250, height: 250, borderRadius: 125 },
  scroll: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 24 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 26, backgroundColor: Colors.blue500, justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 88, height: 88, borderRadius: 26, borderWidth: 2, borderColor: Colors.border },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: '800' },
  cameraBtn: { position: 'absolute', bottom: -4, right: -4, width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.blue500, borderWidth: 2, borderColor: Colors.bg, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '800', color: Colors.white },
  email: { fontSize: 14, color: Colors.white40, marginTop: 2 },
  roleBadge: { marginTop: 8, backgroundColor: Colors.blueBg, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 12, fontWeight: '700', color: Colors.blue400, textTransform: 'capitalize' },
  card: { backgroundColor: Colors.white05, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.white05, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { fontSize: 12, color: Colors.white60, fontWeight: '600' },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.1)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: 10, marginBottom: 12 },
  errorText: { color: '#f87171', fontSize: 12 },
  successBox: { backgroundColor: 'rgba(34,197,94,0.1)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', borderRadius: 12, padding: 10, marginBottom: 12 },
  successText: { color: Colors.greenText, fontSize: 12 },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.white60, marginBottom: 6, paddingLeft: 2 },
  input: { backgroundColor: Colors.white05, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.white },
  inputDisabled: { opacity: 0.4 },
  saveBtn: { backgroundColor: Colors.blue500, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  logoutBtn: { backgroundColor: Colors.redBg, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)', marginBottom: 10 },
  logoutText: { color: Colors.redText, fontWeight: '700', fontSize: 15 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)', backgroundColor: 'rgba(239,68,68,0.05)' },
  deleteBtnText: { color: Colors.redText, fontWeight: '600', fontSize: 14 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '82%', backgroundColor: '#1e293b', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: Colors.border },
  modalTitle: { fontSize: 18, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  modalSub: { fontSize: 13, color: Colors.white40, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  btnRed: { flex: 1, backgroundColor: Colors.redText, borderRadius: 14, padding: 13, alignItems: 'center' },
  btnCancel: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 13, alignItems: 'center' },
})
