import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@school/shared/utils'
import { User } from '@school/shared/types'

interface AuthStore {
  user: User | null
  token: string | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null })
        try {
          const response = await apiClient.post('/api/auth/login', { email, password })
          const { user, token } = response.data

          localStorage.setItem('accessToken', token.accessToken)
          localStorage.setItem('refreshToken', token.refreshToken)

          set({ user, token: token.accessToken, loading: false })
        } catch (error: any) {
          const errorMessage = error.response?.data?.error?.message || 'Login failed'
          set({ error: errorMessage, loading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/api/auth/logout')
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({ user: null, token: null })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          set({ loading: false })
          return
        }

        try {
          const response = await apiClient.get('/api/auth/me')
          set({ user: response.data, token, loading: false })
        } catch (error) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          set({ user: null, token: null, loading: false })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token }),
    }
  )
)
