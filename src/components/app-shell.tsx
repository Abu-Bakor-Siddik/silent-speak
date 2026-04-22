'use client'

import React, { Suspense, useEffect } from 'react'
import { useAppStore, type ViewType } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  StickyNote,
  Timer,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  ArrowLeftToLine,
  BookOpen,
  Mic,
  Volume2,
  Sparkles,
  GraduationCap,
  User,
  HelpCircle,
} from 'lucide-react'

// ─── Lazy-loaded view components ─────────────────────────────────────────────

const LandingPage = React.lazy(() =>
  import('@/components/views/landing-page').then((m) => ({ default: m.LandingPage }))
)
const LoginPage = React.lazy(() =>
  import('@/components/views/login-page').then((m) => ({ default: m.LoginPage }))
)
const SignupPage = React.lazy(() =>
  import('@/components/views/signup-page').then((m) => ({ default: m.SignupPage }))
)
const Dashboard = React.lazy(() =>
  import('@/components/views/dashboard').then((m) => ({ default: m.Dashboard }))
)
const RoleSelectPage = React.lazy(() =>
  import('@/components/views/role-select-page').then((m) => ({ default: m.RoleSelectPage }))
)
const TeacherSession = React.lazy(() =>
  import('@/components/views/teacher-session').then((m) => ({ default: m.TeacherSession }))
)
const StudentSession = React.lazy(() =>
  import('@/components/views/student-session').then((m) => ({ default: m.StudentSession }))
)
const TextToSpeechView = React.lazy(() =>
  import('@/components/views/text-to-speech').then((m) => ({ default: m.TextToSpeechView }))
)
const SpeechToTextView = React.lazy(() =>
  import('@/components/views/speech-to-text').then((m) => ({ default: m.SpeechToTextView }))
)
const NotesView = React.lazy(() =>
  import('@/components/views/notes-view').then((m) => ({ default: m.NotesView }))
)
const PomodoroView = React.lazy(() =>
  import('@/components/views/pomodoro-view').then((m) => ({ default: m.PomodoroView }))
)
const QuickCommView = React.lazy(() =>
  import('@/components/views/quick-comm-view').then((m) => ({ default: m.QuickCommView }))
)
const SettingsView = React.lazy(() =>
  import('@/components/views/settings-view').then((m) => ({ default: m.SettingsView }))
)
const ProfileView = React.lazy(() =>
  import('@/components/views/profile-view').then((m) => ({ default: m.ProfileView }))
)
const GettingStartedPage = React.lazy(() =>
  import('@/components/views/getting-started-page').then((m) => ({ default: m.GettingStartedPage }))
)
const AccessibilityStandardsPage = React.lazy(() =>
  import('@/components/views/accessibility-standards-page').then((m) => ({ default: m.AccessibilityStandardsPage }))
)
const FAQPage = React.lazy(() =>
  import('@/components/views/faq-page').then((m) => ({ default: m.FaqPage }))
)
const ForgotPasswordPage = React.lazy(() =>
  import('@/components/views/forgot-password-page').then((m) => ({ default: m.ForgotPasswordPage }))
)

// ─── View Map ────────────────────────────────────────────────────────────────

const VIEW_MAP: Record<ViewType, React.LazyExoticComponent<React.ComponentType>> = {
  landing: LandingPage,
  login: LoginPage,
  signup: SignupPage,
  dashboard: Dashboard,
  'role-select': RoleSelectPage,
  'teacher-session': TeacherSession,
  'student-session': StudentSession,
  'text-to-speech': TextToSpeechView,
  'speech-to-text': SpeechToTextView,
  notes: NotesView,
  pomodoro: PomodoroView,
  'quick-communication': QuickCommView,
  settings: SettingsView,
  profile: ProfileView,
  'getting-started': GettingStartedPage,
  'accessibility-standards': AccessibilityStandardsPage,
  faq: FAQPage,
  'forgot-password': ForgotPasswordPage,
}

// ─── Auth views (no navbar) ──────────────────────────────────────────────────

const AUTH_VIEWS: ViewType[] = ['landing', 'login', 'signup', 'forgot-password', 'getting-started', 'accessibility-standards', 'faq']

// ─── Loading Spinner ─────────────────────────────────────────────────────────

function ViewLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

function Navbar() {
  const currentView = useAppStore((s) => s.currentView)
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const setCurrentUser = useAppStore((s) => s.setCurrentUser)
  const hasActiveSession = useAppStore((s) => s.hasActiveSession)
  const activeSession = useAppStore((s) => s.activeSession)
  const settings = useAppStore((s) => s.settings)
  const isFuturistic = settings.uiStyle === 'futuristic'

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' as ViewType },
    { icon: GraduationCap, label: 'Session', view: 'role-select' as ViewType },
    { icon: StickyNote, label: 'Notes', view: 'notes' as ViewType },
    { icon: Timer, label: 'Pomodoro', view: 'pomodoro' as ViewType },
    { icon: MessageSquare, label: 'Quick Comm', view: 'quick-communication' as ViewType },
    { icon: Mic, label: 'STT', view: 'speech-to-text' as ViewType },
    { icon: Volume2, label: 'TTS', view: 'text-to-speech' as ViewType },
    { icon: Settings, label: 'Settings', view: 'settings' as ViewType },
  ]

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentView('landing')

    //  full reset
    useAppStore.getState().resetApp()

    //  force wipe persisted storage
    localStorage.removeItem('silent-speak-storage')
    sessionStorage.clear()

    //  hard reset
    window.location.href = '/login'
  }

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email
      ? currentUser.email[0].toUpperCase()
      : 'U'

  if (isFuturistic) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
        <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 gap-4">
          {/* Logo - Futuristic */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity group"
          >
            <div className="relative">
              <div className="inline-flex items-center justify-center size-9 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="size-5 text-primary" />
              </div>
              {hasActiveSession && (
                <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 animate-pulse ring-2 ring-background" />
              )}
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg tracking-tight">SilentSpeak</span>
              <span className="text-[10px] text-muted-foreground block -mt-1 tracking-wider uppercase">Accessible Learning</span>
            </div>
          </button>

          {/* Desktop Nav - Futuristic pill buttons */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 ml-4">
            {navItems.map((item) => {
              const isActive = currentView === item.view
              return (
                <Tooltip key={item.view}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentView(item.view)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/80'
                      }`}
                    >
                      <item.icon className="size-4" />
                      <span className="hidden xl:inline">{item.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Active Session Pill */}
            {hasActiveSession && activeSession && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() =>
                      setCurrentView(
                        activeSession.role === 'teacher'
                          ? 'teacher-session'
                          : 'student-session'
                      )
                    }
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-sm text-green-700 dark:text-green-400 hover:bg-green-500/20 transition-colors"
                  >
                    <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono font-medium">{activeSession.code}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>Return to active session</TooltipContent>
              </Tooltip>
            )}

            {/* Profile */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setCurrentView('profile')}
                  className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-accent/80 transition-colors"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="text-xs rounded-lg">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </TooltipTrigger>
              <TooltipContent>Profile</TooltipContent>
            </Tooltip>

            {/* Logout */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <LogOut className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Sign Out</TooltipContent>
            </Tooltip>

            {/* Mobile hamburger menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="inline-flex items-center justify-center size-9 rounded-xl hover:bg-accent/80 transition-colors lg:hidden">
                  <Menu className="size-5" />
                  <span className="sr-only">Open menu</span>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    SilentSpeak
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {navItems.map((item) => (
                    <button
                      key={item.view}
                      onClick={() => setCurrentView(item.view)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        currentView === item.view
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent/80 text-foreground'
                      }`}
                    >
                      <item.icon className="size-4" />
                      {item.label}
                    </button>
                  ))}
                  {hasActiveSession && activeSession && (
                    <button
                      onClick={() =>
                        setCurrentView(
                          activeSession.role === 'teacher'
                            ? 'teacher-session'
                            : 'student-session'
                        )
                      }
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400 mt-2"
                    >
                      <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
                      Session: {activeSession.code}
                    </button>
                  )}
                  <div className="border-t my-3" />
                  <button
                    onClick={() => setCurrentView('profile')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/80 transition-colors"
                  >
                    <Avatar className="size-5">
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="size-4" />
                    Sign Out
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    )
  }

  // Default (non-futuristic) Navbar
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 mr-4 hover:opacity-80 transition-opacity"
        >
          <BookOpen className="size-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline">SilentSpeak</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Tooltip key={item.view}>
              <TooltipTrigger asChild>
                <Button
                  variant={currentView === item.view ? 'secondary' : 'ghost'}
                  size={settings.buttonSize === 'default' ? 'sm' : settings.buttonSize === 'large' ? 'default' : 'lg'}
                  onClick={() => setCurrentView(item.view)}
                  className="gap-2"
                >
                  <item.icon className="size-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {hasActiveSession && activeSession && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 hidden sm:flex"
                  onClick={() =>
                    setCurrentView(
                      activeSession.role === 'teacher'
                        ? 'teacher-session'
                        : 'student-session'
                    )
                  }
                >
                  <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
                  Session: {activeSession.code}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Return to active session</TooltipContent>
            </Tooltip>
          )}

          {/* Profile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentView('profile')}
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Profile</TooltipContent>
          </Tooltip>

          {/* Logout */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sign Out</TooltipContent>
          </Tooltip>

          {/* Mobile hamburger menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <BookOpen className="size-5 text-primary" />
                  SilentSpeak
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 mt-4">
                {navItems.map((item) => (
                  <Button
                    key={item.view}
                    variant={currentView === item.view ? 'secondary' : 'ghost'}
                    className="justify-start gap-3"
                    onClick={() => setCurrentView(item.view)}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Button>
                ))}
                {hasActiveSession && activeSession && (
                  <Button
                    variant="outline"
                    className="justify-start gap-3 mt-2"
                    onClick={() =>
                      setCurrentView(
                        activeSession.role === 'teacher'
                          ? 'teacher-session'
                          : 'student-session'
                      )
                    }
                  >
                    <span className="inline-block size-2 rounded-full bg-green-500 animate-pulse" />
                    Session: {activeSession.code}
                  </Button>
                )}
                <div className="border-t my-3" />
                <Button
                  variant="ghost"
                  className="justify-start gap-3"
                  onClick={() => setCurrentView('profile')}
                >
                  <Avatar className="size-5">
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start gap-3 text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────

function Footer() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const settings = useAppStore((s) => s.settings)
  const isFuturistic = settings.uiStyle === 'futuristic'

  const quickLinks = [
    { label: 'Dashboard', view: 'dashboard' as ViewType, icon: LayoutDashboard },
    { label: 'Session', view: 'role-select' as ViewType, icon: GraduationCap },
    { label: 'Notes', view: 'notes' as ViewType, icon: StickyNote },
    { label: 'Pomodoro Timer', view: 'pomodoro' as ViewType, icon: Timer },
    { label: 'Quick Communication', view: 'quick-communication' as ViewType, icon: MessageSquare },
    { label: 'Settings', view: 'settings' as ViewType, icon: Settings },
  ]

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isFuturistic ? <Sparkles className="size-5 text-primary" /> : <BookOpen className="size-5 text-primary" />}
              <span className="font-bold">SilentSpeak</span>
            </div>
            <p className="text-sm text-muted-foreground">
              An accessible learning platform designed for everyone.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => setCurrentView('getting-started')}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                Getting Started
              </button>
              <button
                onClick={() => setCurrentView('accessibility-standards')}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                Accessibility
              </button>
              <button
                onClick={() => setCurrentView('faq')}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                FAQ
              </button>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Quick Links</h3>
            <ul className="space-y-1">
              {quickLinks.map((link) => (
                <li key={link.view}>
                  <button
                    onClick={() => setCurrentView(link.view)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors min-h-[32px]"
                  >
                    <link.icon className="size-3.5" />
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-2">Accessibility</h3>
            <p className="text-sm text-muted-foreground">
              We are committed to ensuring digital accessibility for people with
              disabilities. This platform supports screen readers, color-blind
              modes, dyslexia-friendly fonts, and adjustable UI sizing.
            </p>
          </div>
        </div>
        <div className="border-t mt-6 pt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SilentSpeak. Built with accessibility at the core.
        </div>
      </div>
    </footer>
  )
}

// ─── Floating Back-to-Session Button ─────────────────────────────────────────

function FloatingSessionButton() {
  const hasActiveSession = useAppStore((s) => s.hasActiveSession)
  const activeSession = useAppStore((s) => s.activeSession)
  const currentView = useAppStore((s) => s.currentView)
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  const sessionViews: ViewType[] = ['teacher-session', 'student-session']

  if (!hasActiveSession || !activeSession || sessionViews.includes(currentView)) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-lg gap-2"
            onClick={() =>
              setCurrentView(
                activeSession.role === 'teacher'
                  ? 'teacher-session'
                  : 'student-session'
              )
            }
          >
            <ArrowLeftToLine className="size-4" />
            <span className="hidden sm:inline">Back to Session</span>
            <Badge variant="secondary" className="ml-1">
              {activeSession.code}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Return to active session</TooltipContent>
      </Tooltip>
    </div>
  )
}

// ─── Accessibility Class Manager ─────────────────────────────────────────────

function AccessibilityManager() {
  const settings = useAppStore((s) => s.settings)

  useEffect(() => {
    const root = document.documentElement

    // Theme
    root.classList.remove('dark', 'high-contrast', 'color-blind')
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'high-contrast') {
      root.classList.add('high-contrast')
    } else if (settings.theme === 'color-blind') {
      root.classList.add('color-blind')
    }

    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia')
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(settings.colorBlindMode)
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge')
    root.classList.add(`font-${settings.fontSize}`)

    // Font family
    root.classList.remove('font-default', 'font-dyslexia', 'font-mono')
    root.classList.add(`font-${settings.fontFamily}`)

    // Button size
    root.classList.remove('btn-default', 'btn-large', 'btn-xlarge')
    root.classList.add(`btn-${settings.buttonSize}`)

    // Line height
    root.classList.remove('lh-normal', 'lh-relaxed', 'lh-loose')
    root.classList.add(`lh-${settings.lineHeight || 'normal'}`)

    // Reduce animations
    root.classList.toggle('reduce-animations', settings.reduceAnimations || false)

    // UI style
    root.classList.remove('ui-default', 'ui-futuristic')
    root.classList.add(`ui-${settings.uiStyle || 'default'}`)
  }, [settings])

  return null
}

// ─── Main App Shell ──────────────────────────────────────────────────────────

export function AppShell() {
  const currentView = useAppStore((s) => s.currentView)
  const currentUser = useAppStore((s) => s.currentUser)

  const isAuthView = AUTH_VIEWS.includes(currentView)
  const showNavbar = !isAuthView && currentUser !== null
  const CurrentViewComponent = VIEW_MAP[currentView]

  return (
    <div className="min-h-screen flex flex-col">
      <AccessibilityManager />

      {showNavbar && <Navbar />}

      <main className="flex-1">
        <Suspense fallback={<ViewLoader />}>
          <CurrentViewComponent />
        </Suspense>
      </main>

      {currentView !== 'landing' && <Footer />}

      {showNavbar && <FloatingSessionButton />}
    </div>
  )
}
