'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/store/app-store'
import {
  Settings,
  Type,
  Palette,
  Monitor,
  Eye,
  Volume2,
  Captions,
  Bell,
  Sparkles,
  MousePointer,
  Accessibility,
} from 'lucide-react'

export function SettingsView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const settings = useAppStore((s) => s.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const currentUser = useAppStore((s) => s.currentUser)
  const isFuturistic = settings.uiStyle === 'futuristic'

  const [saving, setSaving] = useState(false)

  const saveToProfile = async () => {
    if (!currentUser) return
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          theme: settings.theme,
          buttonSize: settings.buttonSize,
          colorBlindMode: settings.colorBlindMode,
        }),
      })
    } catch {
      // error
    } finally {
      setSaving(false)
    }
  }

  const sectionClass = isFuturistic
    ? 'rounded-xl border bg-card/70 backdrop-blur-xl shadow-lg shadow-primary/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300'
    : ''

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
          <Settings className="size-6" />
          Settings
        </h1>
        <p className="text-muted-foreground">Customize your accessibility preferences</p>
      </div>

      {/* UI Style - Most impactful setting, show first */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            UI Style
          </CardTitle>
          <p className="text-xs text-muted-foreground">Choose the visual style for the entire application</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => updateSettings({ uiStyle: 'default' })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                settings.uiStyle === 'default'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <Monitor className="size-6" />
              <span className="text-sm font-medium">Default</span>
              <span className="text-xs text-muted-foreground">Clean & Simple</span>
            </button>
            <button
              onClick={() => updateSettings({ uiStyle: 'futuristic' })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                settings.uiStyle === 'futuristic'
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              }`}
            >
              <Sparkles className="size-6" />
              <span className="text-sm font-medium">Futuristic</span>
              <span className="text-xs text-muted-foreground">Glass & Gradients</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="size-4 text-primary" />
            Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { value: 'light', label: 'Light', icon: '☀️' },
              { value: 'dark', label: 'Dark', icon: '🌙' },
              { value: 'high-contrast', label: 'High Contrast', icon: '🔲' },
              { value: 'color-blind', label: 'Color Blind', icon: '🎨' },
            ] as const).map((theme) => (
              <Button
                key={theme.value}
                variant={settings.theme === theme.value ? 'default' : 'outline'}
                onClick={() => updateSettings({ theme: theme.value })}
              >
                {theme.icon} {theme.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Blind Mode */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            Color Blind Mode
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Adjusts colors to be distinguishable for different types of color vision deficiency.
            {settings.theme !== 'color-blind' && settings.colorBlindMode !== 'none' && (
              <span className="text-amber-600 block mt-1">Tip: Also select the "Color Blind" theme above for best results.</span>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              { value: 'none', label: 'None', desc: 'Normal vision' },
              { value: 'protanopia', label: 'Protanopia', desc: 'Red-blind' },
              { value: 'deuteranopia', label: 'Deuteranopia', desc: 'Green-blind' },
              { value: 'tritanopia', label: 'Tritanopia', desc: 'Blue-blind' },
            ] as const).map((mode) => (
              <button
                key={mode.value}
                onClick={() => {
                  updateSettings({ colorBlindMode: mode.value })
                  // Auto-set color-blind theme when a specific mode is selected
                  if (mode.value !== 'none' && settings.theme !== 'color-blind') {
                    updateSettings({ theme: 'color-blind' })
                  }
                  // Reset to light if turning off color blind
                  if (mode.value === 'none' && settings.theme === 'color-blind') {
                    updateSettings({ theme: 'light' })
                  }
                }}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  settings.colorBlindMode === mode.value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-transparent bg-muted/50 hover:bg-muted'
                }`}
              >
                <span className="text-sm font-medium">{mode.label}</span>
                <span className="text-xs text-muted-foreground">{mode.desc}</span>
              </button>
            ))}
          </div>
          {/* Color preview strip */}
          {settings.colorBlindMode !== 'none' && (
            <div className="mt-3 p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground mb-2">Color preview (how charts appear):</p>
              <div className="flex gap-1">
                {['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'].map((color, i) => (
                  <div
                    key={i}
                    className="flex-1 h-8 rounded"
                    style={{ backgroundColor: color }}
                    title={`Color ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Font Size */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="size-4 text-primary" />
            Font Size
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2">
            {([
              { value: 'small', label: 'Small', sample: '14px' },
              { value: 'medium', label: 'Medium', sample: '16px' },
              { value: 'large', label: 'Large', sample: '18px' },
              { value: 'xlarge', label: 'X-Large', sample: '22px' },
            ] as const).map((size) => (
              <Button
                key={size.value}
                variant={settings.fontSize === size.value ? 'default' : 'outline'}
                onClick={() => updateSettings({ fontSize: size.value })}
              >
                {size.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Sample text at your current size:</p>
          <p className="mt-1 border rounded-lg p-3 bg-muted/30" style={{ fontSize: settings.fontSize === 'small' ? '14px' : settings.fontSize === 'medium' ? '16px' : settings.fontSize === 'large' ? '18px' : '22px' }}>
            The quick brown fox jumps over the lazy dog.
          </p>
        </CardContent>
      </Card>

      {/* Font Family */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Type className="size-4 text-primary" />
            Font Family
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'default', label: 'Default', desc: 'Geist Sans' },
              { value: 'dyslexia', label: 'Dyslexia-Friendly', desc: 'Lexend' },
              { value: 'mono', label: 'Monospace', desc: 'Geist Mono' },
            ] as const).map((family) => (
              <Button
                key={family.value}
                variant={settings.fontFamily === family ? 'default' : 'outline'}
                onClick={() => updateSettings({ fontFamily: family.value })}
              >
                {family.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Size */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MousePointer className="size-4 text-primary" />
            Button & Touch Target Size
          </CardTitle>
          <p className="text-xs text-muted-foreground">Larger buttons are easier to tap on touchscreens</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'default', label: 'Default', minH: '36px' },
              { value: 'large', label: 'Large (44px)', minH: '44px' },
              { value: 'xlarge', label: 'X-Large (52px)', minH: '52px' },
            ] as const).map((size) => (
              <Button
                key={size.value}
                variant={settings.buttonSize === size.value ? 'default' : 'outline'}
                onClick={() => updateSettings({ buttonSize: size.value })}
              >
                {size.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Line Height */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Accessibility className="size-4 text-primary" />
            Line Height
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
              <Button
                key={lh}
                variant={settings.lineHeight === lh ? 'default' : 'outline'}
                onClick={() => updateSettings({ lineHeight: lh })}
              >
                {lh === 'normal' ? 'Normal (1.5)' : lh === 'relaxed' ? 'Relaxed (1.75)' : 'Loose (2.0)'}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Looser line spacing helps with reading difficulties</p>
        </CardContent>
      </Card>

      {/* Auto-scroll */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Captions className="size-4 text-primary" />
            Live Caption Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Auto-scroll</p>
              <p className="text-xs text-muted-foreground">Automatically scroll to latest captions</p>
            </div>
            <Switch
              checked={settings.autoScroll}
              onCheckedChange={(checked) => updateSettings({ autoScroll: checked })}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Caption Font Size</Label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={settings.captionFontSize === size ? 'default' : 'outline'}
                  onClick={() => updateSettings({ captionFontSize: size })}
                >
                  {size === 'small' ? 'Small' : size === 'medium' ? 'Medium' : 'Large'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speech Rate */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Volume2 className="size-4 text-primary" />
            Text-to-Speech Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Speed</span>
            <span className="text-sm font-medium">{settings.speechRate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Slow (0.5x)</span>
            <span>Normal (1.0x)</span>
            <span>Fast (2.0x)</span>
          </div>
        </CardContent>
      </Card>

      {/* Notification Sounds */}
      <Card className={sectionClass}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Notifications & Animations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notification Sounds</p>
              <p className="text-xs text-muted-foreground">Play sounds for messages and alerts</p>
            </div>
            <Switch
              checked={settings.notificationSounds}
              onCheckedChange={(checked) => updateSettings({ notificationSounds: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Reduce Animations</p>
              <p className="text-xs text-muted-foreground">Minimize motion for vestibular disorders</p>
            </div>
            <Switch
              checked={settings.reduceAnimations}
              onCheckedChange={(checked) => updateSettings({ reduceAnimations: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={saveToProfile} disabled={saving} className="w-full min-h-[44px]">
        {saving ? 'Saving...' : 'Save Settings to Profile'}
      </Button>
    </div>
  )
}
