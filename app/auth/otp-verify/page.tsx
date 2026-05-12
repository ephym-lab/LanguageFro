'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useVerifyOtp } from '@/lib/queries/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function OtpVerifyPage() {
  const router = useRouter()
  const [email, setEmail] = useState<string>('')
  const [otp, setOtp] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const verifyOtpMutation = useVerifyOtp()

  useEffect(() => {
    // Get email from session storage
    const storedEmail = sessionStorage.getItem('register_email')
    if (!storedEmail) {
      router.push('/auth/register')
      return
    }
    setEmail(storedEmail)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!otp || otp.length !== 6) {
      setError('OTP must be 6 digits')
      return
    }

    try {
      await verifyOtpMutation.mutateAsync({ email, code: otp })
      // Clear session storage
      sessionStorage.removeItem('register_email')
      sessionStorage.removeItem('auth_token')
      // Redirect to login
      router.push('/auth/login')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'OTP verification failed')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Verify Email</h1>
          <p className="text-muted-foreground mb-6">
            We&apos;ve sent a 6-digit code to <strong>{email}</strong>
          </p>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-1">
                Enter OTP Code
              </label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest font-mono"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={verifyOtpMutation.isPending || otp.length !== 6}
            >
              {verifyOtpMutation.isPending ? 'Verifying...' : 'Verify Email'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={() => router.push('/auth/register')}
                className="font-medium text-primary hover:underline"
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
