'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore } from '@/store/app-store'
import {
  Download,
  Sparkles,
  Save,
  Volume2,
  LogOut,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

export function StudentSession() {
  const currentUser = useAppStore((s) => s.currentUser)
  const activeSession = useAppStore((s) => s.activeSession)
  const captions = useAppStore((s) => s.captions)
  const addCaption = useAppStore((s) => s.addCaption)
  const clearCaptions = useAppStore((s) => s.clearCaptions)
  const fullCaptionText = useAppStore((s) => s.fullCaptionText)
  const setFullCaptionText = useAppStore((s) => s.setFullCaptionText)
  const messages = useAppStore((s) => s.messages)
  const addMessage = useAppStore((s) => s.addMessage)
  const setActiveSession = useAppStore((s) => s.setActiveSession)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const addTask = useAppStore((s) => s.addTask)
  const tasks = useAppStore((s) => s.tasks)

  const socketRef = useRef<Socket | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [autoScroll, setAutoScroll] = useState(true)
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedText, setEnhancedText] = useState('')
  const [saving, setSaving] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const captionsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll effect - only scroll the caption container, not the whole page
  useEffect(() => {
    if (autoScroll && captionsEndRef.current) {
      const container = captionsEndRef.current.parentElement
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [captions, autoScroll])

  useEffect(() => {
    if (!activeSession || !currentUser) return

    const socket = io('https://silent-speak-tp68.onrender.com/')
    socketRef.current = socket

    socket.emit('join-session', {
      sessionCode: activeSession.code,
      studentId: currentUser.id,
      nickname: currentUser.nickname || currentUser.name || currentUser.email,
    })

    socket.on('caption', (data: { text: string; timestamp: number }) => {
      addCaption(data)
    })

    socket.on('caption-history', (history: { text: string; timestamp: number }[]) => {
      clearCaptions()
      history.forEach((c) => addCaption(c))
    })

    socket.on('caption-bulk', (data: { fullText: string }) => {
      setFullCaptionText(data.fullText)
    })

    socket.on('message', (data: any) => {
      addMessage(data)
    })

    socket.on('task-assigned', (task: any) => {
      addTask({
        id: task.id,
        sessionId: activeSession.code,
        teacherId: '',
        title: task.title,
        description: task.description,
        type: task.type,
        dueDate: task.dueDate || undefined,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
    })

    socket.on('session-ended', () => {
      setSessionEnded(true)
    })

    return () => {
      socket.emit('leave-session', {
        sessionCode: activeSession.code,
        userId: currentUser.id,
        role: 'student',
      })
      socket.disconnect()
      socketRef.current = null
    }
  }, [activeSession, currentUser, addCaption, clearCaptions, setFullCaptionText, addMessage, addTask])

  const sendMessage = () => {
    if (!messageInput.trim() || !socketRef.current || !activeSession) return
    const msg = {
      sessionCode: activeSession.code,
      senderId: currentUser?.id || '',
      senderName: currentUser?.nickname || currentUser?.name || 'Student',
      senderRole: 'student',
      content: messageInput.trim(),
      type: 'text',
    }
    socketRef.current.emit('message', msg)
    addMessage(msg)
    setMessageInput('')
  }

  const sendQuickComm = (phrase: string) => {
    if (!socketRef.current || !activeSession) return

    // Also speak the phrase aloud on the student's device using TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const cleanPhrase = phrase.replace(/[^\w\s.,!?']/g, '').trim()
      if (cleanPhrase) {
        const utterance = new SpeechSynthesisUtterance(cleanPhrase)
        utterance.rate = 0.9
        window.speechSynthesis.speak(utterance)
      }
    }

    socketRef.current.emit('quick-comm', {
      sessionCode: activeSession.code,
      senderId: currentUser?.id || '',
      senderName: currentUser?.nickname || currentUser?.name || 'Student',
      phrase,
    })
    addMessage({
      senderId: currentUser?.id || '',
      senderName: currentUser?.nickname || currentUser?.name || 'Student',
      senderRole: 'student',
      content: phrase,
      type: 'quick-comm',
    })
  }

  const downloadCaptions = () => {
    const content = captions
      .map((c) => `[${new Date(c.timestamp).toLocaleTimeString()}] ${c.text}`)
      .join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `captions-${activeSession?.code || 'session'}-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const enhanceWithAI = async () => {
    const textToEnhance = fullCaptionText || captions.map((c) => c.text).join(' ')
    if (!textToEnhance.trim()) return
    setEnhancing(true)
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToEnhance }),
      })
      const data = await res.json()
      if (res.ok && data.enhanced) {
        setEnhancedText(data.enhanced)
      }
    } catch {
      // error
    } finally {
      setEnhancing(false)
    }
  }

  const saveAsNote = async () => {
    if (!currentUser) return
    setSaving(true)
    const rawText = fullCaptionText || captions.map((c) => c.text).join(' ')
    const textToSave = enhancedText || rawText
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: `Session ${activeSession?.code || 'Notes'} - ${new Date().toLocaleDateString()}`,
          content: textToSave,
          rawContent: enhancedText ? rawText : undefined,
          type: 'session',
          sessionId: activeSession?.code,
        }),
      })
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const handleLeaveSession = () => {
    if (socketRef.current && activeSession && currentUser) {
      socketRef.current.emit('leave-session', {
        sessionCode: activeSession.code,
        userId: currentUser.id,
        role: 'student',
      })
    }
    setActiveSession(null)
    setCurrentView('dashboard')
  }

  if (!activeSession) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>No Active Session</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentView('role-select')}>
              Join a Session
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Session ended overlay
  if (sessionEnded) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-2">
              <AlertTriangle className="size-12 text-amber-500" />
            </div>
            <CardTitle className="text-xl">Session Ended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The teacher has ended this session. You will be redirected to the dashboard.
            </p>
            <Button
              onClick={() => {
                setActiveSession(null)
                setCurrentView('dashboard')
              }}
              className="min-h-[44px]"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Student Session</h1>
          <Badge variant="secondary" className="font-mono">{activeSession.code}</Badge>
          <span className="inline-block size-2.5 rounded-full bg-green-500 animate-pulse" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 min-h-[44px]"
          onClick={handleLeaveSession}
        >
          <LogOut className="size-4" />
          Leave Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live Captions */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base">Live Captions</CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="student-auto-scroll" className="text-xs">Auto-scroll</Label>
                  <Switch
                    id="student-auto-scroll"
                    checked={autoScroll}
                    onCheckedChange={setAutoScroll}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 min-h-[44px]"
                  onClick={downloadCaptions}
                  disabled={captions.length === 0}
                >
                  <Download className="size-3.5" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] max-h-[400px] overflow-y-auto rounded-md border p-3 space-y-1">
              {captions.length === 0 ? (
                <p className="text-muted-foreground text-sm">Waiting for teacher to start captions...</p>
              ) : (
                captions.map((c, i) => (
                  <p key={i} className="text-sm">
                    <span className="text-muted-foreground text-xs">
                      {new Date(c.timestamp).toLocaleTimeString()}
                    </span>{' '}
                    {c.text}
                  </p>
                ))
              )}
              <div ref={captionsEndRef} />
            </div>

            {/* AI Enhanced Notes Display */}
            {enhancedText && (
              <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="size-4 text-primary" />
                    AI-Enhanced Notes
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => setEnhancedText('')}
                  >
                    Dismiss
                  </Button>
                </div>
                <div className="text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
                  {enhancedText}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 min-h-[44px]"
                onClick={enhanceWithAI}
                disabled={enhancing || captions.length === 0}
              >
                <Sparkles className="size-4" />
                {enhancing ? 'Enhancing...' : 'AI Enhance'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 min-h-[44px]"
                onClick={saveAsNote}
                disabled={saving || captions.length === 0}
              >
                <Save className="size-4" />
                {saving ? 'Saving...' : 'Save as Note'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Communication */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-1.5">
              <Volume2 className="size-4" />
              Quick Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {[
                '👍 I understand',
                '❓ I have a question',
                '🕐 Can you repeat?',
                '🔇 Too fast please',
                '✅ I am ready',
                '🤔 I need help',
                '🙏 Please wait',
                '👋 I am here',
              ].map((phrase) => (
                <Button
                  key={phrase}
                  variant="outline"
                  size="sm"
                  className="text-xs h-auto py-2.5 min-h-[44px] whitespace-normal"
                  onClick={() => sendQuickComm(phrase)}
                >
                  {phrase}
                </Button>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full mt-2 min-h-[44px]"
              onClick={() => setCurrentView('quick-communication')}
            >
              More Phrases
            </Button>
          </CardContent>
        </Card>

        {/* Messages */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[150px] max-h-[250px] overflow-y-auto space-y-2 rounded-md border p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">No messages yet</p>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className="text-sm">
                    <span className="font-medium">{m.senderName}:</span> {m.content}
                    {m.recipientId && m.recipientId === currentUser?.id && (
                      <span className="text-xs text-primary ml-1">(DM)</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Send a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button size="sm" onClick={sendMessage} className="min-h-[44px]">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assigned Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tasks assigned yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tasks.map((t) => (
                  <div key={t.id} className="border rounded p-2.5 text-sm space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">{t.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {t.type}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="text-muted-foreground text-xs">{t.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{t.status}</Badge>
                      {t.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
