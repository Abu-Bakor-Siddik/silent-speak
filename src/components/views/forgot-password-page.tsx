'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { BookOpen, Loader2, Mail, KeyRound, Lock } from 'lucide-react'

export function ForgotPasswordPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  
  const [step, setStep] = useState<'email' | 'pin' | 'reset'>('email')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep('pin')
      } else {
        setError(data.error || 'Failed to send verification PIN')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!pin.trim()) { setError('PIN is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), pin: pin.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStep('reset')
      } else {
        setError(data.error || 'Invalid PIN')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), pin: pin.trim(), newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentView('login')
      } else {
        setError(data.error || 'Failed to reset password')
      }
    } catch {
      setError('Network error. Please try again.')
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
              <KeyRound className="size-7 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription className="mt-1">
              {step === 'email' && 'Enter your email to receive a verification PIN'}
              {step === 'pin' && 'Enter the PIN sent to your email'}
              {step === 'reset' && 'Enter your new password'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'email' && (
            <form onSubmit={handleSendPin} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fp-email">Email</Label>
                <Input id="fp-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="min-h-[44px]" />
              </div>
              <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
                {loading ? <><Loader2 className="size-4 mr-2 animate-spin" />Sending PIN...</> : <><Mail className="size-4 mr-2" />Send Verification PIN</>}
              </Button>
            </form>
          )}
          {step === 'pin' && (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fp-pin">Verification PIN</Label>
                <Input id="fp-pin" type="text" placeholder="Enter 6-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} required className="min-h-[44px] text-center text-2xl tracking-widest" maxLength={6} />
                <p className="text-xs text-muted-foreground">A 6-digit PIN has been sent to {email}</p>
              </div>
              <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
                {loading ? <><Loader2 className="size-4 mr-2 animate-spin" />Verifying...</> : 'Verify PIN'}
              </Button>
            </form>
          )}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="fp-new-pw">New Password</Label>
                <Input id="fp-new-pw" type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="min-h-[44px]" />
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fp-confirm-pw">Confirm New Password</Label>
                <Input id="fp-confirm-pw" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="min-h-[44px]" />
              </div>
              <Button type="submit" className="w-full min-h-[44px]" disabled={loading}>
                {loading ? <><Loader2 className="size-4 mr-2 animate-spin" />Resetting...</> : <><Lock className="size-4 mr-2" />Reset Password</>}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <button type="button" className="text-sm text-muted-foreground underline-offset-4 hover:underline" onClick={() => setCurrentView('login')}>
              ← Back to login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
