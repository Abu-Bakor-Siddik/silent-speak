'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { BookOpen, Mic, Volume2, MessageSquare, Timer, Sparkles, Settings, Users, ChevronRight } from 'lucide-react'

export function GettingStartedPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  const steps = [
    {
      icon: Users,
      title: '1. Create Your Account',
      content: 'Sign up with your email and password. During registration, select your accessibility needs such as hearing impairment, speech impairment, color blindness, or dyslexia. SilentSpeak will automatically configure optimal settings for your needs, including dyslexia-friendly fonts, color-blind modes, and adjusted button sizes.',
    },
    {
      icon: Settings,
      title: '2. Configure Your Preferences',
      content: 'Visit Settings to fine-tune your experience. Adjust font size, font family (including dyslexia-friendly options), theme (light/dark/high-contrast/color-blind), button sizes, and color-blind modes. All settings are saved to your profile and persist across sessions.',
    },
    {
      icon: Mic,
      title: '3. Start or Join a Session',
      content: 'Teachers can create live sessions and share the session code with students. Students join by entering the code. Sessions support real-time captioning via speech-to-text, with multi-language support including English and Bangla.',
    },
    {
      icon: Volume2,
      title: '4. Use Live Captions & Communication',
      content: 'During a session, teachers speak and the speech is converted to text in real time. Students see live captions with auto-scroll. Use the Quick Communication board to tap pre-built phrases that are spoken aloud via text-to-speech. The whiteboard allows visual communication through drawing.',
    },
    {
      icon: Sparkles,
      title: '5. Enhance Notes with AI',
      content: 'Raw captions from sessions can be enhanced by AI into well-organized study notes with headers, bullet points, and clear structure. Save enhanced notes, download them, or search and filter your note collection anytime.',
    },
    {
      icon: Timer,
      title: '6. Stay Focused with Pomodoro',
      content: 'Use the built-in Pomodoro timer with customizable work and break intervals. Select teacher-assigned tasks to work on during focus sessions. Track your completed sessions and stay productive throughout your study time.',
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
          <BookOpen className="size-6" />
          Getting Started Guide
        </h1>
        <p className="text-muted-foreground mt-1">Learn how to make the most of SilentSpeak</p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <step.icon className="size-5 text-primary" />
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-8">
        <Button size="lg" onClick={() => setCurrentView('signup')} className="gap-2">
          Get Started Now <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
