"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Moon, Sun, Minus, Plus, BookOpen, Home } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Novel, Chapter } from "@/lib/models"

interface ChapterResponse {
  chapter: Chapter
  novel: Novel
  navigation: {
    prev: Chapter | null
    next: Chapter | null
  }
}

export default function ChapterReaderPage() {
  const params = useParams()
  const slug = params.slug as string
  const chapterSlug = params.chapterSlug as string

  const [data, setData] = useState<ChapterResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.6)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const fetchChapterData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/novels/${slug}/${chapterSlug}`)
        const chapterData: ChapterResponse = await response.json()
        setData(chapterData)
      } catch (error) {
        console.error("Error fetching chapter:", error)
      } finally {
        setLoading(false)
      }
    }

    if (slug && chapterSlug) {
      fetchChapterData()
    }
  }, [slug, chapterSlug])

  // Load reader preferences from localStorage
  useEffect(() => {
    const savedFontSize = localStorage.getItem("reader-font-size")
    const savedLineHeight = localStorage.getItem("reader-line-height")

    if (savedFontSize) setFontSize(Number.parseInt(savedFontSize))
    if (savedLineHeight) setLineHeight(Number.parseFloat(savedLineHeight))
  }, [])

  // Save reader preferences to localStorage
  useEffect(() => {
    localStorage.setItem("reader-font-size", fontSize.toString())
    localStorage.setItem("reader-line-height", lineHeight.toString())
  }, [fontSize, lineHeight])

  // Save bookmark when chapter loads
  useEffect(() => {
    if (data?.novel && data?.chapter) {
      const bookmark = {
        chapterSlug: data.chapter.slug,
        scrollPosition: 0,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(`bookmark_${data.novel.slug}`, JSON.stringify(bookmark))
    }
  }, [data])

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (data?.novel && data?.chapter) {
        const scrollPosition = window.scrollY
        const bookmark = {
          chapterSlug: data.chapter.slug,
          scrollPosition,
          timestamp: new Date().toISOString(),
        }
        localStorage.setItem(`bookmark_${data.novel.slug}`, JSON.stringify(bookmark))
      }
    }

    const debouncedHandleScroll = debounce(handleScroll, 1000)
    window.addEventListener("scroll", debouncedHandleScroll)

    return () => {
      window.removeEventListener("scroll", debouncedHandleScroll)
    }
  }, [data])

  // Restore scroll position on load
  useEffect(() => {
    if (data?.novel && data?.chapter) {
      const savedBookmark = localStorage.getItem(`bookmark_${data.novel.slug}`)
      if (savedBookmark) {
        try {
          const bookmark = JSON.parse(savedBookmark)
          if (bookmark.chapterSlug === data.chapter.slug && bookmark.scrollPosition > 0) {
            setTimeout(() => {
              window.scrollTo(0, bookmark.scrollPosition)
            }, 100)
          }
        } catch (error) {
          console.error("Error restoring scroll position:", error)
        }
      }
    }
  }, [data])

  // Add debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-32" />
            <div className="h-6 bg-muted rounded w-3/4" />
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-4 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!loading && !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Chapter not found</h1>
          <p className="text-muted-foreground">The chapter you're looking for doesn't exist or has been removed.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/">
              <Button variant="outline">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
            </Link>
            {slug && (
              <Link href={`/novel/${slug}`}>
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Novel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  const { chapter, novel, navigation } = data

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <div className="flex items-center space-x-4">
            <Link
              href={`/novel/${novel.slug}`}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Novel
            </Link>
            <div className="hidden md:block">
              <h1 className="font-semibold truncate max-w-md">{novel.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Reader Settings */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Reader Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Font Size: {fontSize}px</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setFontSize(Math.max(12, fontSize - 2))}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="flex-1 text-center text-sm">{fontSize}px</div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Line Height: {lineHeight}</label>
                    <Slider
                      value={[lineHeight]}
                      onValueChange={(value) => setLineHeight(value[0])}
                      max={2.0}
                      min={1.2}
                      step={0.1}
                    />
                  </div>
                </div>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  Toggle Theme
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Chapter Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">
                Chapter {chapter.chapterNumber}: {chapter.title}
              </h1>
              <p className="text-sm text-muted-foreground">{new Date(chapter.createdAt).toLocaleDateString()}</p>
            </div>

            <div
              className="prose prose-gray dark:prose-invert max-w-none"
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: lineHeight,
              }}
            >
              {chapter.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {navigation.prev ? (
            <Link href={`/novel/${novel.slug}/${navigation.prev.slug}`}>
              <Button variant="outline" className="flex items-center bg-transparent">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {navigation.next ? (
            <Link href={`/novel/${novel.slug}/${navigation.next.slug}`}>
              <Button className="flex items-center">
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>
    </div>
  )
}
