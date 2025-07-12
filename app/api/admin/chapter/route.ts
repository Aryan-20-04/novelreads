import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const body = await request.json()
    const { title, content, novelSlug, chapterNumber } = body

    if (!title || !content || !novelSlug) {
      return NextResponse.json({ error: "Title, content, and novel slug are required" }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if novel exists
    const novel = await db.collection("novels").findOne({ slug: novelSlug })
    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 })
    }

    // Get next chapter number if not provided
    let nextChapterNumber = chapterNumber
    if (!nextChapterNumber) {
      const lastChapter = await db.collection("chapters").findOne({ novelSlug }, { sort: { chapterNumber: -1 } })
      nextChapterNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1
    }

    const chapter = {
      title,
      slug,
      content,
      novelSlug,
      chapterNumber: nextChapterNumber,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("chapters").insertOne(chapter)

    // Update novel's chapter count and updated date
    await db.collection("novels").updateOne(
      { slug: novelSlug },
      {
        $inc: { chapterCount: 1 },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({ success: true, chapterId: result.insertedId, slug })
  } catch (error) {
    console.error("Error creating chapter:", error)
    return NextResponse.json({ error: "Failed to create chapter" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const body = await request.json()
    const { _id, title, content } = body

    if (!_id || !title || !content) {
      return NextResponse.json({ error: "ID, title, and content are required" }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    const result = await db.collection("chapters").updateOne(
      { _id: _id },
      {
        $set: {
          title,
          slug,
          content,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chapter:", error)
    return NextResponse.json({ error: "Failed to update chapter" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const body = await request.json()
    const { _id, novelSlug } = body

    if (!_id || !novelSlug) {
      return NextResponse.json({ error: "Chapter ID and novel slug are required" }, { status: 400 })
    }

    const result = await db.collection("chapters").deleteOne({ _id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
    }

    // Update novel's chapter count
    await db.collection("novels").updateOne(
      { slug: novelSlug },
      {
        $inc: { chapterCount: -1 },
        $set: { updatedAt: new Date() },
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chapter:", error)
    return NextResponse.json({ error: "Failed to delete chapter" }, { status: 500 })
  }
}
