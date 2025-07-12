"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, BookOpen, Calendar, User, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Novel, Chapter } from "@/lib/models"

interface NovelResponse {
  novel: Novel
  chapters: Chapter[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function NovelPage() {
  const params = useParams()
  const slug = params.slug as string

  const [data, setData] = useState<NovelResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAllChapters, setShowAllChapters] = useState(false)
  const [bookmark, setBookmark] = useState<{ chapterSlug: string; scrollPosition: number } | null>(null)
  const novel = data?.novel

  useEffect(() => {
    if (typeof window !== "undefined" && novel) {
      const savedBookmark = localStorage.getItem(`bookmark_${novel.slug}`)
      if (savedBookmark) {
        try {
          setBookmark(JSON.parse(savedBookmark))
        } catch (error) {
          console.error("Error parsing bookmark:", error)
        }
      }
    }
  }, [novel])

  const fetchNovelData = async (page = 1) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/novels/${slug}?page=${page}&limit=20`)
      const novelData: NovelResponse = await response.json()
      setData(novelData)
    } catch (error) {
      console.error("Error fetching novel:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (slug) {
      fetchNovelData(currentPage)
    }
  }, [slug, currentPage])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "ongoing":
        return "bg-blue-500"
      case "hiatus":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-6" />
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              <div className="aspect-[3/4] bg-muted rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-20 bg-muted rounded" />
              </div>
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
          <h1 className="text-2xl font-bold">Novel not found</h1>
          <p className="text-muted-foreground">The novel you're looking for doesn't exist or has been removed.</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const { chapters, pagination } = data

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Link>

        {/* Novel Info */}
        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-8">
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
            <Image src={novel.coverImage || "/placeholder.svg"} alt={novel.title} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-3xl font-bold">{novel.title}</h1>
                <Badge className={`${getStatusColor(novel.status)} text-white`}>{novel.status}</Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {novel.author}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {pagination.total} chapters total
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(novel.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground leading-relaxed">{novel.description}</p>
            </div>

            <div className="flex gap-3">
              {chapters.length > 0 && (
                <>
                  <Link href={`/novel/${novel.slug}/${chapters[0].slug}`}>
                    <Button size="lg" className="flex-1 md:flex-none">
                      <Eye className="h-4 w-4 mr-2" />
                      Start Reading
                    </Button>
                  </Link>
                  {bookmark && (
                    <Link href={`/novel/${novel.slug}/${bookmark.chapterSlug}`}>
                      <Button variant="outline" size="lg" className="flex-1 md:flex-none bg-transparent">
                        Continue Reading
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <Card>
          <CardHeader>
            <CardTitle>Chapters</CardTitle>
            <CardDescription>{pagination.total} chapters available</CardDescription>
          </CardHeader>
          <CardContent>
            {chapters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No chapters available yet</div>
            ) : (
              <>
                <div className="space-y-2 mb-6">
                  {(showAllChapters ? chapters : chapters.slice(0, 10)).map((chapter) => (
                    <Link
                      key={chapter._id}
                      href={`/novel/${novel.slug}/${chapter.slug}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            Chapter {chapter.chapterNumber}: {chapter.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(chapter.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {bookmark && bookmark.chapterSlug === chapter.slug && (
                          <Badge variant="secondary" className="text-xs">
                            Bookmarked
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}

                  {chapters.length > 10 && (
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllChapters(!showAllChapters)}
                      className="w-full mt-4"
                    >
                      {showAllChapters ? "Show Less" : `Show More (${chapters.length - 10} more chapters)`}
                    </Button>
                  )}
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const page = i + 1
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                      disabled={currentPage === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
