'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { BookOpen, Loader2 } from 'lucide-react'

export function LoginPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your credentials and try again.')
        return
      }

      setCurrentUser(data.user)
      updateSettings({
        fontSize: (data.user.fontSize as 'small' | 'medium' | 'large' | 'xlarge') || 'medium',
        fontFamily: (data.user.fontFamily as 'default' | 'dyslexia' | 'mono') || 'default',
        theme: (data.user.theme as 'light' | 'dark' | 'high-contrast' | 'color-blind') || 'light',
        buttonSize: (data.user.buttonSize as 'default' | 'large' | 'xlarge') || 'default',
        colorBlindMode: (data.user.colorBlindMode as 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia') || 'none',
      })
      setCurrentView('dashboard')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center size-14 rounded-xl bg-primary/10">
              <BookOpen className="size-7 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="mt-1">Sign in to your SilentSpeak account</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="min-h-[44px]"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          <div className="text-right mt-4">
            <button
              type="button"
              className="text-sm text-primary underline-offset-4 hover:underline"
              onClick={() => setCurrentView('forgot-password')}
            >
              Forgot Password?
            </button>
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline font-medium"
              onClick={() => setCurrentView('signup')}
            >
              Sign up
            </button>
          </div>
          <div className="mt-2 text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              onClick={() => setCurrentView('landing')}
            >
              ← Back to home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
