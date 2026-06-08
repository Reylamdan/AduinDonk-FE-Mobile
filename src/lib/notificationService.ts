import { API_URL } from '@/constants/api'

async function authFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request gagal')
  return data
}

export const getNotifications       = (token: string) => authFetch('/api/notifications', token)
export const markAllRead            = (token: string) => authFetch('/api/notifications/read-all', token, { method: 'PUT' })
export const deleteNotification     = (token: string, id: number) => authFetch(`/api/notifications/${id}`, token, { method: 'DELETE' })
export const deleteAllNotifications = (token: string) => authFetch('/api/notifications/all', token, { method: 'DELETE' })
