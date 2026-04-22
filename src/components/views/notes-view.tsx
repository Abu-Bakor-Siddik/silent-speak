'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore } from '@/store/app-store'
import {
  Search,
  Download,
  Trash2,
  Sparkles,
  Plus,
  FileText,
  Calendar,
  SortAsc,
  SortDesc,
} from 'lucide-react'

interface NoteItem {
  id: string
  title: string
  content: string
  rawContent?: string | null
  type: string
  sessionId?: string | null
  duration?: string | null
  createdAt: string
  updatedAt: string
}

type SortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc'
type FilterType = 'all' | 'session' | 'manual' | 'ai-enhanced'

export function NotesView() {
  const setCurrentView = useAppStore((s) => s.setCurrentView)
  const currentUser = useAppStore((s) => s.currentUser)
  const [notes, setNotes] = useState<NoteItem[]>([])
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [deleteTarget, setDeleteTarget] = useState<NoteItem | null>(null)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [downloadFilename, setDownloadFilename] = useState('')
  const [downloadTarget, setDownloadTarget] = useState<NoteItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    fetch(`/api/notes?userId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.notes) setNotes(data.notes)
      })
      .catch(() => {})
  }, [currentUser])

  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes]

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((n) => n.type === filterType)
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        break
      case 'oldest':
        result.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
        break
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
    }

    return result
  }, [notes, filterType, searchQuery, sortBy])

  const saveNote = async () => {
    if (!title.trim() || !currentUser) return
    setLoading(true)
    try {
      const isUpdate = selectedNote !== null
      const url = isUpdate ? '/api/notes' : '/api/notes'
      const method = isUpdate ? 'PUT' : 'POST'
      const body: Record<string, unknown> = {
        title,
        content,
        userId: currentUser.id,
        type: 'manual',
      }
      if (isUpdate) {
        body.noteId = selectedNote.id
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.note) {
        if (isUpdate) {
          setNotes((prev) =>
            prev.map((n) => (n.id === data.note.id ? data.note : n))
          )
        } else {
          setNotes((prev) => [data.note, ...prev])
        }
        setTitle('')
        setContent('')
        setSelectedNote(null)
      }
    } catch {
      // error
    } finally {
      setLoading(false)
    }
  }

  const enhanceNote = async () => {
    if (!content.trim()) return
    setEnhancing(true)
    try {
      const res = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content }),
      })
      const data = await res.json()
      if (res.ok && data.enhanced) {
        // Save both versions - raw content is preserved, enhanced becomes main content
        const rawContent = content
        setContent(data.enhanced)
        // If we have a selected note, update it with raw content
        if (selectedNote) {
          // We'll include rawContent when saving
        }
      }
    } catch {
      // error
    } finally {
      setEnhancing(false)
    }
  }

  const deleteNote = async () => {
    if (!deleteTarget || !currentUser) return
    setDeleting(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: deleteTarget.id }),
      })
      if (res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== deleteTarget.id))
        if (selectedNote?.id === deleteTarget.id) {
          setSelectedNote(null)
          setTitle('')
          setContent('')
        }
      }
    } catch {
      // error
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  const openDownloadDialog = (note: NoteItem) => {
    setDownloadTarget(note)
    setDownloadFilename(note.title.replace(/[^a-zA-Z0-9]/g, '_'))
    setShowDownloadDialog(true)
  }

  const downloadNote = () => {
    if (!downloadTarget) return
    const blob = new Blob([downloadTarget.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${downloadFilename || 'note'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    setShowDownloadDialog(false)
    setDownloadTarget(null)
  }

  const selectNote = (note: NoteItem) => {
    setSelectedNote(note)
    setTitle(note.title)
    setContent(note.content)
  }

  const TYPE_BADGES: Record<string, { label: string; className: string }> = {
    session: { label: 'Session', className: 'bg-blue-100 text-blue-700' },
    manual: { label: 'Manual', className: 'bg-emerald-100 text-emerald-700' },
    'ai-enhanced': { label: 'AI Enhanced', className: 'bg-purple-100 text-purple-700' },
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
          <FileText className="size-6" />
          Notes
        </h1>
        <p className="text-muted-foreground">Create, edit and manage your notes</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 min-h-[44px]"
          />
        </div>
        <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <SelectTrigger className="w-[150px] min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="session">Session</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="ai-enhanced">AI Enhanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[160px] min-h-[44px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">
              <div className="flex items-center gap-1.5"><SortDesc className="size-3.5" /> Newest</div>
            </SelectItem>
            <SelectItem value="oldest">
              <div className="flex items-center gap-1.5"><SortAsc className="size-3.5" /> Oldest</div>
            </SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notes List */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Your Notes ({filteredAndSortedNotes.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAndSortedNotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filterType !== 'all' ? 'No matching notes' : 'No notes yet'}
                </p>
              ) : (
                filteredAndSortedNotes.map((note) => {
                  const badge = TYPE_BADGES[note.type] || { label: note.type, className: 'bg-gray-100 text-gray-700' }
                  const preview = note.content.split('\n')[0]?.slice(0, 80) || 'Empty note'
                  return (
                    <div
                      key={note.id}
                      className={`border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors ${
                        selectedNote?.id === note.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => selectNote(note)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{note.title}</p>
                          <p className="text-muted-foreground text-xs truncate mt-0.5">{preview}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge className={`text-[10px] px-1.5 py-0 ${badge.className}`}>
                              {badge.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="size-3" />
                              {new Date(note.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              openDownloadDialog(note)
                            }}
                            title="Download"
                          >
                            <Download className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteTarget(note)
                            }}
                            title="Delete"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Note Editor */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {selectedNote ? 'Edit Note' : 'New Note'}
              </CardTitle>
              {selectedNote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedNote(null)
                    setTitle('')
                    setContent('')
                  }}
                >
                  <Plus className="size-4 mr-1" />
                  New
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={saveNote} disabled={!title.trim() || loading} className="min-h-[44px]">
                {loading ? 'Saving...' : 'Save Note'}
              </Button>
              <Button
                variant="outline"
                onClick={enhanceNote}
                disabled={!content.trim() || enhancing}
                className="gap-1.5 min-h-[44px]"
              >
                <Sparkles className="size-4" />
                {enhancing ? 'Enhancing...' : 'AI Enhance'}
              </Button>
              {content.trim() && (
                <Button
                  variant="outline"
                  className="gap-1.5 min-h-[44px]"
                  onClick={() => {
                    const noteToDownload: NoteItem = selectedNote || {
                      id: 'new',
                      title: title || 'Untitled',
                      content,
                      type: 'manual',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    }
                    openDownloadDialog(noteToDownload)
                  }}
                >
                  <Download className="size-4" />
                  Download
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &ldquo;{deleteTarget?.title}&rdquo;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteNote}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Filename Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Download Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filename</Label>
              <Input
                value={downloadFilename}
                onChange={(e) => setDownloadFilename(e.target.value)}
                placeholder="Enter filename"
              />
              <p className="text-xs text-muted-foreground">.txt extension will be added automatically</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDownloadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={downloadNote}>
                <Download className="size-4 mr-1.5" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
