'use client'

import { useAuth } from '@/lib/context/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { Mail, User, Calendar } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Profile Information
        </h2>

        <div className="space-y-6">
          {/* User Avatar */}
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{user.full_name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-border">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Full Name
              </label>
              <Input
                value={user.full_name}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Email
              </label>
              <Input
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Role
              </label>
              <Input
                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Member Since
              </label>
              <Input
                value={new Date(user.created_at).toLocaleDateString()}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <Button disabled className="opacity-50 cursor-not-allowed">
              Profile editing coming soon
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences Card */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Preferences
        </h2>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-foreground">
                Email notifications for new datasets
              </span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm text-foreground">
                Subscribe to monthly language updates
              </span>
            </label>
          </div>

          <div className="pt-6 border-t border-border">
            <Button disabled className="opacity-50 cursor-not-allowed">
              Save Preferences
            </Button>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          💡 Full profile editing and notification preferences will be available in the next update.
        </p>
      </Card>
    </div>
  )
}
