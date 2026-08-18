import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import type { User } from '@/types'
import api from '@/lib/api'

interface AuthContextType {
  token: string | null
  currentUser: User | null
  loading: boolean
  isAuthenticated: boolean

  loginSession: (
    token: string,
    user: User
  ) => void

  logoutSession: () => void
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  )

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [token, setToken] =
    useState<string | null>(() =>
      localStorage.getItem('spk_token')
    )

  const [currentUser, setCurrentUser] =
    useState<User | null>(null)

  const [loading, setLoading] =
    useState(true)

  const loginSession = (
    newToken: string,
    user: User
  ) => {
    localStorage.setItem(
      'spk_token',
      newToken
    )

    setToken(newToken)
    setCurrentUser(user)
  }

  const logoutSession = () => {
    localStorage.removeItem(
      'spk_token'
    )

    setToken(null)
    setCurrentUser(null)
  }

  useEffect(() => {
    let cancelled = false

    const restoreSession = async () => {
      const savedToken =
        localStorage.getItem(
          'spk_token'
        )

      if (!savedToken) {
        if (!cancelled) {
          setToken(null)
          setCurrentUser(null)
          setLoading(false)
        }

        return
      }

      try {
        const response =
          await api.get('/auth/me', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          })

        if (
          response.data?.success &&
          response.data?.data?.user
        ) {
          if (!cancelled) {
            setToken(savedToken)
            setCurrentUser(
              response.data.data.user
            )
          }
        } else {
          localStorage.removeItem(
            'spk_token'
          )

          if (!cancelled) {
            setToken(null)
            setCurrentUser(null)
          }
        }
      } catch (error) {
        console.error(
          'RESTORE SESSION ERROR:',
          error
        )

        localStorage.removeItem(
          'spk_token'
        )

        if (!cancelled) {
          setToken(null)
          setCurrentUser(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        token,
        currentUser,
        loading,
        isAuthenticated:
          Boolean(token) &&
          Boolean(currentUser),

        loginSession,
        logoutSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context =
    useContext(AuthContext)

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    )
  }

  return context
}
