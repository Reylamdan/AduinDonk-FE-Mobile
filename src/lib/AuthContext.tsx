import React, { createContext, useContext, useState } from 'react'
import { Platform } from 'react-native'

const SESSION_KEY = 'aduindonk_auth'

type User = { id: number; name: string; email: string; role: string; avatar_url?: string | null }
type AuthState = { token: string | null; user: User | null; initialized: boolean }

const AuthContext = createContext<{
  user: User | null
  token: string | null
  initialized: boolean
  saveAuth: (data: { token: string; user: User }) => void
  updateUser: (user: User, token?: string) => void
  logout: () => void
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null, initialized: false })

  React.useEffect(() => {
    async function load() {
      if (Platform.OS === 'web') {
        try {
          const raw = sessionStorage.getItem(SESSION_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.token && parsed.user) {
              setAuth({ token: parsed.token, user: parsed.user, initialized: true })
              return
            }
          }
        } catch {}
      }
      setAuth(prev => ({ ...prev, initialized: true }))
    }
    load()
  }, [])

  function saveAuth({ token, user }: { token: string; user: User }) {
    setAuth({ token, user, initialized: true })
    if (Platform.OS === 'web') {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, user })) } catch {}
    }
  }

  function updateUser(user: User, newToken?: string) {
    const token = newToken || auth.token!
    setAuth(prev => ({ ...prev, token, user }))
    if (Platform.OS === 'web') {
      try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token, user })) } catch {}
    }
  }

  function logout() {
    setAuth({ token: null, user: null, initialized: true })
    if (Platform.OS === 'web') {
      try { sessionStorage.removeItem(SESSION_KEY) } catch {}
    }
  }

  return (
    <AuthContext.Provider value={{ user: auth.user, token: auth.token, initialized: auth.initialized, saveAuth, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
