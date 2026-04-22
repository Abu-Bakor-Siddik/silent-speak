'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'

export function RoleSelectPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const setActiveSession = useAppStore((s) => s.setActiveSession)
  const hasActiveSession = useAppStore((s) => s.hasActiveSession)
  const activeSession = useAppStore((s) => s.activeSession)
  const clearCaptions = useAppStore((s) => s.clearCaptions)
  const clearMessages = useAppStore((s) => s.clearMessages)

  const [sessionCode, setSessionCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [conflictMsg, setConflictMsg] = useState('')

  const handleCreateSession = async () => {
    if (!currentUser) return
    setConflictMsg('')

    if (hasActiveSession && activeSession) {
      if (activeSession.role === 'student') {
        setConflictMsg('You have an active session as a student. Leave that session first to create a new session as a teacher.')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: currentUser.id, teacherName: currentUser.name || currentUser.nickname || currentUser.email }),
      })
      const data = await res.json()
      if (res.ok) {
        clearCaptions()
        clearMessages()
        setActiveSession({
          code: data.session.code,
          role: 'teacher',
          teacherName: currentUser.name || currentUser.nickname || currentUser.email,
        })
        setCurrentView('teacher-session')
      }
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSession = async () => {
    if (!currentUser || !sessionCode.trim()) return
    setConflictMsg('')

    if (hasActiveSession && activeSession) {
      if (activeSession.role === 'teacher') {
        setConflictMsg('You have an active session as a teacher. End that session first to join as a student.')
        return
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCode: sessionCode.trim(),
          studentId: currentUser.id,
          nickname: currentUser.nickname || currentUser.name || currentUser.email,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        clearCaptions()
        clearMessages()
        setActiveSession({
          code: sessionCode.trim(),
          role: 'student',
          teacherName: data.session?.teacherName || 'Teacher',
        })
        setCurrentView('student-session')
      }
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  const teacherDisabled = hasActiveSession && activeSession?.role === 'student'
  const studentDisabled = hasActiveSession && activeSession?.role === 'teacher'

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Start or Join a Session</h1>
          <p className="text-muted-foreground mt-1">Choose your role to begin</p>
        </div>

        {conflictMsg && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {conflictMsg}
          </div>
        )}

        <Card className={teacherDisabled ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle>I&apos;m a Teacher</CardTitle>
            <CardDescription>Create a new live session for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateSession} disabled={loading} className="w-full">
              {loading ? 'Creating...' : 'Create New Session'}
            </Button>
          </CardContent>
        </Card>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Card className={studentDisabled ? 'opacity-50 pointer-events-none' : ''}>
          <CardHeader>
            <CardTitle>I&apos;m a Student</CardTitle>
            <CardDescription>Enter a session code to join your class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinSession()}
            />
            <Button onClick={handleJoinSession} disabled={loading || !sessionCode.trim()} className="w-full" variant="outline">
              {loading ? 'Joining...' : 'Join Session'}
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setCurrentView('dashboard')}
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
