"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, BookOpen, Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Novel } from "@/lib/models"

interface NovelsResponse {
  novels: Novel[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function HomePage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<NovelsResponse["pagination"] | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [bookmarks, setBookmarks] = useState<{ [key: string]: any }>({})

  const fetchNovels = async (page = 1, search = "") => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
      })

      if (search) {
        params.append("search", search)
      }

      const response = await fetch(`/api/novels?${params}`)
      const data: NovelsResponse = await response.json()

      setNovels(data.novels)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching novels:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNovels(currentPage, searchQuery)
  }, [currentPage])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadBookmarks = () => {
        const bookmarkData: { [key: string]: any } = {}
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith("bookmark_")) {
            const novelSlug = key.replace("bookmark_", "")
            try {
              bookmarkData[novelSlug] = JSON.parse(localStorage.getItem(key) || "{}")
            } catch (error) {
              console.error("Error parsing bookmark:", error)
            }
          }
        }
        setBookmarks(bookmarkData)
      }

      loadBookmarks()
    }
  }, [novels])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchNovels(1, searchQuery)
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">Novel Reader</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary">
              Admin
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-sm font-medium hover:text-primary">
                Home
              </Link>
              <Link href="/admin" className="text-sm font-medium hover:text-primary">
                Admin
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="justify-start"
              >
                <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 ml-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                Toggle theme
              </Button>
            </nav>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Light Novel Library</h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
            <Input
              type="text"
              placeholder="Search novels, authors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-muted rounded-t-lg" />
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Continue Reading Section */}
        {Object.keys(bookmarks).length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Continue Reading</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {novels
                .filter((novel) => bookmarks[novel.slug])
                .slice(0, 3)
                .map((novel) => {
                  const bookmark = bookmarks[novel.slug]
                  return (
                    <Card key={`bookmark-${novel._id}`} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="aspect-[3/4] w-16 relative overflow-hidden rounded">
                            <Image
                              src={novel.coverImage || "/placeholder.svg?height=400&width=300"}
                              alt={novel.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{novel.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              Last read: {new Date(bookmark.timestamp).toLocaleDateString()}
                            </p>
                            <Link href={`/novel/${novel.slug}/${bookmark.chapterSlug}`}>
                              <Button size="sm" className="mt-2">
                                Continue Reading
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </div>
        )}

        {/* Novels Grid */}
        {!loading && novels.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {novels.map((novel) => (
                <Link key={novel._id} href={`/novel/${novel.slug}`}>
                  <Card className="h-full hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group">
                    <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg">
                      <Image
                        src={novel.coverImage || "/placeholder.svg?height=400&width=300"}
                        alt={novel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg?height=400&width=300"
                        }}
                      />
                    </div>
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                          {novel.title}
                        </CardTitle>
                        <Badge className={`${getStatusColor(novel.status)} text-white text-xs flex-shrink-0`}>
                          {novel.status}
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-3 text-sm">{novel.description}</CardDescription>
                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                        <span className="truncate">{novel.author}</span>
                        <span className="flex-shrink-0">{novel.chapterCount} chapters</span>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
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

        {/* Empty State */}
        {!loading && novels.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No novels found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search terms" : "No novels have been added yet"}
            </p>
            <Link href="/admin">
              <Button>Add First Novel</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
