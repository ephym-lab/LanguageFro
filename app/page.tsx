'use client'

import { useAuth } from '@/lib/context/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const { user } = useAuth()

  // No redirect logic here - let ProtectedRoute handle auth checks
  // Authenticated users will see this page; auth enforcement happens on protected routes

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 text-balance">
              Preserve &amp; Celebrate Indigenous African Languages
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
              Join a global community dedicated to documenting, translating, and celebrating the linguistic heritage of Africa&apos;s diverse cultures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-border bg-background">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Browse Datasets</h3>
              <p className="text-muted-foreground">
                Explore curated language datasets, translations, and cultural data from African communities.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Vote &amp; Review</h3>
              <p className="text-muted-foreground">
                Evaluate translations and contribute quality assessments to ensure accuracy and cultural authenticity.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-background">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Contribute</h3>
              <p className="text-muted-foreground">
                Record voice samples, add translations, and help create comprehensive language resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4">
              Indigenous African languages carry the stories, knowledge, and heritage of millions of people. Yet many are endangered, with few digital resources available.
            </p>
            <p className="text-lg text-muted-foreground">
              Our platform empowers communities and researchers to digitize, preserve, and celebrate this linguistic diversity through collaborative dataset curation.
            </p>
          </div>
          <div className="bg-accent/10 rounded-lg p-8 border border-accent/20">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Endangered Languages</p>
                <p className="text-3xl font-bold text-primary">2000+</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contributors</p>
                <p className="text-3xl font-bold text-primary">Growing</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Datasets</p>
                <p className="text-3xl font-bold text-primary">Expanding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
