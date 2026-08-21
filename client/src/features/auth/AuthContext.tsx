import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AuthUser } from './types'
import * as authApi from './api/authApi'

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) => Promise<void>
  logout: () => Promise<void>
  setSession: (user: AuthUser, accessToken: string) => void
}

const AuthContext = createContext<AuthState | null>(null)

const TOKEN_KEY = 'examflow_access_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setSession = useCallback((u: AuthUser, token: string) => {
    setUser(u)
    setAccessToken(token)
    localStorage.setItem(TOKEN_KEY, token)
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    localStorage.removeItem(TOKEN_KEY)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    authApi
      .meApi(token)
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user)
          setAccessToken(token)
        } else {
          clearSession()
        }
      })
      .catch(async () => {
        try {
          const refreshed = await authApi.refreshApi()
          if (refreshed.data?.accessToken) {
            const me = await authApi.meApi(refreshed.data.accessToken)
            if (me.data?.user) {
              setSession(me.data.user, refreshed.data.accessToken)
              return
            }
          }
        } catch {
          // ignore
        }
        clearSession()
      })
      .finally(() => setIsLoading(false))
  }, [clearSession, setSession])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.loginApi({ email, password })
      if (res.data) {
        setSession(res.data.user, res.data.accessToken)
      }
    },
    [setSession]
  )

  const register = useCallback(
    async (data: {
      email: string
      password: string
      firstName: string
      lastName: string
    }) => {
      const res = await authApi.registerApi(data)
      if (res.data) {
        setSession(res.data.user, res.data.accessToken)
      }
    },
    [setSession]
  )

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await authApi.logoutApi(accessToken)
      }
    } catch {
      // ignore
    } finally {
      clearSession()
    }
  }, [accessToken, clearSession])

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      isAuthenticated: !!user && !!accessToken,
      login,
      register,
      logout,
      setSession,
    }),
    [user, accessToken, isLoading, login, register, logout, setSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
