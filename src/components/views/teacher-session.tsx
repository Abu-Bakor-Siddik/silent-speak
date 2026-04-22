'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import {
  Mic,
  MicOff,
  Copy,
  Download,
  Send,
  Plus,
  X,
  ChevronDown,
  Timer,
} from 'lucide-react'

type TaskType = 'task' | 'HW' | 'CW' | 'Project'

export function TeacherSession() {
  const currentUser = useAppStore((s) => s.currentUser)
  const activeSession = useAppStore((s) => s.activeSession)
  const captions = useAppStore((s) => s.captions)
  const addCaption = useAppStore((s) => s.addCaption)
  const clearCaptions = useAppStore((s) => s.clearCaptions)
  const fullCaptionText = useAppStore((s) => s.fullCaptionText)
  const setFullCaptionText = useAppStore((s) => s.setFullCaptionText)
  const messages = useAppStore((s) => s.messages)
  const addMessage = useAppStore((s) => s.addMessage)
  const participants = useAppStore((s) => s.participants)
  const addParticipant = useAppStore((s) => s.addParticipant)
  const removeParticipant = useAppStore((s) => s.removeParticipant)
  const setActiveSession = useAppStore((s) => s.setActiveSession)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const tasks = useAppStore((s) => s.tasks)
  const addTask = useAppStore((s) => s.addTask)
  const updateTask = useAppStore((s) => s.updateTask)

  const socketRef = useRef<Socket | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('task')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [isMuted, setIsMuted] = useState(true)
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showEndDialog, setShowEndDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [dmTarget, setDmTarget] = useState<string>('')
  const [dmMessage, setDmMessage] = useState('')
  const [showDmDialog, setShowDmDialog] = useState(false)
  const [sttLang, setSttLang] = useState('en-US')
  const [isSttActive, setIsSttActive] = useState(false)
  const [sttInterim, setSttInterim] = useState('')

  const captionsEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Auto-scroll effect - only scroll the caption container, not the whole page
  useEffect(() => {
    if (autoScroll && captionsEndRef.current) {
      const container = captionsEndRef.current.parentElement
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }
  }, [captions, autoScroll])

  // WebSocket connection
  useEffect(() => {
    if (!activeSession) return

    const socket = io('https://silent-speak-tp68.onrender.com/')
    socketRef.current = socket

    socket.emit('create-session', {
      sessionCode: activeSession.code,
      teacherName: activeSession.teacherName,
    })

    socket.on('student-joined', (data: { studentId: string; nickname: string }) => {
      addParticipant(data)
    })

    socket.on('student-left', (data: { studentId: string }) => {
      removeParticipant(data.studentId)
    })

    socket.on('message', (data: any) => {
      addMessage(data)
    })

    socket.on('quick-comm', (data: any) => {
      addMessage({
        senderId: data.senderId,
        senderName: data.senderName,
        senderRole: 'student',
        content: data.phrase,
        type: 'quick-comm',
      })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [activeSession, addParticipant, removeParticipant, addMessage])

  // Stable ref for sendCaption to avoid access-before-declaration
  const sendCaptionRef = useRef<(text: string) => void>(() => {})

  // Web Speech API for built-in STT
  const startStt = useCallback(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = sttLang

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript
        } else {
          interim += event.results[i][0].transcript
        }
      }
      if (final) {
        sendCaptionRef.current(final)
        setSttInterim('')
      } else {
        setSttInterim(interim)
      }
    }

    recognition.onerror = () => {
      setIsSttActive(false)
    }

    recognition.onend = () => {
      // Restart if still active
      if (isSttActive && recognitionRef.current) {
        try {
          recognition.start()
        } catch {
          setIsSttActive(false)
        }
      } else {
        setIsSttActive(false)
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsSttActive(true)
  }, [sttLang, isSttActive])

  const stopStt = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsSttActive(false)
    setSttInterim('')
  }, [])

  // Toggle mic with STT
  const toggleMic = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    if (socketRef.current && activeSession) {
      socketRef.current.emit('mic-toggle', {
        sessionCode: activeSession.code,
        isMuted: newMuted,
      })
    }
    if (newMuted) {
      stopStt()
    } else {
      startStt()
    }
  }

  const sendMessage = () => {
    if (!messageInput.trim() || !socketRef.current || !activeSession) return
    const msg = {
      sessionCode: activeSession.code,
      senderId: currentUser?.id || '',
      senderName: currentUser?.name || 'Teacher',
      senderRole: 'teacher',
      content: messageInput.trim(),
      type: 'text',
    }
    socketRef.current.emit('message', msg)
    addMessage(msg)
    setMessageInput('')
  }

  const sendDirectMessage = () => {
    if (!dmMessage.trim() || !socketRef.current || !activeSession || !dmTarget) return
    const msg = {
      sessionCode: activeSession.code,
      senderId: currentUser?.id || '',
      senderName: currentUser?.name || 'Teacher',
      senderRole: 'teacher',
      content: dmMessage.trim(),
      recipientId: dmTarget,
      type: 'text',
    }
    socketRef.current.emit('message', msg)
    addMessage(msg)
    setDmMessage('')
    setShowDmDialog(false)
  }

  const sendCaption = (text: string) => {
    if (!socketRef.current || !activeSession) return
    const caption = { text, timestamp: Date.now() }
    socketRef.current.emit('caption', {
      sessionCode: activeSession.code,
      ...caption,
    })
    addCaption(caption)
    const newText = fullCaptionText + ' ' + text
    setFullCaptionText(newText)
    socketRef.current.emit('caption-bulk', {
      sessionCode: activeSession.code,
      fullText: newText,
    })
  }

  // Keep sendCaptionRef in sync so STT callback always uses the latest version
  useEffect(() => {
    sendCaptionRef.current = sendCaption
  })

  const assignTask = () => {
    if (!taskTitle.trim() || !socketRef.current || !activeSession) return
    const task = {
      id: Date.now().toString(),
      sessionId: activeSession.code,
      teacherId: currentUser?.id || '',
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      type: taskType,
      dueDate: taskDueDate || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    socketRef.current.emit('task-assigned', {
      sessionCode: activeSession.code,
      task: {
        id: task.id,
        title: task.title,
        description: task.description || '',
        type: task.type,
        dueDate: task.dueDate || null,
      },
    })
    addTask(task)
    setTaskTitle('')
    setTaskDesc('')
    setTaskType('task')
    setTaskDueDate('')
    setShowTaskDialog(false)
  }

  const endSession = () => {
    if (!socketRef.current || !activeSession) return
    stopStt()
    socketRef.current.emit('leave-session', {
      sessionCode: activeSession.code,
      userId: currentUser?.id || '',
      role: 'teacher',
    })
    setActiveSession(null)
    setCurrentView('dashboard')
  }

  const copySessionCode = () => {
    if (!activeSession) return
    navigator.clipboard.writeText(activeSession.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const TASK_TYPE_COLORS: Record<TaskType, string> = {
    task: 'bg-blue-100 text-blue-700',
    HW: 'bg-amber-100 text-amber-700',
    CW: 'bg-emerald-100 text-emerald-700',
    Project: 'bg-purple-100 text-purple-700',
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
              Start a Session
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
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Teacher Session</h1>
          <div className="flex items-center gap-2">
            <span className="inline-block size-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground">Live</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => setCurrentView('dashboard')}>
            Dashboard
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setShowEndDialog(true)}>
            End Session
          </Button>
        </div>
      </div>

      {/* Session Code Display */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-medium">SESSION CODE</p>
            <p className="text-3xl font-bold tracking-widest font-mono">{activeSession.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 min-h-[44px]"
              onClick={copySessionCode}
            >
              <Copy className="size-4" />
              {copied ? 'Copied!' : 'Copy Code'}
            </Button>
            <Badge variant="secondary">{participants.length} student{participants.length !== 1 ? 's' : ''}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Captions Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                Live Captions
                {isSttActive && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-red-500">
                    <span className="inline-block size-2 rounded-full bg-red-500 animate-pulse" />
                    Recording
                  </span>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="auto-scroll" className="text-xs">Auto-scroll</Label>
                  <Switch
                    id="auto-scroll"
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
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="min-h-[200px] max-h-[350px] overflow-y-auto rounded-md border p-3 space-y-1">
              {captions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No captions yet. Turn on your mic to start live captioning, or type captions below.
                </p>
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
              {sttInterim && (
                <p className="text-sm text-muted-foreground italic">
                  {sttInterim}
                </p>
              )}
              <div ref={captionsEndRef} />
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Type a caption..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement
                    if (target.value.trim()) {
                      sendCaption(target.value.trim())
                      target.value = ''
                    }
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Button
                variant={isMuted ? 'default' : 'destructive'}
                size="sm"
                className="gap-1.5 min-h-[44px]"
                onClick={toggleMic}
              >
                {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
                {isMuted ? 'Start Mic (STT)' : 'Stop Mic'}
              </Button>
              <Select value={sttLang} onValueChange={(v) => { setSttLang(v); if (isSttActive) { stopStt(); } }}>
                <SelectTrigger className="w-[140px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="bn-BD">Bangla</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Students ({participants.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 min-h-[44px]"
                onClick={() => setShowDmDialog(true)}
                disabled={participants.length === 0}
              >
                <Send className="size-3.5" />
                DM
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students joined yet. Share the session code!</p>
            ) : (
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {participants.map((p) => (
                  <li key={p.studentId} className="text-sm flex items-center gap-2 p-1.5 rounded hover:bg-accent/50">
                    <span className="inline-block size-2 rounded-full bg-green-400" />
                    {p.nickname}
                  </li>
                ))}
              </ul>
            )}
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
                    <span className="font-medium">{m.senderName}:</span>{' '}
                    {m.content}
                    {m.recipientId && (
                      <span className="text-xs text-muted-foreground ml-1">(DM)</span>
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
                <Send className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tasks ({tasks.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 min-h-[44px]"
                onClick={() => setShowTaskDialog(true)}
              >
                <Plus className="size-3.5" />
                Add
              </Button>
            </div>
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
                      <Badge className={`text-xs ${TASK_TYPE_COLORS[t.type as TaskType] || 'bg-gray-100 text-gray-700'}`}>
                        {t.type}
                      </Badge>
                    </div>
                    {t.description && (
                      <p className="text-muted-foreground text-xs">{t.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {t.teacherId === currentUser?.id ? 'Assigned by you' : t.status}
                      </Badge>
                      {t.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="size-3" />
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

      {/* End Session Confirmation Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session?</AlertDialogTitle>
            <AlertDialogDescription>
              This will end the session for all {participants.length} student{participants.length !== 1 ? 's' : ''}. All participants will be disconnected and the session code <strong>{activeSession.code}</strong> will no longer be valid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={endSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              End Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assign Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title</Label>
              <Input
                placeholder="e.g., Read Chapter 5"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Describe the task..."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="HW">Homework</SelectItem>
                    <SelectItem value="CW">Classwork</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due Date (optional)</Label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
                Cancel
              </Button>
              <Button onClick={assignTask} disabled={!taskTitle.trim()}>
                Assign Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Direct Message Dialog */}
      <Dialog open={showDmDialog} onOpenChange={setShowDmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Direct Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Send to</Label>
              <Select value={dmTarget} onValueChange={setDmTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.studentId} value={p.studentId}>
                      {p.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Type your message..."
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendDirectMessage()
                  }
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDmDialog(false)}>
                Cancel
              </Button>
              <Button onClick={sendDirectMessage} disabled={!dmMessage.trim() || !dmTarget}>
                <Send className="size-4 mr-1.5" />
                Send
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
