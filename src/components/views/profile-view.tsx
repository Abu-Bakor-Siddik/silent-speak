'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Camera } from 'lucide-react'
import { useAppStore } from '@/store/app-store'

export function ProfileView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)

  const [form, setForm] = useState({
    name: '',
    nickname: '',
    email: '',
    disability: 'none',
    semester: '',
    department: '',
  })
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string>(currentUser?.avatar || '')

  const [passwordForm, setPasswordForm] = useState({ current: '', newPassword: '', confirm: '' })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  useEffect(() => {
    if (currentUser) {
      setForm({
        name: currentUser.name || '',
        nickname: currentUser.nickname || '',
        email: currentUser.email,
        disability: currentUser.disability || 'none',
        semester: currentUser.semester || '',
        department: currentUser.department || '',
      })
      setAvatarPreview(currentUser.avatar || '')
    }
  }, [currentUser])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser) return

    // Read file as data URL for preview
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)

      // Save to profile via API
      fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          avatar: dataUrl,
        }),
      }).then((res) => res.json()).then((data) => {
        if (data.user) {
          setCurrentUser(data.user)
        }
      })
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: form.name || undefined,
          nickname: form.nickname || undefined,
          disability: form.disability,
          semester: form.semester || undefined,
          department: form.department || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setCurrentUser(data.user)
      }
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    if (!passwordForm.current) {
      setPasswordError('Current password is required')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError('New passwords do not match')
      return
    }

    setPasswordSaving(true)
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          currentPassword: passwordForm.current,
          newPassword: passwordForm.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setPasswordSuccess(true)
        setPasswordForm({ current: '', newPassword: '', confirm: '' })
      } else {
        setPasswordError(data.error || 'Failed to update password')
      }
    } catch {
      setPasswordError('Network error. Please try again.')
    } finally {
      setPasswordSaving(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentView('login')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 max-w-lg mx-auto">
      <div>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-2xl font-bold mt-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Picture */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <div className="relative">
          <Avatar className="size-24">
            <AvatarImage src={avatarPreview} alt={form.name || 'User'} />
            <AvatarFallback className="text-2xl">
              {form.name ? form.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
            </AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute bottom-0 right-0 inline-flex items-center justify-center size-8 rounded-full bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors"
          >
            <Camera className="size-4" />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <p className="text-xs text-muted-foreground">Click camera icon to change photo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" value={form.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-nickname">Nickname</Label>
              <Input
                id="profile-nickname"
                value={form.nickname}
                onChange={(e) => setForm((p) => ({ ...p, nickname: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-disability">Accessibility Needs</Label>
              <select
                id="profile-disability"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={form.disability}
                onChange={(e) => setForm((p) => ({ ...p, disability: e.target.value }))}
              >
                <option value="none">None</option>
                <option value="visual">Visual Impairment</option>
                <option value="hearing">Hearing Impairment</option>
                <option value="motor">Motor Impairment</option>
                <option value="cognitive">Cognitive/Learning Disability</option>
                <option value="color-blind">Color Blindness</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-semester">Semester</Label>
              <Input
                id="profile-semester"
                value={form.semester}
                onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
                placeholder="e.g. Fall 2025"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-department">Department</Label>
              <Input
                id="profile-department"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Computer Science"
              />
            </div>
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Update */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="min-h-[44px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                className="min-h-[44px]"
              />
            </div>
            {passwordError && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">
                Password updated successfully!
              </div>
            )}
            <Button type="submit" className="w-full" disabled={passwordSaving}>
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
