'use client'

import { useAdminStats } from '@/lib/queries/admin'
import { useAdminUsers } from '@/lib/queries/admin'
import { Card } from '@/components/ui/card'
import { Loader2, Users, Database, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const statCards = [
  {
    label: 'Total Users',
    icon: Users,
    href: '/admin/users',
  },
  {
    label: 'Datasets',
    icon: Database,
    href: '/admin/datasets',
  },
  {
    label: 'Analytics',
    icon: BarChart3,
    href: '/admin/analytics',
  },
]

export default function AdminPage() {
  const statsQuery = useAdminStats()
  const usersQuery = useAdminUsers(1, 5)

  const stats = statsQuery.data || {}

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage users, datasets, and platform content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          const value = stats[stat.label.toLowerCase().replace(/\s+/g, '_')] || 0
          
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    {statsQuery.isLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    ) : (
                      <p className="text-3xl font-bold text-foreground">
                        {value}
                      </p>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">
              Recent Users
            </h2>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {usersQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : usersQuery.data?.users && usersQuery.data.users.length > 0 ? (
            <div className="space-y-3">
              {usersQuery.data.users.map((user) => (
                <div
                  key={user.user_id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No users found
            </p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/tribes">
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Manage Tribes
              </Button>
            </Link>
            <Link href="/admin/languages">
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Manage Languages
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Manage Categories
              </Button>
            </Link>
            <Link href="/admin/datasets">
              <Button variant="outline" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                Manage Datasets
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  )
}
