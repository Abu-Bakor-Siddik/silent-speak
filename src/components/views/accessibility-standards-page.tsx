'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { Shield, Eye, Ear, Hand, Brain, Palette, Type, Monitor } from 'lucide-react'

export function AccessibilityStandardsPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  const standards = [
    {
      icon: Shield,
      title: 'WCAG 2.1 Level AA Compliance',
      content: 'SilentSpeak is built to meet Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. This ensures the platform is perceivable, operable, understandable, and robust for users with various disabilities. All interactive elements have proper ARIA labels, focus indicators, and keyboard navigation support.',
    },
    {
      icon: Eye,
      title: 'Visual Accessibility',
      content: 'For users with visual impairments and color blindness, SilentSpeak offers multiple color-blind simulation modes (Protanopia, Deuteranopia, Tritanopia) that adjust the entire UI color palette. High-contrast mode provides maximum text visibility. Font sizes are adjustable from small to extra-large, and dyslexia-friendly fonts (Lexend) with increased letter-spacing and line-height are available.',
    },
    {
      icon: Ear,
      title: 'Hearing Accessibility',
      content: 'The core feature of SilentSpeak is real-time live captioning. Teachers\' speech is converted to text instantly, displayed with timestamps and auto-scroll. Captions can be downloaded for later review. AI-enhanced notes transform raw captions into structured study materials. All audio content has text alternatives.',
    },
    {
      icon: Hand,
      title: 'Motor Accessibility',
      content: 'All interactive elements meet the minimum 44x44px touch target size recommended by WCAG. Button sizes can be increased to large or extra-large. The Quick Communication board provides one-tap phrase buttons for users who have difficulty typing. Keyboard shortcuts and tab navigation are supported throughout the platform.',
    },
    {
      icon: Brain,
      title: 'Cognitive Accessibility',
      content: 'Dyslexia-friendly fonts with increased spacing help users with reading difficulties. The clean, uncluttered interface reduces cognitive load. The Pomodoro timer helps with focus and time management. Pre-built communication phrases reduce the cognitive effort needed to compose messages. Simple, consistent navigation patterns are used throughout.',
    },
    {
      icon: Palette,
      title: 'Color-Blind Modes',
      content: 'SilentSpeak supports three types of color-blind simulation and adjustment: Protanopia (red-blind), Deuteranopia (green-blind), and Tritanopia (blue-blind). When enabled, the entire UI color scheme shifts to use distinguishable color combinations. Chart elements use patterns in addition to colors for data distinction. Status indicators use shapes and icons alongside colors.',
    },
    {
      icon: Type,
      title: 'Typography & Readability',
      content: 'Four font size options (Small, Medium, Large, X-Large) ensure readability for all users. Three font families are available: Default (Geist), Dyslexia-Friendly (Lexend with enhanced spacing), and Monospace. Line height and word spacing are increased in dyslexia mode. All text maintains a minimum contrast ratio of 4.5:1.',
    },
    {
      icon: Monitor,
      title: 'Screen Reader Support',
      content: 'All interactive elements have descriptive ARIA labels. Skip-to-content links allow keyboard users to bypass navigation. Form inputs have associated labels. Dynamic content updates are announced to screen readers. Status changes (session started, caption received) use ARIA live regions. The platform uses semantic HTML throughout.',
    },
  ]

  return (
    <div className="space-y-6 px-4 sm:px-6 max-w-4xl mx-auto">
      <div>
        <button
          onClick={() => setCurrentView('landing')}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to home
        </button>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <Shield className="size-6" />
          Accessibility Standards
        </h1>
        <p className="text-muted-foreground mt-1">How SilentSpeak ensures an inclusive experience for all users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {standards.map((standard) => (
          <Card key={standard.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <standard.icon className="size-5 text-primary" />
                {standard.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{standard.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
