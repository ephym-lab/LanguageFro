'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { User } from '@/lib/types'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (userData: User, authToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const authToken = Cookies.get('auth_token')
    const userData = Cookies.get('user_data')

    console.log('Auth init - authToken exists:', !!authToken, 'userData exists:', !!userData)

    if (authToken && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        console.log('Restored user from cookies:', parsedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse user data from cookie:', error)
        Cookies.remove('auth_token')
        Cookies.remove('refresh_token')
        Cookies.remove('user_data')
      }
    }
    setLoading(false)
  }, [])

  const login = (userData: User, authToken: string, refreshToken: string) => {
    console.log('Logging in user:', userData)
    // Persist cookies first
    Cookies.set('auth_token', authToken, { expires: 7, sameSite: 'strict' })
    Cookies.set('refresh_token', refreshToken, { expires: 7, sameSite: 'strict' })
    Cookies.set('user_data', JSON.stringify(userData), { expires: 7, sameSite: 'strict' })
    // Then update state
    setUser(userData)
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('auth_token')
    Cookies.remove('refresh_token')
    Cookies.remove('user_data')
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      Cookies.set('user_data', JSON.stringify(updatedUser), { expires: 7 })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
