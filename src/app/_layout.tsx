import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider } from '@/lib/AuthContext'
import { useEffect } from 'react'
import * as SplashScreen from 'expo-splash-screen'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  useEffect(() => {
    // Sembunyikan native splash setelah sedikit delay biar transisi lebih smooth
    const t = setTimeout(() => SplashScreen.hideAsync(), 500)
    return () => clearTimeout(t)
  }, [])

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'ios_from_right',
          animationDuration: 300,
        }}
      />
    </AuthProvider>
  )
}
