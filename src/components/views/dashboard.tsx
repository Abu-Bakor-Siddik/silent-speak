'use client'

import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  GraduationCap,
  StickyNote,
  Timer,
  MessageSquare,
  Volume2,
  Mic,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  Accessibility,
} from 'lucide-react'

const TOOL_ICONS: Record<string, React.ElementType> = {
  'role-select': GraduationCap,
  notes: StickyNote,
  pomodoro: Timer,
  'quick-communication': MessageSquare,
  'text-to-speech': Volume2,
  'speech-to-text': Mic,
}

const TOOL_COLORS: Record<string, { gradient: string; iconBg: string; iconColor: string; border: string }> = {
  'role-select': {
    gradient: 'from-blue-500/10 via-blue-600/5 to-transparent',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-600',
    border: 'hover:border-blue-500/40',
  },
  notes: {
    gradient: 'from-amber-500/10 via-amber-600/5 to-transparent',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-600',
    border: 'hover:border-amber-500/40',
  },
  pomodoro: {
    gradient: 'from-red-500/10 via-red-600/5 to-transparent',
    iconBg: 'bg-red-500/15',
    iconColor: 'text-red-600',
    border: 'hover:border-red-500/40',
  },
  'quick-communication': {
    gradient: 'from-emerald-500/10 via-emerald-600/5 to-transparent',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-600',
    border: 'hover:border-emerald-500/40',
  },
  'text-to-speech': {
    gradient: 'from-purple-500/10 via-purple-600/5 to-transparent',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-600',
    border: 'hover:border-purple-500/40',
  },
  'speech-to-text': {
    gradient: 'from-cyan-500/10 via-cyan-600/5 to-transparent',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-600',
    border: 'hover:border-cyan-500/40',
  },
}

export function Dashboard() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const hasActiveSession = useAppStore((s) => s.hasActiveSession)
  const activeSession = useAppStore((s) => s.activeSession)
  const settings = useAppStore((s) => s.settings)
  const tasks = useAppStore((s) => s.tasks)

  const isFuturistic = settings.uiStyle === 'futuristic'

  const tools = [
    {
      title: 'Join / Create Session',
      desc: 'Start a live session as teacher or join as student',
      view: 'role-select' as const,
    },
    {
      title: 'Notes',
      desc: 'Create, edit and manage your notes with AI enhancement',
      view: 'notes' as const,
    },
    {
      title: 'Pomodoro Timer',
      desc: 'Focus timer with customizable intervals and break reminders',
      view: 'pomodoro' as const,
    },
    {
      title: 'Quick Communication',
      desc: 'Pre-built phrases, text-to-speech, and symbol boards',
      view: 'quick-communication' as const,
    },
    {
      title: 'Text to Speech',
      desc: 'Convert written text into spoken audio',
      view: 'text-to-speech' as const,
    },
    {
      title: 'Speech to Text',
      desc: 'Real-time transcription of speech to text',
      view: 'speech-to-text' as const,
    },
  ]

  const pendingTasks = tasks.filter((t) => t.status === 'pending')

  if (isFuturistic) {
    return (
      <div className="space-y-8 px-4 sm:px-6 lg:px-8 pb-8">
        {/* Futuristic Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 p-6 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Zap className="size-4 text-primary" />
              <span>Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Your accessible learning command center
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 size-32 rounded-full bg-purple-500/5 blur-2xl" />
        </div>

        {/* Active Session Banner (Futuristic) */}
        {hasActiveSession && activeSession && (
          <div className="relative overflow-hidden rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-green-500/10 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="inline-block size-3 rounded-full bg-green-500 animate-pulse shadow-lg shadow-green-500/50" />
                <div>
                  <p className="font-semibold">Active Session</p>
                  <p className="text-sm text-muted-foreground font-mono">{activeSession.code}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activeSession.role === 'teacher' ? 'Teaching' : 'Learning'}
                </Badge>
              </div>
              <Button
                onClick={() =>
                  setCurrentView(
                    activeSession.role === 'teacher'
                      ? 'teacher-session'
                      : 'student-session'
                  )
                }
                size="sm"
                className="gap-1.5"
              >
                Return to Session
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-primary">{pendingTasks.length}</p>
            <p className="text-xs text-muted-foreground">Pending Tasks</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">{tasks.filter(t => t.status === 'completed').length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{hasActiveSession ? '1' : '0'}</p>
            <p className="text-xs text-muted-foreground">Active Sessions</p>
          </div>
          <div className="rounded-xl border bg-card p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {currentUser?.disability && currentUser.disability !== 'none' ? '✓' : '—'}
            </p>
            <p className="text-xs text-muted-foreground">Accessibility</p>
          </div>
        </div>

        {/* Tools Grid (Futuristic) */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Quick Access Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => {
              const Icon = TOOL_ICONS[tool.view] || BookOpen
              const colors = TOOL_COLORS[tool.view] || TOOL_COLORS['notes']
              return (
                <Card
                  key={tool.view}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border ${colors.border} bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}
                  onClick={() => setCurrentView(tool.view)}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                  <CardHeader className="pb-2 relative z-10">
                    <CardTitle className="text-base flex items-center gap-3">
                      <div className={`inline-flex p-2.5 rounded-xl ${colors.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                        <Icon className={`size-5 ${colors.iconColor}`} />
                      </div>
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-sm text-muted-foreground">{tool.desc}</p>
                    <div className="mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Open <ArrowRight className="size-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Accessibility Quick Actions */}
        <Card className="bg-gradient-to-br from-primary/5 via-background to-background">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Accessibility className="size-5 text-primary" />
              Accessibility Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentView('settings')} className="gap-1.5">
                Adjust Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('profile')} className="gap-1.5">
                Update Profile
              </Button>
              {currentUser?.disability?.includes('dyslexia') && (
                <Badge variant="secondary">Dyslexia Mode Active</Badge>
              )}
              {currentUser?.disability?.includes('color-blind') && (
                <Badge variant="secondary">Color-Blind Mode Active</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Default (non-futuristic) Dashboard — but with futuristic-aware styling
  return (
    <div className="space-y-8 px-4 sm:px-6 lg:px-8 pb-8">
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome back{currentUser?.name ? `, ${currentUser.name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Choose a tool to get started
        </p>
      </div>

      {hasActiveSession && activeSession && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
              Active Session: {activeSession.code}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() =>
                setCurrentView(
                  activeSession.role === 'teacher'
                    ? 'teacher-session'
                    : 'student-session'
                )
              }
              size="sm"
            >
              Return to Session
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = TOOL_ICONS[tool.view] || BookOpen
          const colors = TOOL_COLORS[tool.view] || TOOL_COLORS['notes']
          return (
            <Card
              key={tool.view}
              className={`cursor-pointer transition-all hover:shadow-md ${colors.border}`}
              onClick={() => setCurrentView(tool.view)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className={`inline-flex p-2 rounded-lg ${colors.iconBg}`}>
                    <Icon className={`size-4 ${colors.iconColor}`} />
                  </div>
                  {tool.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tool.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
