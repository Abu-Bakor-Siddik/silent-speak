'use client'

import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import {
  Mic,
  MicOff,
  Copy,
  Download,
  Save,
  Send,
  Trash2,
  CheckCircle,
  Languages,
} from 'lucide-react'

interface TranscriptEntry {
  text: string
  timestamp: number
  isFinal: boolean
}

export function SpeechToTextView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const activeSession = useAppStore((s) => s.activeSession)
  const addCaption = useAppStore((s) => s.addCaption)
  const fullCaptionText = useAppStore((s) => s.fullCaptionText)
  const setFullCaptionText = useAppStore((s) => s.setFullCaptionText)

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [language, setLanguage] = useState('en-US')
  const [entries, setEntries] = useState<TranscriptEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [saving, setSaving] = useState(false)
  const recognitionRef = useRef<any>(null)
  const isListeningRef = useRef(false)

  // Build recognition when language changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return

    // Stop existing recognition if any
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language

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
        const newEntry: TranscriptEntry = { text: final, timestamp: Date.now(), isFinal: true }
        setTranscript((prev) => prev + final)
        setInterimTranscript('')
        setEntries((prev) => [...prev, newEntry])
        if (activeSession) {
          addCaption({ text: final, timestamp: Date.now() })
          setFullCaptionText((prev) => prev + ' ' + final)
        }
      } else {
        setInterimTranscript(interim)
      }
    }

    recognition.onerror = () => {
      setIsListening(false)
      isListeningRef.current = false
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (isListeningRef.current) {
        try {
          recognition.start()
        } catch {
          setIsListening(false)
          isListeningRef.current = false
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    // If we were listening before language change, restart with new language
    if (isListeningRef.current) {
      try {
        recognition.start()
      } catch {}
    }

    return () => {
      try { recognition.stop() } catch {}
    }
    // Deliberately exclude isListening/isListeningRef from deps - we handle restart manually
  }, [language])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      isListeningRef.current = false
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
        isListeningRef.current = true
      } catch {
        // might already be running
      }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    setEntries([])
  }

  const copyToClipboard = () => {
    const textToCopy = transcript + interimTranscript
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadTranscript = () => {
    const content = entries
      .map((e) => `[${new Date(e.timestamp).toLocaleTimeString()}] ${e.text}`)
      .join('\n')
    const fullContent = content || transcript
    if (!fullContent) return
    const blob = new Blob([fullContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sendToSession = () => {
    if (!activeSession || !transcript.trim()) return
    // Send via socket - we just add to captions
    const socket = io('https://silent-speak-tp68.onrender.com/')
    setSending(true)
    socket.emit('caption', {
      sessionCode: activeSession.code,
      text: transcript.trim(),
      timestamp: Date.now(),
    })
    socket.emit('caption-bulk', {
      sessionCode: activeSession.code,
      fullText: fullCaptionText + ' ' + transcript.trim(),
    })
    setSending(false)
    addCaption({ text: transcript.trim(), timestamp: Date.now() })
    setFullCaptionText(fullCaptionText + ' ' + transcript.trim())
  }

  const saveAsNote = async () => {
    if (!currentUser || !transcript.trim()) return
    setSaving(true)
    try {
      await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: `Speech Transcript - ${new Date().toLocaleDateString()}`,
          content: transcript,
          type: 'manual',
        }),
      })
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

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
          <Mic className="size-6" />
          Speech to Text
        </h1>
        <p className="text-muted-foreground">
          Real-time transcription of speech{activeSession ? ' (captions will be sent to session)' : ''}
        </p>
      </div>

      {/* Microphone Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              Microphone
              {isListening && (
                <span className="inline-flex items-center gap-1.5">
                  {/* Animated pulsing waveform indicator */}
                  <span className="flex items-center gap-0.5">
                    <span className="inline-block w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '12px', animationDelay: '0ms' }} />
                    <span className="inline-block w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '18px', animationDelay: '150ms' }} />
                    <span className="inline-block w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '14px', animationDelay: '300ms' }} />
                    <span className="inline-block w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '20px', animationDelay: '450ms' }} />
                    <span className="inline-block w-1 bg-red-500 rounded-full animate-pulse" style={{ height: '10px', animationDelay: '600ms' }} />
                  </span>
                  <span className="text-xs text-red-500 font-medium">Listening</span>
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Languages className="size-4 text-muted-foreground" />
              <Select value={language} onValueChange={(v) => {
                // Stop current recognition
                if (recognitionRef.current) {
                  try { recognitionRef.current.stop() } catch {}
                }
                // isListeningRef stays true so the new recognition will auto-start
                setLanguage(v)
              }}>
                <SelectTrigger className="w-[150px] min-h-[44px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="bn-BD">Bangla</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={toggleListening}
            variant={isListening ? 'destructive' : 'default'}
            size="lg"
            className="gap-2 min-h-[44px]"
          >
            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>
        </CardContent>
      </Card>

      {/* Transcript Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transcript</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="min-h-[200px] max-h-[400px] overflow-y-auto rounded-md border p-3 space-y-2">
            {entries.length > 0 && entries.map((entry, i) => (
              <div key={i} className="text-sm flex gap-2">
                <span className="text-muted-foreground text-xs whitespace-nowrap mt-0.5">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span>{entry.text}</span>
              </div>
            ))}
            {!entries.length && !interimTranscript && (
              <p className="text-muted-foreground text-sm">
                {isListening
                  ? 'Listening... start speaking'
                  : 'Press "Start Listening" to begin transcription'}
              </p>
            )}
            {interimTranscript && (
              <p className="text-sm text-muted-foreground italic">
                {interimTranscript}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 min-h-[44px]"
              onClick={copyToClipboard}
              disabled={!transcript && !interimTranscript}
            >
              {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 min-h-[44px]"
              onClick={downloadTranscript}
              disabled={!transcript}
            >
              <Download className="size-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 min-h-[44px]"
              onClick={saveAsNote}
              disabled={!transcript || saving}
            >
              <Save className="size-4" />
              {saving ? 'Saving...' : 'Save as Note'}
            </Button>
            {activeSession && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 min-h-[44px]"
                onClick={sendToSession}
                disabled={!transcript || sending}
              >
                <Send className="size-4" />
                {sending ? 'Sending...' : 'Send to Session'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 min-h-[44px]"
              onClick={clearTranscript}
              disabled={!transcript && !interimTranscript}
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
