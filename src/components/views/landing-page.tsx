'use client'

import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import {
  Mic,
  Volume2,
  MessageSquare,
  Timer,
  Sparkles,
  Accessibility,
  ArrowRight,
  Users,
  BookOpen,
  Shield,
  ChevronRight,
} from 'lucide-react'

export function LandingPage() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)

  // Animated gradient background
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    let frame: number
    let offset = 0
    const animate = () => {
      offset += 0.3
      el.style.background = `linear-gradient(${135 + Math.sin(offset * 0.01) * 20}deg, 
        hsl(${210 + Math.sin(offset * 0.008) * 15}, 70%, 95%), 
        hsl(${260 + Math.cos(offset * 0.006) * 20}, 60%, 92%), 
        hsl(${320 + Math.sin(offset * 0.01) * 15}, 50%, 94%))`
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  const features = [
    {
      icon: Mic,
      title: 'Live Captions',
      desc: 'Real-time speech-to-text captions during class sessions. Never miss a word the teacher says.',
      color: 'text-rose-500',
      bg: 'bg-rose-50',
    },
    {
      icon: Volume2,
      title: 'Text-to-Speech & Speech-to-Text',
      desc: 'Convert written text into spoken audio and vice versa. Supports multiple languages including Bangla.',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      icon: MessageSquare,
      title: 'Quick Communication',
      desc: 'Pre-built phrases, whiteboard drawing, and text-to-speech for speech-impaired students to communicate instantly.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      icon: Timer,
      title: 'Pomodoro Focus Timer',
      desc: 'Stay focused with customizable work/break intervals. Integrates with teacher-assigned tasks.',
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      icon: Sparkles,
      title: 'AI-Enhanced Notes',
      desc: 'AI automatically reformats raw captions into well-organized study notes with headers and bullet points.',
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      icon: Accessibility,
      title: 'Accessible Design',
      desc: 'Color-blind modes, dyslexia-friendly fonts, adjustable sizing, high-contrast themes, and large touch targets.',
      color: 'text-teal-600',
      bg: 'bg-teal-50',
    },
  ]

  const steps = [
    {
      num: '01',
      title: 'Sign Up',
      desc: 'Create your account and tell us about your accessibility needs. We customize the experience for you.',
      icon: Users,
    },
    {
      num: '02',
      title: 'Choose Your Role',
      desc: 'Join as a teacher to create live sessions, or as a student to join and participate in class.',
      icon: BookOpen,
    },
    {
      num: '03',
      title: 'Start Learning',
      desc: 'Enjoy real-time captions, AI notes, quick communication tools, and a fully accessible classroom experience.',
      icon: Shield,
    },
  ]

  const testimonials = [
    {
      quote: 'As a hearing-impaired student, the live captions have transformed my classroom experience. I can finally follow every lecture in real time.',
      name: 'Ayesha R.',
      role: 'Student, Visual Communication',
    },
    {
      quote: 'The quick communication tool gave my non-verbal students a voice in class. They can express themselves instantly with pre-built phrases.',
      name: 'Dr. Kamal H.',
      role: 'Special Education Teacher',
    },
    {
      quote: 'The dyslexia-friendly font and color-blind mode make this the first platform where I feel truly included. No more struggling to read content.',
      name: 'Rafi M.',
      role: 'Student, Computer Science',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section ref={heroRef} className="relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] gap-6 px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-4 py-1.5 text-sm">
            <Accessibility className="size-4 text-primary" />
            <span>Accessible Learning for Everyone</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
            Learn Without{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Barriers
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            SilentSpeak is an accessible learning platform designed for everyone.
            Real-time captions, text-to-speech, quick communication, AI-enhanced
            notes — all built with accessibility at the core.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <Button
              size="lg"
              className="text-lg px-8 py-6 gap-2 min-h-[44px]"
              onClick={() => setCurrentView('login')}
            >
              Launch App
              <ArrowRight className="size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 min-h-[44px]"
              onClick={() => setCurrentView('signup')}
            >
              Create Account
            </Button>
          </div>

          <div className="flex items-center gap-6 mt-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="size-4" />
              WCAG 2.1 Compliant
            </div>
            <div className="flex items-center gap-1.5">
              <Accessibility className="size-4" />
              Multi-Disability Support
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Users className="size-4" />
              Real-time Collaboration
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 size-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 size-80 rounded-full bg-purple-500/5 blur-3xl" />
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Powerful tools designed with accessibility-first principles to ensure
              every student can learn effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="group transition-all hover:shadow-lg hover:-translate-y-1 border-transparent hover:border-primary/20"
              >
                <CardContent className="p-6 space-y-4">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bg}`}>
                    <feature.icon className={`size-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              How It Works
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={step.num} className="relative text-center">
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
                )}
                <div className="inline-flex items-center justify-center size-24 rounded-2xl bg-primary/10 mb-4">
                  <step.icon className="size-10 text-primary" />
                </div>
                <div className="text-xs font-bold text-primary mb-2">
                  STEP {step.num}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Voices That Matter
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Real stories from students and teachers who benefit from accessible learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="bg-background">
                <CardContent className="p-6 space-y-4">
                  <p className="text-sm leading-relaxed italic text-foreground/80">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="border-t pt-3">
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to Learn Without Barriers?
          </h2>
          <p className="text-muted-foreground text-lg">
            Join SilentSpeak today and experience an inclusive classroom designed
            for every learner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 gap-2 min-h-[44px]"
              onClick={() => setCurrentView('signup')}
            >
              Get Started Free
              <ChevronRight className="size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 min-h-[44px]"
              onClick={() => setCurrentView('login')}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="size-5 text-primary" />
                <span className="font-bold text-lg">SilentSpeak</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An accessible learning platform designed for everyone. Built with
                accessibility at the core.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">
                <button
                  type="button"
                  className="hover:underline"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Features
                </button>
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button type="button" className="hover:underline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Live Captions</button></li>
                <li><button type="button" className="hover:underline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Text-to-Speech</button></li>
                <li><button type="button" className="hover:underline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Quick Communication</button></li>
                <li><button type="button" className="hover:underline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>AI-Enhanced Notes</button></li>
                <li><button type="button" className="hover:underline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Pomodoro Timer</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Accessibility</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Color-Blind Modes</li>
                <li>Dyslexia-Friendly Fonts</li>
                <li>Adjustable Sizing</li>
                <li>High-Contrast Themes</li>
                <li>Screen Reader Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button type="button" className="hover:underline" onClick={() => setCurrentView('getting-started')}>Getting Started Guide</button></li>
                <li><button type="button" className="hover:underline" onClick={() => setCurrentView('accessibility-standards')}>Accessibility Standards</button></li>
                <li><button type="button" className="hover:underline" onClick={() => setCurrentView('faq')}>FAQ</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SilentSpeak. Built with accessibility at the core.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>WCAG 2.1 AA</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
