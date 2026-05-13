'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useRegister } from '@/lib/queries/auth'
import { useLanguages } from '@/lib/queries/languages'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'

const step1Schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
}).strict()

type Step1Data = z.infer<typeof step1Schema>

export default function RegisterPage() {
  const router = useRouter()
  const registerMutation = useRegister()
  const { data: languagesData, isLoading: isLanguagesLoading, error: languagesError, refetch: refetchLanguages } = useLanguages()
  const [currentStep, setCurrentStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  // Form state for all steps
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    gender: '',
    phone: '',
    avatar: '',
    languages: [] as string[],
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      username: formData.username,
      name: formData.name,
      email: formData.email,
      password: formData.password,
    },
  })

  const passwordValue = watch('password')

  // Refetch languages when we reach Step 4
  useEffect(() => {
    if (currentStep === 4) {
      refetchLanguages()
    }
  }, [currentStep, refetchLanguages])

  const onStep1Submit = async (data: Step1Data) => {
    setError(null)
    
    // Validate passwords match
    if (passwordValue !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
    setConfirmPassword('') // Reset on success
    setCurrentStep(2)
  }

  const onStep2Submit = (gender: string) => {
    setError(null)
    setFormData((prev) => ({
      ...prev,
      gender,
    }))
    setCurrentStep(3)
  }

  const onStep3Submit = () => {
    setError(null)
    setCurrentStep(4)
  }

  const onStep4Submit = async () => {
    if (formData.languages.length === 0) {
      setError('Please select at least one language')
      return
    }

    setError(null)
    try {
      await registerMutation.mutateAsync({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        gender: formData.gender,
        phone: formData.phone || undefined,
        avatar: formData.avatar || undefined,
        languages: formData.languages,
      })

      toast.success("Account created! Please verify your email.")
      // Store email temporarily for OTP verification
      sessionStorage.setItem('register_email', formData.email)
      router.push('/auth/otp-verify')
    } catch (err: any) {
      console.error('Registration error:', err)
      const errorMessage = 
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Registration failed. Please try again.'
      setError(errorMessage)
      toast.error(`Registration failed: ${errorMessage}`)
    }
  }

  const toggleLanguage = (languageId: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(languageId)
        ? prev.languages.filter((id) => id !== languageId)
        : [...prev.languages, languageId],
    }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Create Account</h1>
          <p className="text-muted-foreground mb-6">
            Join the Language Dataset Platform community
          </p>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
              {error}
            </div>
          )}

          {currentStep === 1 && (
            <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-1"
                >
                  Username
                </label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-10 ${confirmPassword && passwordValue && confirmPassword !== passwordValue ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && passwordValue && confirmPassword !== passwordValue && (
                  <p className="text-destructive text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isSubmitting || !!(confirmPassword && passwordValue && confirmPassword !== passwordValue)}
              >
                {isSubmitting ? 'Processing...' : 'Next'}
              </Button>
            </form>
          )}

          {/* Step 2: Gender Selection Modal */}
          <Dialog open={currentStep === 2} onOpenChange={(open) => {
            if (!open) {
              setError(null)
              setCurrentStep(1)
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Select Your Gender</DialogTitle>
                <DialogDescription>
                  This helps us better understand our community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {['male', 'female', 'other', 'prefer_not_to_say'].map((gender) => (
                  <Button
                    key={gender}
                    onClick={() => onStep2Submit(gender)}
                    variant={formData.gender === gender ? 'default' : 'outline'}
                    className="w-full justify-start"
                  >
                    {gender === 'male' && 'Male'}
                    {gender === 'female' && 'Female'}
                    {gender === 'other' && 'Other'}
                    {gender === 'prefer_not_to_say' && 'Prefer not to say'}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          {/* Step 3: Phone and Avatar Modal */}
          <Dialog open={currentStep === 3} onOpenChange={(open) => {
            if (!open) {
              setError(null)
              setCurrentStep(2)
            }
          }}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Your Phone & Avatar</DialogTitle>
                <DialogDescription>
                  These fields are optional, you can skip them if you prefer
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Phone Number (Optional)
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="avatar" className="block text-sm font-medium mb-1">
                    Avatar URL (Optional)
                  </label>
                  <Input
                    id="avatar"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={formData.avatar}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        avatar: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button onClick={onStep3Submit} className="flex-1">
                    Next
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Step 4: Language Selection Modal */}
          <Dialog open={currentStep === 4} onOpenChange={(open) => {
            if (!open) setCurrentStep(3)
          }}>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Select Languages You Know</DialogTitle>
                <DialogDescription>
                  Choose at least one language to continue
                </DialogDescription>
              </DialogHeader>
              {error && (
                <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded text-destructive text-sm">
                  {error}
                </div>
              )}
              {isLanguagesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : languagesError ? (
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 border border-destructive rounded text-destructive">
                    <p className="font-medium">Unable to load languages</p>
                    <p className="text-sm mt-1">
                      {languagesError instanceof Error ? languagesError.message : 'Please check your connection and try again'}
                    </p>
                  </div>
                  <Button onClick={() => refetchLanguages()} className="w-full">
                    Try Again
                  </Button>
                </div>
              ) : !languagesData?.items || languagesData.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No languages available at the moment</p>
                  <Button onClick={() => refetchLanguages()} variant="outline" className="mt-4">
                    Refresh
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {languagesData.items.map((language) => (
                    <div
                      key={language.id}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-accent"
                    >
                      <Checkbox
                        id={language.id}
                        checked={formData.languages.includes(language.id)}
                        onCheckedChange={() => toggleLanguage(language.id)}
                      />
                      <label
                        htmlFor={language.id}
                        className="flex-1 cursor-pointer font-medium"
                      >
                        {language.name} ({language.code})
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={onStep4Submit}
                  disabled={
                    formData.languages.length === 0 ||
                    registerMutation.isPending
                  }
                  className="flex-1"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {currentStep === 1 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-medium text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
