'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppStore } from '@/store/app-store'
import { BookOpen, Loader2 } from 'lucide-react'

const DISABILITY_OPTIONS = [
  { id: 'hearing', label: 'Hearing Impairment', icon: '👂' },
  { id: 'speaking', label: 'Speech Impairment', icon: '🗣️' },
  { id: 'color-blind', label: 'Color Blindness', icon: '🎨' },
  { id: 'dyslexia', label: 'Dyslexia', icon: '📖' },
  { id: 'motor', label: 'Motor Impairment', icon: '🦾' },
  { id: 'visual', label: 'Visual Impairment', icon: '👁️' },
  { id: 'cognitive', label: 'Cognitive/Learning Disability', icon: '🧠' },
]

export function SignupPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
  })
  const [selectedDisabilities, setSelectedDisabilities] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!form.email.trim()) {
      setError('Email is required')
      return
    }
    if (!form.password) {
      setError('Password is required')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const disabilityValue = selectedDisabilities.length > 0
        ? selectedDisabilities.join(',')
        : 'none'

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name || form.email.split('@')[0],
          nickname: form.nickname || undefined,
          disability: disabilityValue,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Signup failed. Please try again.')
        return
      }

      setCurrentUser(data.user)
      updateSettings({
        fontSize: 'medium',
        fontFamily: selectedDisabilities.includes('dyslexia') ? 'dyslexia' : 'default',
        theme: 'light',
        buttonSize: selectedDisabilities.includes('motor') ? 'large' : 'default',
        colorBlindMode: selectedDisabilities.includes('color-blind') ? 'protanopia' : 'none',
      })
      setCurrentView('dashboard')
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleDisability = (id: string) => {
    setSelectedDisabilities((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center size-14 rounded-xl bg-primary/10">
              <BookOpen className="size-7 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription className="mt-1">Join SilentSpeak today</CardDescription>
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
              <Label htmlFor="signup-email">Email *</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                required
                autoComplete="email"
                className="min-h-[44px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-nickname">Nickname</Label>
                <Input
                  id="signup-nickname"
                  type="text"
                  placeholder="Display name"
                  value={form.nickname}
                  onChange={(e) => updateField('nickname', e.target.value)}
                  className="min-h-[44px]"
                />
              </div>
            </div>

            {/* Disability Selection */}
            <div className="space-y-3">
              <Label>Accessibility Needs (select all that apply)</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DISABILITY_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors min-h-[44px] ${
                      selectedDisabilities.includes(option.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent/50'
                    }`}
                  >
                    <Checkbox
                      checked={selectedDisabilities.includes(option.id)}
                      onCheckedChange={() => toggleDisability(option.id)}
                    />
                    <span className="text-sm">{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password *</Label>
              <Input
                id="signup-password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => updateField('password', e.target.value)}
                required
                autoComplete="new-password"
                className="min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-confirm">Confirm Password *</Label>
              <Input
                id="signup-confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                required
                autoComplete="new-password"
                className="min-h-[44px]"
              />
            </div>
            <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline font-medium"
              onClick={() => setCurrentView('login')}
            >
              Sign in
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
