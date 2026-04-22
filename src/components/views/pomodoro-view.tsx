'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Settings,
  CheckCircle,
  Clock,
  ListTodo,
} from 'lucide-react'

type PomodoroMode = 'work' | 'shortBreak' | 'longBreak'

const DEFAULT_DURATIONS: Record<PomodoroMode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
}

const MODE_LABELS: Record<PomodoroMode, string> = {
  work: 'Focus Time',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
}

const MODE_COLORS: Record<PomodoroMode, string> = {
  work: 'text-red-500',
  shortBreak: 'text-green-500',
  longBreak: 'text-blue-500',
}

interface PomodoroSession {
  id: string
  mode: PomodoroMode
  duration: number
  completedAt: string
  taskId?: string
}

export function PomodoroView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const tasks = useAppStore((s) => s.tasks)
  const updateTask = useAppStore((s) => s.updateTask)

  const [mode, setMode] = useState<PomodoroMode>('work')
  const [customDurations, setCustomDurations] = useState(DEFAULT_DURATIONS)
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.work)
  const [isRunning, setIsRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([])
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [customWork, setCustomWork] = useState('25')
  const [customShort, setCustomShort] = useState('5')
  const [customLong, setCustomLong] = useState('15')

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const modeRef = useRef(mode)
  const sessionsRef = useRef(sessions)
  const tasksRef = useRef(tasks)

  useEffect(() => {
    modeRef.current = mode
    sessionsRef.current = sessions
    tasksRef.current = tasks
  }, [mode, sessions, tasks])

  const durations = customDurations

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false)
    const currentMode = modeRef.current
    const currentSessions = sessionsRef.current

    // Record completed session
    const completedSession: PomodoroSession = {
      id: Date.now().toString(),
      mode: currentMode,
      duration: durations[currentMode],
      completedAt: new Date().toISOString(),
    }
    setCompletedSessions((prev) => [...prev, completedSession])

    if (currentMode === 'work') {
      const newSessions = currentSessions + 1
      setSessions(newSessions)
      const nextMode: PomodoroMode = newSessions % 4 === 0 ? 'longBreak' : 'shortBreak'
      setMode(nextMode)
      setTimeLeft(durations[nextMode])
    } else {
      setMode('work')
      setTimeLeft(durations.work)
    }
  }, [durations])

  useEffect(() => {
    if (!isRunning) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimeout(handleTimerComplete, 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, handleTimerComplete])

  const toggleTimer = () => setIsRunning(!isRunning)

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(durations[mode])
  }

  const switchMode = (newMode: PomodoroMode) => {
    setIsRunning(false)
    setMode(newMode)
    setTimeLeft(durations[newMode])
  }

  const markTaskComplete = () => {
    if (!selectedTaskId) return
    updateTask(selectedTaskId, { status: 'completed' })
    setSelectedTaskId('')
  }

  const applyCustomDurations = () => {
    const newDurations = {
      work: Math.max(1, parseInt(customWork) || 25) * 60,
      shortBreak: Math.max(1, parseInt(customShort) || 5) * 60,
      longBreak: Math.max(1, parseInt(customLong) || 15) * 60,
    }
    setCustomDurations(newDurations)
    if (!isRunning) {
      setTimeLeft(newDurations[mode])
    }
    setShowCustomDialog(false)
  }

  const todaySessions = completedSessions.filter(
    (s) => new Date(s.completedAt).toDateString() === new Date().toDateString()
  )

  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const completedTasks = tasks.filter((t) => t.status === 'completed')

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100

  const TASK_TYPE_COLORS: Record<string, string> = {
    task: 'bg-blue-100 text-blue-700',
    HW: 'bg-amber-100 text-amber-700',
    CW: 'bg-emerald-100 text-emerald-700',
    Project: 'bg-purple-100 text-purple-700',
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 max-w-4xl mx-auto pb-8">
      <div>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <Timer className="size-6" />
          Pomodoro Timer
        </h1>
        <p className="text-muted-foreground">Focus timer with customizable intervals</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Timer Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                {(['work', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => (
                  <Button
                    key={m}
                    variant={mode === m ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => switchMode(m)}
                    className="min-h-[44px]"
                  >
                    {MODE_LABELS[m]}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-[44px] gap-1.5"
                onClick={() => setShowCustomDialog(true)}
              >
                <Settings className="size-4" />
                Custom
              </Button>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {/* Task indicator */}
            {selectedTaskId && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <ListTodo className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Working on:</span>
                <Badge variant="secondary">
                  {tasks.find((t) => t.id === selectedTaskId)?.title || 'Unknown Task'}
                </Badge>
              </div>
            )}

            <div className={`text-6xl sm:text-7xl font-bold tracking-tight ${MODE_COLORS[mode]}`}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {MODE_LABELS[mode]} — Session {sessions + 1}
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={toggleTimer} size="lg" className="gap-2 min-h-[44px]">
                {isRunning ? <Pause className="size-5" /> : <Play className="size-5" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={resetTimer} variant="outline" size="lg" className="gap-2 min-h-[44px]">
                <RotateCcw className="size-5" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Task Integration */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ListTodo className="size-4" />
              Task Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-sm">Select task to work on</Label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue placeholder="Choose a task..." />
                </SelectTrigger>
                <SelectContent>
                  {pendingTasks.length === 0 ? (
                    <SelectItem value="_none" disabled>No pending tasks</SelectItem>
                  ) : (
                    pendingTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] px-1 ${TASK_TYPE_COLORS[t.type] || 'bg-gray-100 text-gray-700'}`}>
                            {t.type}
                          </Badge>
                          {t.title}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {selectedTaskId && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 min-h-[44px]"
                onClick={markTaskComplete}
              >
                <CheckCircle className="size-4" />
                Mark Complete
              </Button>
            )}

            {/* Completed Sessions Today */}
            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Today&apos;s Sessions ({todaySessions.length})
              </h4>
              {todaySessions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No sessions completed today</p>
              ) : (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {todaySessions.map((s) => (
                    <div key={s.id} className="text-xs flex items-center justify-between p-1.5 rounded bg-accent/50">
                      <span className="flex items-center gap-1.5">
                        <span className={MODE_COLORS[s.mode]}>●</span>
                        {MODE_LABELS[s.mode]}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round(s.duration / 60)}min
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <ListTodo className="size-4" />
            Assigned Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks assigned yet. Join a session to receive tasks.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pending Tasks */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-amber-600">Pending ({pendingTasks.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pendingTasks.map((t) => (
                    <div key={t.id} className="border rounded-lg p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">{t.title}</span>
                        <Badge className={`text-xs ${TASK_TYPE_COLORS[t.type] || 'bg-gray-100 text-gray-700'}`}>
                          {t.type}
                        </Badge>
                      </div>
                      {t.description && (
                        <p className="text-muted-foreground text-xs">{t.description}</p>
                      )}
                      {t.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                  {pendingTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground">All caught up!</p>
                  )}
                </div>
              </div>
              {/* Completed Tasks */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-600">Completed ({completedTasks.length})</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {completedTasks.map((t) => (
                    <div key={t.id} className="border rounded-lg p-3 text-sm opacity-60">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-500" />
                        <span className="font-medium line-through truncate">{t.title}</span>
                      </div>
                    </div>
                  ))}
                  {completedTasks.length === 0 && (
                    <p className="text-xs text-muted-foreground">No completed tasks yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Custom Duration Dialog */}
      {showCustomDialog && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Custom Durations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Work (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={customWork}
                  onChange={(e) => setCustomWork(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Short Break (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={customShort}
                  onChange={(e) => setCustomShort(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Long Break (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={customLong}
                  onChange={(e) => setCustomLong(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCustomDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={applyCustomDurations}>Apply</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
