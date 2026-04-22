'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useAppStore } from '@/store/app-store'
import { HelpCircle, MessageSquare } from 'lucide-react'

export function FAQPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  const faqs = [
    {
      q: 'How do I create a live session as a teacher?',
      a: 'After signing in, go to "Join / Create Session" from the dashboard. Select "I\'m a Teacher" and click "Create New Session". A unique 6-character session code will be generated. Share this code with your students so they can join. You can then turn on your microphone to start live captioning, assign tasks, and send messages to the class.',
    },
    {
      q: 'How do I join a session as a student?',
      a: 'After signing in, go to "Join / Create Session" from the dashboard. Select "I\'m a Student" and enter the session code provided by your teacher. You\'ll see live captions in real time, can send messages, use quick communication phrases, and save notes from the session.',
    },
    {
      q: 'What languages does the speech-to-text support?',
      a: 'SilentSpeak currently supports English (US), English (UK), and Bangla (Bangladesh) for speech recognition. You can switch languages during a session using the language selector. The system uses your browser\'s built-in Web Speech API for real-time transcription.',
    },
    {
      q: 'How does the Quick Communication board work?',
      a: 'The Quick Communication board provides pre-built phrases organized into categories: Responses, Needs, Feelings, Classroom, and Emergency. Simply tap a phrase and it will be spoken aloud using text-to-speech on your device AND sent to the session chat. You can also save custom phrases for quick access and draw on the shared whiteboard.',
    },
    {
      q: 'What are AI-Enhanced Notes?',
      a: 'During a session, raw captions are captured in real time. You can click "AI Enhance" to have an AI model reformat these raw captions into well-organized study notes with headers, bullet points, and clear structure. This is especially helpful for students who may have difficulty taking notes while following along with captions.',
    },
    {
      q: 'How do color-blind modes work?',
      a: 'SilentSpeak offers three color-blind modes: Protanopia (red-blind), Deuteranopia (green-blind), and Tritanopia (blue-blind). When enabled, the entire UI adjusts its color scheme to use distinguishable color combinations. You can enable these from Settings > Color Blind Mode. Changes apply immediately and are saved to your profile.',
    },
    {
      q: 'Can I use the platform without a session?',
      a: 'Yes! You can use Text-to-Speech, Speech-to-Text, Notes, Pomodoro Timer, and Quick Communication tools independently, without being in an active session. These tools are available from the dashboard at any time.',
    },
    {
      q: 'How do I change my accessibility settings?',
      a: 'Go to Settings from the navigation bar. You can adjust font size, font family (including dyslexia-friendly fonts), theme (light/dark/high-contrast/color-blind), button size, and color-blind mode. All changes are applied immediately and saved to your profile when you click "Save Settings to Profile".',
    },
    {
      q: 'Is my data private and secure?',
      a: 'Yes. SilentSpeak stores your account information and notes locally. Session data is only retained during active sessions. Your accessibility preferences are saved to your profile. We follow best practices for data security and do not share your information with third parties.',
    },
    {
      q: 'What if I accidentally leave an active session?',
      a: 'If you have an active session and navigate away, a floating "Back to Session" button will appear in the bottom-right corner. You can also see your active session in the navbar and dashboard. Simply click to rejoin without losing any captions or messages.',
    },
    {
      q: 'How does the Pomodoro timer integrate with tasks?',
      a: 'When a teacher assigns tasks during a session, they appear in your Pomodoro timer\'s task list. You can select a task to focus on during your Pomodoro work session. When you complete a focus session, you can mark the task as complete. Custom work and break durations are also available.',
    },
    {
      q: 'Can I download my captions and notes?',
      a: 'Yes. During a session, both teachers and students can download captions as a text file with timestamps. Notes can be downloaded from the Notes page. AI-enhanced notes can also be saved and downloaded. All downloads are in plain text format for maximum compatibility.',
    },
  ]

  return (
    <div className="space-y-6 px-4 sm:px-6 max-w-3xl mx-auto">
      <div>
        <button
          onClick={() => setCurrentView('landing')}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to home
        </button>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <HelpCircle className="size-6" />
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mt-1">Find answers to common questions about SilentSpeak</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-sm font-medium min-h-[44px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
