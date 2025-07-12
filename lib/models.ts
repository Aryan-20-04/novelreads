export interface Novel {
  _id?: string
  title: string
  slug: string
  description: string
  coverImage: string
  author?: string
  status: "ongoing" | "completed" | "hiatus"
  createdAt: Date
  updatedAt: Date
  chapterCount: number
}

export interface Chapter {
  _id?: string
  title: string
  slug: string
  content: string
  novelSlug: string
  chapterNumber: number
  createdAt: Date
  updatedAt: Date
}

export interface NovelWithChapters extends Novel {
  chapters: Chapter[]
}
