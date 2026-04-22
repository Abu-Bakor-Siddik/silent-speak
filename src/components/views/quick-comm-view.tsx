'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/store/app-store'
import {
  AlertTriangle,
  Volume2,
  Trash2,
  Save,
  Palette,
  Eraser,
  Users,
  Plus,
  X,
  Download,
} from 'lucide-react'

const CATEGORIES = [
  {
    name: 'Responses',
    icon: '💬',
    phrases: [
      '👍 I understand',
      '❓ I have a question',
      '🕐 Can you repeat that?',
      '🔇 Too fast, please slow down',
      '✅ I am ready',
      '🤔 I need help',
      '🙏 Please wait a moment',
      '👋 I am here',
      "❌ I don't understand",
      '💡 I have an idea',
    ],
  },
  {
    name: 'Needs',
    icon: '🤲',
    phrases: [
      '🚻 I need a break',
      '💧 I need water',
      '📖 I need more time to read',
      '🔊 I need it louder',
      '🔉 I need it quieter',
      '🔤 I need larger text',
      '📝 I need to write something down',
    ],
  },
  {
    name: 'Feelings',
    icon: '💚',
    phrases: [
      '😊 I feel good',
      '😰 I feel anxious',
      '😴 I feel tired',
      '😕 I feel confused',
      '😤 I feel frustrated',
      '🎉 I feel excited',
    ],
  },
  {
    name: 'Classroom',
    icon: '🏫',
    phrases: [
      '📚 May I go to the library?',
      '🖥️ Can I use the computer?',
      '📱 I need to charge my device',
      '🚪 May I leave the room?',
      '📖 I forgot my book',
      '✏️ I need a pen',
      '📋 What is the homework?',
      '📅 When is the exam?',
    ],
  },
  {
    name: 'Emergency',
    icon: '🚨',
    phrases: [
      '🆘 I need help NOW!',
      '😤 I can\'t breathe',
      '😰 I\'m having a panic attack',
      '📞 Call someone',
      '😵 I feel dizzy',
      '💊 I need medicine',
    ],
    isEmergency: true,
  },
]

const CANVAS_COLORS = [
  '#000000', '#E53935', '#FB8C00', '#43A047',
  '#1E88E5', '#8E24AA', '#6D4C41', '#546E7A',
]

interface SavedPhrase {
  id: string
  text: string
}

interface Partner {
  id: string
  name: string
}

export function QuickCommView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const activeSession = useAppStore((s) => s.activeSession)
  const [customPhrase, setCustomPhrase] = useState('')
  const [spokenText, setSpokenText] = useState('')
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([])
  const [newCustomSave, setNewCustomSave] = useState('')
  const [canvasColor, setCanvasColor] = useState('#000000')
  const [isDrawing, setIsDrawing] = useState(false)
  const [partners, setPartners] = useState<Partner[]>([
    { id: '1', name: '' },
  ])
  const [showPartners, setShowPartners] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const socketRef = useRef<Socket | null>(null)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  // Load saved phrases from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('silentspeak-custom-phrases')
      if (saved) {
        const parsed = JSON.parse(saved) as SavedPhrase[]
        // Use a timeout to avoid calling setState synchronously in effect
        requestAnimationFrame(() => setSavedPhrases(parsed))
      }
    } catch {}
  }, [])

  // Save to localStorage when savedPhrases changes
  useEffect(() => {
    try {
      localStorage.setItem('silentspeak-custom-phrases', JSON.stringify(savedPhrases))
    } catch {}
  }, [savedPhrases])

  // WebSocket for whiteboard
  useEffect(() => {
    if (!activeSession) return
    const socket = io('https://silent-speak-tp68.onrender.com/')
    socketRef.current = socket

    socket.on('whiteboard', (data: { drawing: string }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
      }
      img.src = data.drawing
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [activeSession])

  // Canvas setup
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Use ResizeObserver for accurate sizing
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, rect.width, rect.height)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 3
    }

    resizeCanvas()

    const observer = new ResizeObserver(() => {
      resizeCanvas()
    })
    observer.observe(canvas)

    return () => observer.disconnect()
  }, [])

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    let clientX: number, clientY: number
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: lastPosRef.current?.x || 0, y: lastPosRef.current?.y || 0 }
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    // Direct CSS pixel coordinates - the ctx.scale(dpr, dpr) handles the rest
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getCanvasPos(e)
    lastPosRef.current = pos
    // Draw a dot at the starting point
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = canvasColor
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, ctx.lineWidth / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const pos = getCanvasPos(e)

    ctx.strokeStyle = canvasColor
    ctx.beginPath()
    ctx.moveTo(lastPosRef.current?.x || pos.x, lastPosRef.current?.y || pos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    lastPosRef.current = pos

    // Send whiteboard data via WebSocket (throttled)
    if (socketRef.current && activeSession) {
      socketRef.current.emit('whiteboard', {
        sessionCode: activeSession.code,
        drawing: canvas.toDataURL(),
      })
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    lastPosRef.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.restore()
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, rect.height)
  }

  const saveWhiteboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    try {
      const saved = JSON.parse(localStorage.getItem('silentspeak-whiteboards') || '[]')
      saved.push({ id: Date.now().toString(), data: dataUrl, createdAt: new Date().toISOString() })
      localStorage.setItem('silentspeak-whiteboards', JSON.stringify(saved))
    } catch {}
  }

  const downloadWhiteboard = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `whiteboard-${new Date().toISOString().slice(0, 10)}.png`
    a.click()
  }

  const speakPhrase = (phrase: string) => {
    window.speechSynthesis.cancel()
    const cleanPhrase = phrase.replace(/[^\w\s.,!?']/g, '').trim()
    if (cleanPhrase) {
      const utterance = new SpeechSynthesisUtterance(cleanPhrase)
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
    setSpokenText(phrase)

    // Also send to session via WebSocket
    if (socketRef.current && activeSession && currentUser) {
      socketRef.current.emit('quick-comm', {
        sessionCode: activeSession.code,
        senderId: currentUser.id,
        senderName: currentUser.nickname || currentUser.name || currentUser.email,
        phrase,
      })
    }
  }

  const speakCustom = () => {
    if (!customPhrase.trim()) return
    speakPhrase(customPhrase.trim())
    setCustomPhrase('')
  }

  const addSavedPhrase = () => {
    if (!newCustomSave.trim()) return
    const newPhrase: SavedPhrase = {
      id: Date.now().toString(),
      text: newCustomSave.trim(),
    }
    setSavedPhrases((prev) => [...prev, newPhrase])
    setNewCustomSave('')
  }

  const removeSavedPhrase = (id: string) => {
    setSavedPhrases((prev) => prev.filter((p) => p.id !== id))
  }

  const addPartner = () => {
    setPartners((prev) => [...prev, { id: Date.now().toString(), name: '' }])
  }

  const removePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id))
  }

  const updatePartnerName = (id: string, name: string) => {
    setPartners((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  return (
    <div className="space-y-8 px-4 sm:px-6 pb-8">
      <div>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to dashboard
        </button>
        <h1 className="text-2xl font-bold mt-2 flex items-center gap-2">
          <Volume2 className="size-6" />
          Quick Communication
        </h1>
        <p className="text-muted-foreground">
          Tap a phrase to speak it aloud{activeSession ? ' and send to session' : ''}
        </p>
      </div>

      {spokenText && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">Last spoken:</p>
            <p className="font-medium text-lg">{spokenText}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="phrases" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="phrases" className="min-h-[44px]">Phrases</TabsTrigger>
          <TabsTrigger value="whiteboard" className="min-h-[44px]">Whiteboard</TabsTrigger>
          <TabsTrigger value="custom" className="min-h-[44px]">Saved</TabsTrigger>
        </TabsList>

        {/* Phrases Tab */}
        <TabsContent value="phrases" className="space-y-4 mt-4">
          {/* Custom phrase input */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Custom Phrase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a custom phrase..."
                  value={customPhrase}
                  onChange={(e) => setCustomPhrase(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && speakCustom()}
                  className="min-h-[44px]"
                />
                <Button onClick={speakCustom} disabled={!customPhrase.trim()} className="gap-1.5 min-h-[44px]">
                  <Volume2 className="size-4" />
                  Speak
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phrase categories */}
          {CATEGORIES.map((category) => (
            <Card key={category.name} className={category.isEmergency ? 'border-red-300 bg-red-50/50' : ''}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-base flex items-center gap-2 ${category.isEmergency ? 'text-red-600' : ''}`}>
                  {category.isEmergency && <AlertTriangle className="size-5" />}
                  {category.icon} {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {category.phrases.map((phrase) => (
                    <Button
                      key={phrase}
                      variant={category.isEmergency ? 'destructive' : 'outline'}
                      className={`h-auto py-3 text-sm whitespace-normal min-h-[44px] ${
                        category.isEmergency ? 'font-semibold' : ''
                      }`}
                      onClick={() => speakPhrase(phrase)}
                    >
                      {phrase}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Whiteboard Tab */}
        <TabsContent value="whiteboard" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="size-4" />
                  Whiteboard
                </CardTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 min-h-[44px]"
                    onClick={saveWhiteboard}
                  >
                    <Save className="size-4" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 min-h-[44px]"
                    onClick={downloadWhiteboard}
                  >
                    <Download className="size-4" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 min-h-[44px]"
                    onClick={clearCanvas}
                  >
                    <Eraser className="size-4" />
                    Clear
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 min-h-[44px]"
                    onClick={() => setShowPartners(!showPartners)}
                  >
                    <Users className="size-4" />
                    Partners ({partners.filter((p) => p.name.trim()).length})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Color picker */}
              <div className="flex items-center gap-2">
                <Label className="text-sm">Color:</Label>
                <div className="flex gap-1.5">
                  {CANVAS_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`size-8 rounded-full border-2 transition-transform ${
                        canvasColor === color ? 'border-primary scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCanvasColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Canvas */}
              <div className="border rounded-lg overflow-hidden bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full touch-none cursor-crosshair"
                  style={{ height: '300px' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Draw on the whiteboard to communicate visually.
                {activeSession ? ' Your drawing is shared with the session in real time.' : ''}
              </p>
            </CardContent>
          </Card>

          {/* Partner Selection */}
          {showPartners && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="size-4" />
                  Communication Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {partners.map((partner, idx) => (
                  <div key={partner.id} className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground w-6">{idx + 1}.</span>
                    <Input
                      placeholder="Partner's name"
                      value={partner.name}
                      onChange={(e) => updatePartnerName(partner.id, e.target.value)}
                      className="min-h-[44px]"
                    />
                    {partners.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={() => removePartner(partner.id)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 min-h-[44px]"
                  onClick={addPartner}
                >
                  <Plus className="size-4" />
                  Add Partner
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Custom/Saved Phrases Tab */}
        <TabsContent value="custom" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Save className="size-4" />
                Saved Phrases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a phrase to save..."
                  value={newCustomSave}
                  onChange={(e) => setNewCustomSave(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSavedPhrase()}
                  className="min-h-[44px]"
                />
                <Button
                  onClick={addSavedPhrase}
                  disabled={!newCustomSave.trim()}
                  className="gap-1.5 min-h-[44px]"
                >
                  <Plus className="size-4" />
                  Save
                </Button>
              </div>

              {savedPhrases.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No saved phrases yet. Add phrases you use frequently for quick access.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedPhrases.map((phrase) => (
                    <div key={phrase.id} className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 h-auto py-3 text-sm whitespace-normal min-h-[44px]"
                        onClick={() => speakPhrase(phrase.text)}
                      >
                        {phrase.text}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-destructive hover:text-destructive shrink-0"
                        onClick={() => removeSavedPhrase(phrase.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
