"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { Novel, Chapter } from "@/lib/models"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function AdminPage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedNovel, setSelectedNovel] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Novel form state
  const [novelForm, setNovelForm] = useState({
    title: "",
    description: "",
    author: "",
    status: "ongoing" as "ongoing" | "completed" | "hiatus",
    coverImage: "",
  })

  // Chapter form state
  const [chapterForm, setChapterForm] = useState({
    title: "",
    content: "",
    novelSlug: "",
    chapterNumber: "",
  })

  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)

  // Import form state
  const [importForm, setImportForm] = useState({
    url: "",
  })
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    novel?: any
    details?: any
    debug?: any
  } | null>(null)

  const fetchNovels = async () => {
    try {
      const response = await fetch("/api/novels?limit=100")
      const data = await response.json()
      setNovels(data.novels)
    } catch (error) {
      console.error("Error fetching novels:", error)
    }
  }

  const fetchChapters = async (novelSlug: string) => {
    if (!novelSlug) return
    try {
      const response = await fetch(`/api/novels/${novelSlug}?limit=100`)
      const data = await response.json()
      setChapters(data.chapters)
    } catch (error) {
      console.error("Error fetching chapters:", error)
    }
  }

  useEffect(() => {
    fetchNovels()
  }, [])

  useEffect(() => {
    if (selectedNovel) {
      fetchChapters(selectedNovel)
    }
  }, [selectedNovel])

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/novel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novelForm),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Novel created successfully!",
        })
        setNovelForm({
          title: "",
          description: "",
          author: "",
          status: "ongoing",
          coverImage: "",
        })
        fetchNovels()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create novel",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create novel",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...chapterForm,
          chapterNumber: chapterForm.chapterNumber ? Number.parseInt(chapterForm.chapterNumber) : undefined,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Chapter created successfully!",
        })
        setChapterForm({
          title: "",
          content: "",
          novelSlug: "",
          chapterNumber: "",
        })
        fetchNovels()
        if (selectedNovel) {
          fetchChapters(selectedNovel)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create chapter",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chapter",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChapter) return

    setLoading(true)

    try {
      const response = await fetch("/api/admin/chapter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: editingChapter._id,
          title: editingChapter.title,
          content: editingChapter.content,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Chapter updated successfully!",
        })
        setEditingChapter(null)
        if (selectedNovel) {
          fetchChapters(selectedNovel)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update chapter",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chapter",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChapter = async (chapter: Chapter) => {
    if (!confirm("Are you sure you want to delete this chapter?")) return

    setLoading(true)

    try {
      const response = await fetch("/api/admin/chapter", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: chapter._id,
          novelSlug: chapter.novelSlug,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Chapter deleted successfully!",
        })
        fetchNovels()
        if (selectedNovel) {
          fetchChapters(selectedNovel)
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete chapter",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chapter",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImportNovel = async (e: React.FormEvent) => {
    e.preventDefault()
    setImporting(true)
    setImportResult(null)

    try {
      const response = await fetch("/api/admin/import-novel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importForm),
      })

      const result = await response.json()

      if (response.ok) {
        setImportResult({
          success: true,
          message: result.message,
          novel: result.novel,
          details: result.details,
          debug: result.debug,
        })
        setImportForm({ url: "" })
        fetchNovels() // Refresh the novels list
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        setImportResult({
          success: false,
          message: result.error || "Failed to import novel",
          details: result.details,
        })
        toast({
          title: "Error",
          description: result.error || "Failed to import novel",
          variant: "destructive",
        })
      }
    } catch (error) {
      const errorMessage = "Failed to import novel. Please check your connection and try again."
      setImportResult({
        success: false,
        message: errorMessage,
      })
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>
        </div>

        <Tabs defaultValue="novels" className="space-y-6">
          <TabsList>
            <TabsTrigger value="novels">Novels</TabsTrigger>
            <TabsTrigger value="import">Import Novel</TabsTrigger>
            <TabsTrigger value="chapters">Chapters</TabsTrigger>
          </TabsList>

          {/* Novels Tab */}
          <TabsContent value="novels" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Novel</CardTitle>
                <CardDescription>Create a new novel entry</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNovel} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={novelForm.title}
                        onChange={(e) => setNovelForm({ ...novelForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={novelForm.author}
                        onChange={(e) => setNovelForm({ ...novelForm, author: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={novelForm.description}
                      onChange={(e) => setNovelForm({ ...novelForm, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={novelForm.status}
                        onValueChange={(value: "ongoing" | "completed" | "hiatus") =>
                          setNovelForm({ ...novelForm, status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="hiatus">Hiatus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="coverImage">Cover Image URL</Label>
                      <Input
                        id="coverImage"
                        value={novelForm.coverImage}
                        onChange={(e) => setNovelForm({ ...novelForm, coverImage: e.target.value })}
                        placeholder="https://example.com/cover.jpg"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Novel
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Novels List */}
            <Card>
              <CardHeader>
                <CardTitle>Existing Novels ({novels.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {novels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4" />
                    <p>No novels created yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {novels.map((novel) => (
                      <div key={novel._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold">{novel.title}</h3>
                            {novel.imported && (
                              <Badge variant="secondary" className="text-xs">
                                Imported
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {novel.author} • {novel.chapterCount} chapters • {novel.status}
                          </p>
                          {novel.sourceUrl && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Source: {new URL(novel.sourceUrl).hostname}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/novel/${novel.slug}`}>
                            <Button variant="outline" size="sm">
                              View Novel
                            </Button>
                          </Link>
                          {novel.sourceUrl && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(novel.sourceUrl, "_blank")}
                              title="View original source"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Import Novel from External Source</CardTitle>
                <CardDescription>
                  Import novels from Project Gutenberg or other supported sources. The system will automatically parse
                  chapters and create the novel entry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImportNovel} className="space-y-4">
                  <div>
                    <Label htmlFor="importUrl">Source URL *</Label>
                    <Input
                      id="importUrl"
                      type="url"
                      value={importForm.url}
                      onChange={(e) => setImportForm({ ...importForm, url: e.target.value })}
                      placeholder="https://www.gutenberg.org/files/12345/12345-0.txt"
                      required
                      disabled={importing}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Currently supports Project Gutenberg .txt files. Example:
                      https://www.gutenberg.org/files/11/11-0.txt
                    </p>
                  </div>

                  <Button type="submit" disabled={importing || !importForm.url}>
                    {importing ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Importing Novel...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Import Novel
                      </>
                    )}
                  </Button>
                </form>

                {/* Import Result */}
                {importResult && (
                  <div
                    className={`mt-4 p-4 rounded-lg border ${
                      importResult.success
                        ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200"
                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200"
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {importResult.success ? (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{importResult.success ? "Import Successful!" : "Import Failed"}</p>
                        <p className="text-sm mt-1">{importResult.message}</p>

                        {/* Show debug info for successful imports */}
                        {importResult.success && importResult.novel && (
                          <div className="mt-3 text-xs space-y-1">
                            <p>
                              <strong>Novel:</strong> {importResult.novel.title}
                            </p>
                            <p>
                              <strong>Author:</strong> {importResult.novel.author}
                            </p>
                            <p>
                              <strong>Chapters:</strong> {importResult.novel.chapterCount}
                            </p>
                            {importResult.debug && (
                              <>
                                <p>
                                  <strong>Content Length:</strong> {importResult.debug.contentLength.toLocaleString()}{" "}
                                  characters
                                </p>
                                {importResult.debug.chapterTitles && (
                                  <p>
                                    <strong>Sample Chapters:</strong> {importResult.debug.chapterTitles.join(", ")}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        )}

                        {/* Show error details for failed imports */}
                        {!importResult.success && importResult.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer hover:underline">Show technical details</summary>
                            <pre className="text-xs mt-1 p-2 bg-black/10 rounded overflow-auto max-h-32">
                              {importResult.details}
                            </pre>
                          </details>
                        )}

                        {importResult.success && importResult.novel && (
                          <div className="mt-3">
                            <Link href={`/novel/${importResult.novel.slug}`}>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                View Imported Novel
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Import Progress Indicator */}
                {importing && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
                    <div className="flex items-center space-x-3">
                      <LoadingSpinner className="text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Importing novel...</p>
                        <p className="text-xs text-blue-600 dark:text-blue-300">
                          Fetching content, parsing chapters, and saving to database. This may take a few moments.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sample URLs */}
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Sample Project Gutenberg URLs to try:</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Alice's Adventures in Wonderland (Multi-chapter):</strong>
                      <br />
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        https://www.gutenberg.org/files/11/11-0.txt
                      </code>
                    </div>
                    <div>
                      <strong>A Christmas Carol (Single chapter test):</strong>
                      <br />
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        https://www.gutenberg.org/files/46/46-0.txt
                      </code>
                    </div>
                    <div>
                      <strong>Pride and Prejudice (Multi-chapter):</strong>
                      <br />
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        https://www.gutenberg.org/files/1342/1342-0.txt
                      </code>
                    </div>
                    <div>
                      <strong>The Adventures of Sherlock Holmes (Multi-chapter):</strong>
                      <br />
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        https://www.gutenberg.org/files/1661/1661-0.txt
                      </code>
                    </div>
                    <div>
                      <strong>Test with minimal metadata (Edge case):</strong>
                      <br />
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        https://www.gutenberg.org/files/74/74-0.txt
                      </code>
                    </div>
                    <div>
                      <strong>Short story collection (Multiple sections):</strong>
                      <br />
                      <code className="text-xs bg-background px-2 py-1 rounded">
                        https://www.gutenberg.org/files/2701/2701-0.txt
                      </code>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-200">
                      <strong>💡 New Feature:</strong> The system now handles novels with unknown or missing titles by
                      generating unique names automatically. Even if metadata extraction fails, the import will still
                      succeed!
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Tip: If a novel fails to import, try a different URL or check the browser console for detailed
                    error logs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chapters Tab */}
          <TabsContent value="chapters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Chapter</CardTitle>
                <CardDescription>Add a chapter to an existing novel</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateChapter} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="novelSelect">Select Novel *</Label>
                      <Select
                        value={chapterForm.novelSlug}
                        onValueChange={(value) => setChapterForm({ ...chapterForm, novelSlug: value })}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a novel" />
                        </SelectTrigger>
                        <SelectContent>
                          {novels.map((novel) => (
                            <SelectItem key={novel._id} value={novel.slug}>
                              {novel.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="chapterNumber">Chapter Number (optional)</Label>
                      <Input
                        id="chapterNumber"
                        type="number"
                        value={chapterForm.chapterNumber}
                        onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: e.target.value })}
                        placeholder="Auto-generated if empty"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="chapterTitle">Chapter Title *</Label>
                    <Input
                      id="chapterTitle"
                      value={chapterForm.title}
                      onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="chapterContent">Chapter Content *</Label>
                    <Textarea
                      id="chapterContent"
                      value={chapterForm.content}
                      onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                      rows={12}
                      required
                      placeholder="Enter the chapter content here..."
                    />
                  </div>

                  <Button type="submit" disabled={loading || !chapterForm.novelSlug}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chapter
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Chapter Management */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Chapters</CardTitle>
                <CardDescription>Select a novel to view and edit its chapters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Label htmlFor="novelSelectManage">Select Novel</Label>
                  <Select value={selectedNovel} onValueChange={setSelectedNovel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a novel to manage" />
                    </SelectTrigger>
                    <SelectContent>
                      {novels.map((novel) => (
                        <SelectItem key={novel._id} value={novel.slug}>
                          {novel.title} ({novel.chapterCount} chapters)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedNovel && (
                  <div className="space-y-4">
                    {chapters.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No chapters found for this novel</p>
                      </div>
                    ) : (
                      chapters.map((chapter) => (
                        <div key={chapter._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold">
                              Chapter {chapter.chapterNumber}: {chapter.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(chapter.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => setEditingChapter(chapter)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Edit Chapter</DialogTitle>
                                  <DialogDescription>Make changes to the chapter content</DialogDescription>
                                </DialogHeader>
                                {editingChapter && (
                                  <form onSubmit={handleUpdateChapter} className="space-y-4">
                                    <div>
                                      <Label htmlFor="editTitle">Chapter Title</Label>
                                      <Input
                                        id="editTitle"
                                        value={editingChapter.title}
                                        onChange={(e) =>
                                          setEditingChapter({ ...editingChapter, title: e.target.value })
                                        }
                                        required
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="editContent">Chapter Content</Label>
                                      <Textarea
                                        id="editContent"
                                        value={editingChapter.content}
                                        onChange={(e) =>
                                          setEditingChapter({ ...editingChapter, content: e.target.value })
                                        }
                                        rows={12}
                                        required
                                      />
                                    </div>
                                    <DialogFooter>
                                      <Button type="button" variant="outline" onClick={() => setEditingChapter(null)}>
                                        Cancel
                                      </Button>
                                      <Button type="submit" disabled={loading}>
                                        Update Chapter
                                      </Button>
                                    </DialogFooter>
                                  </form>
                                )}
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteChapter(chapter)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
