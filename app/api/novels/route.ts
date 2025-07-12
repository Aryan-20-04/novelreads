import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const skip = (page - 1) * limit

    let query = {}
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { author: { $regex: search, $options: "i" } },
        ],
      }
    }

    const novels = await db.collection("novels").find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).toArray()

    const total = await db.collection("novels").countDocuments(query)

    return NextResponse.json({
      novels,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching novels:", error)
    return NextResponse.json({ error: "Failed to fetch novels" }, { status: 500 })
  }
}
