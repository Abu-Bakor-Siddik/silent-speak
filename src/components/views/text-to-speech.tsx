'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { useAppStore } from '@/store/app-store'
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  Ear,
  Trash2,
  Languages,
} from 'lucide-react'

interface VoiceOption {
  voice: SpeechSynthesisVoice
  label: string
  lang: string
}

export function TextToSpeechView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const [text, setText] = useState('')
  const [speaking, setSpeaking] = useState(false)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(1)
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0)
  const [selectedLang, setSelectedLang] = useState('all')

  // Load voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      const voiceOptions: VoiceOption[] = availableVoices.map((v, i) => ({
        voice: v,
        label: `${v.name} (${v.lang})${v.default ? ' ★' : ''}`,
        lang: v.lang,
      }))
      setVoices(voiceOptions)
      // Set default to first English voice
      const defaultIdx = voiceOptions.findIndex((v) => v.lang.startsWith('en'))
      if (defaultIdx >= 0) setSelectedVoiceIndex(defaultIdx)
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const filteredVoices = selectedLang === 'all'
    ? voices
    : voices.filter((v) => {
        if (selectedLang === 'en') return v.lang.startsWith('en')
        if (selectedLang === 'bn') return v.lang.startsWith('bn')
        return true
      })

  const charCount = text.length

  const speak = useCallback((textToSpeak?: string) => {
    const content = textToSpeak || text
    if (!content.trim()) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.rate = rate
    utterance.pitch = pitch
    if (filteredVoices[selectedVoiceIndex]?.voice) {
      utterance.voice = filteredVoices[selectedVoiceIndex].voice
    }
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [text, rate, pitch, filteredVoices, selectedVoiceIndex])

  const stop = () => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  const previewVoice = () => {
    const selectedVoice = filteredVoices[selectedVoiceIndex]
    const lang = selectedVoice?.lang || 'en'
    let sample = 'Hello, this is a preview of the selected voice.'
    if (lang.startsWith('bn')) {
      sample = 'হ্যালো, এটি নির্বাচিত কণ্ঠস্বরের একটি পূর্বরূপ।'
    }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(sample)
    utterance.rate = rate
    utterance.pitch = pitch
    if (selectedVoice?.voice) {
      utterance.voice = selectedVoice.voice
    }
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const setSpeedPreset = (preset: number) => {
    setRate(preset)
  }

  const detectedLang = (() => {
    if (!text.trim()) return 'Unknown'
    const bnRegex = /[\u0980-\u09FF]/
    if (bnRegex.test(text)) return 'Bangla'
    return 'English'
  })()

  return (
    <div className="space-y-8 px-4 sm:px-6 max-w-2xl mx-auto pb-8">
      <div>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <Volume2 className="size-6" />
          Text to Speech
        </h1>
        <p className="text-muted-foreground">Convert text into spoken audio with voice selection</p>
      </div>

      {/* Text Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enter Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Textarea
              placeholder="Type or paste text here to be read aloud..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="pr-20"
            />
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              {text.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setText('')}
                  title="Clear text"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Languages className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">Detected: </span>
              <Badge variant="outline">{detectedLang}</Badge>
            </div>
            <span className="text-muted-foreground">{charCount} characters</span>
          </div>
        </CardContent>
      </Card>

      {/* Voice Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Ear className="size-4" />
            Voice Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm">Language Filter</Label>
              <Select value={selectedLang} onValueChange={(v) => { setSelectedLang(v); setSelectedVoiceIndex(0); }}>
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="bn">Bangla</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Voice</Label>
              <Select
                value={selectedVoiceIndex.toString()}
                onValueChange={(v) => setSelectedVoiceIndex(parseInt(v))}
              >
                <SelectTrigger className="min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredVoices.map((v, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {v.label}
                    </SelectItem>
                  ))}
                  {filteredVoices.length === 0 && (
                    <SelectItem value="-1" disabled>No voices available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 min-h-[44px]"
            onClick={previewVoice}
            disabled={filteredVoices.length === 0 || speaking}
          >
            <Ear className="size-4" />
            Preview Voice
          </Button>
        </CardContent>
      </Card>

      {/* Speed & Pitch Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Speed & Pitch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Speed</Label>
              <span className="text-sm font-medium">{rate.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={rate === 0.5 ? 'default' : 'outline'}
                size="sm"
                className="min-h-[44px] text-xs px-3"
                onClick={() => setSpeedPreset(0.5)}
              >
                Slow
              </Button>
              <Button
                variant={rate === 1 ? 'default' : 'outline'}
                size="sm"
                className="min-h-[44px] text-xs px-3"
                onClick={() => setSpeedPreset(1)}
              >
                Normal
              </Button>
              <Button
                variant={rate === 1.5 ? 'default' : 'outline'}
                size="sm"
                className="min-h-[44px] text-xs px-3"
                onClick={() => setSpeedPreset(1.5)}
              >
                Fast
              </Button>
              <div className="flex-1 ml-2">
                <Slider
                  value={[rate]}
                  onValueChange={([v]) => setRate(v)}
                  min={0.5}
                  max={2}
                  step={0.1}
                />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Pitch</Label>
              <span className="text-sm font-medium">{pitch.toFixed(1)}</span>
            </div>
            <Slider
              value={[pitch]}
              onValueChange={([v]) => setPitch(v)}
              min={0.5}
              max={2}
              step={0.1}
            />
          </div>
        </CardContent>
      </Card>

      {/* Playback Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Button
              onClick={() => speak()}
              disabled={!text.trim() || speaking}
              className="flex-1 gap-2 min-h-[44px]"
            >
              <Play className="size-4" />
              {speaking ? 'Speaking...' : 'Play'}
            </Button>
            <Button
              onClick={stop}
              variant="outline"
              disabled={!speaking}
              className="gap-2 min-h-[44px]"
            >
              <Square className="size-4" />
              Stop
            </Button>
            <Button
              variant="outline"
              onClick={() => setText('')}
              disabled={!text.trim() || speaking}
              className="gap-2 min-h-[44px]"
            >
              <Trash2 className="size-4" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
