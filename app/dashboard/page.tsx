'use client'

import { useAuth } from '@/lib/context/auth'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Database,
  Vote,
  MessageSquare,
  ArrowRight,
} from 'lucide-react'

const quickActions = [
  {
    title: 'Browse Datasets',
    description: 'Explore language datasets and translations',
    icon: Database,
    href: '/dashboard/datasets',
  },
  {
    title: 'Vote on Responses',
    description: 'Rate and approve translations',
    icon: Vote,
    href: '/dashboard/datasets/?tab=voting',
  },
  {
    title: 'View Responses',
    description: 'See your voting history',
    icon: MessageSquare,
    href: '/dashboard/my-responses',
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-card border border-border rounded-lg p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-muted-foreground">
          Continue contributing to the preservation of African languages
        </p>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card
                key={action.href}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {action.description}
                </p>
                <Link href={action.href}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-between"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-primary/20 bg-primary/5">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            About the Platform
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            This platform is dedicated to preserving and documenting indigenous African languages. By voting on translations and reviewing linguistic data, you&apos;re helping ensure these languages are accurately represented for future generations.
          </p>
        </Card>

        <Card className="p-6 border-accent/20 bg-accent/5">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            How to Help
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Vote on translation quality and accuracy</li>
            <li>• Rate cultural authenticity of responses</li>
            <li>• Provide feedback on linguistic data</li>
            <li>• Help improve dataset coverage</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
