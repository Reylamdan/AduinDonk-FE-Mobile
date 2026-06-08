import { useRouter } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native'
import { useEffect } from 'react'
import { Colors } from '@/constants/colors'

function SplashScreen() {
  return (
    <View style={styles.splash}>
      <View style={[styles.blob, { top: -100, left: -80, backgroundColor: 'rgba(37,99,235,0.2)' }]} />
      <View style={[styles.blob, { bottom: -100, right: -60, backgroundColor: 'rgba(8,145,178,0.15)', width: 300, height: 300 }]} />
      
      <Image
        source={require('../../assets/images/logo-small.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator color="#fff" style={{ marginTop: 40 }} />
    </View>
  )
}

export default function Index() {
  const { token, user, initialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return

    const timer = setTimeout(() => {
      if (!token || !user) {
        router.replace('/login')
      } else {
        router.replace('/dashboard/user')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [initialized, token, user, router])

  return <SplashScreen />
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  blob: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 32,
  },
})
