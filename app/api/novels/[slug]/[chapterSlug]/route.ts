import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { slug: string; chapterSlug: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const chapter = await db.collection("chapters").findOne({
      novelSlug: params.slug,
      slug: params.chapterSlug,
    })

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }

    const novel = await db.collection("novels").findOne({ slug: params.slug })

    // Get previous and next chapters
    const prevChapter = await db.collection("chapters").findOne(
      {
        novelSlug: params.slug,
        chapterNumber: { $lt: chapter.chapterNumber },
      },
      { sort: { chapterNumber: -1 } },
    )

    const nextChapter = await db.collection("chapters").findOne(
      {
        novelSlug: params.slug,
        chapterNumber: { $gt: chapter.chapterNumber },
      },
      { sort: { chapterNumber: 1 } },
    )

    return NextResponse.json({
      chapter,
      novel,
      navigation: {
        prev: prevChapter,
        next: nextChapter,
      },
    })
  } catch (error) {
    console.error("Error fetching chapter:", error)
    return NextResponse.json({ error: "Failed to fetch chapter" }, { status: 500 })
  }
}
