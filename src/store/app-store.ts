import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
// ─── Types ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  name?: string
  nickname?: string
  avatar?: string
  disability?: string
  semester?: string
  department?: string
  fontSize: string
  fontFamily: string
  theme: string
  buttonSize: string
  colorBlindMode: string
}

export interface Message {
  id?: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  recipientId?: string
  type: string
  createdAt?: string
}

export interface Task {
  id: string
  sessionId: string
  teacherId: string
  title: string
  description?: string
  type: string
  dueDate?: string
  status: string
  createdAt: string
}

export type ViewType =
  | 'landing'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'role-select'
  | 'teacher-session'
  | 'student-session'
  | 'text-to-speech'
  | 'speech-to-text'
  | 'notes'
  | 'pomodoro'
  | 'quick-communication'
  | 'settings'
  | 'profile'
  | 'getting-started'
  | 'accessibility-standards'
  | 'faq'
  | 'forgot-password'

export interface AppSettings {
  fontSize: 'small' | 'medium' | 'large' | 'xlarge'
  fontFamily: 'default' | 'dyslexia' | 'mono'
  theme: 'light' | 'dark' | 'high-contrast' | 'color-blind'
  buttonSize: 'default' | 'large' | 'xlarge'
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  autoScroll: boolean
  speechRate: number
  captionFontSize: 'small' | 'medium' | 'large'
  notificationSounds: boolean
  reduceAnimations: boolean
  lineHeight: 'normal' | 'relaxed' | 'loose'
  uiStyle: 'default' | 'futuristic'
}

export interface ActiveSession {
  code: string
  role: 'teacher' | 'student' | null
  teacherName: string
}

export interface Caption {
  text: string
  timestamp: number
}

export interface Participant {
  studentId: string
  nickname: string
}

// ─── Store Interface ─────────────────────────────────────────────────────────

interface AppState {
  // Auth
  currentUser: User | null
  setCurrentUser: (user: User | null) => void

  // View routing
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  previousView: ViewType | null

  // Session
  activeSession: ActiveSession | null
  setActiveSession: (session: ActiveSession | null) => void

  // Live captions
  captions: Caption[]
  addCaption: (caption: Caption) => void
  clearCaptions: () => void
  fullCaptionText: string
  setFullCaptionText: (text: string) => void

  // Messages
  messages: Message[]
  addMessage: (message: Message) => void
  clearMessages: () => void

  // Settings
  settings: AppSettings
  updateSettings: (settings: Partial<AppSettings>) => void

  // Tasks
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void

  // Session participants
  participants: Participant[]
  addParticipant: (p: Participant) => void
  removeParticipant: (studentId: string) => void

  // Quick navigation for active session
}

// ─── Default Settings ────────────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  fontSize: 'medium',
  fontFamily: 'default',
  theme: 'light',
  buttonSize: 'default',
  colorBlindMode: 'none',
  autoScroll: true,
  speechRate: 1.0,
  captionFontSize: 'medium',
  notificationSounds: true,
  reduceAnimations: false,
  lineHeight: 'normal',
  uiStyle: 'default',
}

// ─── Store ───────────────────────────────────────────────────────────────────



export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
  // Auth
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  // View routing
  currentView: 'landing',
  setCurrentView: (view) =>
    set((state) => ({
      previousView: state.currentView,
      currentView: view,
    })),
  previousView: null,

  // Session
  activeSession: null,
  setActiveSession: (session) =>
    set({
      activeSession: session,
    }),

    resetApp: () => {
      set({
        currentUser: null,
        activeSession: null,
        captions: [],
        messages: [],
        participants: [],
        tasks: [],
        fullCaptionText: '',
      })

      localStorage.removeItem('silent-speak-storage')
    },

  // Live captions
  captions: [],
  addCaption: (caption) =>
    set((state) => ({
      captions: [...state.captions, caption],
    })),
  clearCaptions: () => set({ captions: [] }),
  fullCaptionText: '',
  setFullCaptionText: (text) => set({ fullCaptionText: text }),

  // Messages
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  clearMessages: () => set({ messages: [] }),

  // Settings
  settings: defaultSettings,
  updateSettings: (partial) =>
    set((state) => ({
      settings: { ...state.settings, ...partial },
    })),

  // Tasks
  tasks: [],
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),

  // Session participants
  participants: [],
  addParticipant: (p) =>
    set((state) => ({
      participants: [...state.participants, p],
    })),
  removeParticipant: (studentId) =>
    set((state) => ({
      participants: state.participants.filter(
        (p) => p.studentId !== studentId
      ),
    })),

  // Quick navigation for active session
  
  }),
  {
  name: 'silent-speak-storage',
}
)
)
