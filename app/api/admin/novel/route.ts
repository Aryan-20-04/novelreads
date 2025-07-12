import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const body = await request.json()
    const { title, description, coverImage, author, status } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // Check if slug already exists
    const existingNovel = await db.collection("novels").findOne({ slug })
    if (existingNovel) {
      return NextResponse.json({ error: "Novel with this title already exists" }, { status: 400 })
    }

    const novel = {
      title,
      slug,
      description,
      coverImage: coverImage || "/placeholder.svg?height=400&width=300",
      author: author || "Unknown",
      status: status || "ongoing",
      createdAt: new Date(),
      updatedAt: new Date(),
      chapterCount: 0,
    }

    const result = await db.collection("novels").insertOne(novel)

    return NextResponse.json({ success: true, novelId: result.insertedId, slug })
  } catch (error) {
    console.error("Error creating novel:", error)
    return NextResponse.json({ error: "Failed to create novel" }, { status: 500 })
  }
}
