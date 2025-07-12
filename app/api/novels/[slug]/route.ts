import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const novel = await db.collection("novels").findOne({ slug: params.slug })

    if (!novel) {
      return NextResponse.json({ error: "Novel not found" }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    const chapters = await db
      .collection("chapters")
      .find({ novelSlug: params.slug })
      .sort({ chapterNumber: 1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const totalChapters = await db.collection("chapters").countDocuments({ novelSlug: params.slug })

    return NextResponse.json({
      novel,
      chapters,
      pagination: {
        page,
        limit,
        total: totalChapters,
        pages: Math.ceil(totalChapters / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching novel:", error)
    return NextResponse.json({ error: "Failed to fetch novel" }, { status: 500 })
  }
}
