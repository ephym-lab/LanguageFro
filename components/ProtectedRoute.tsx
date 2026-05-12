'use client'

import { useAuth } from '@/lib/context/auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'admin' | 'user'
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Don't redirect while loading

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }

    if (requiredRole && user?.role !== requiredRole) {
      console.log(`Role mismatch: required=${requiredRole}, actual=${user?.role}`)
      router.push('/')
      return
    }
  }, [loading, isAuthenticated, user, router, requiredRole])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Return null only if the check failed (not authenticated or wrong role)
  if (!isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return null
  }

  return <>{children}</>
}
