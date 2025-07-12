import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { scrapeFromGutenberg, parseIntoChapters } from "@/lib/scrapers/scrapeFromGutenberg"

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("novel-reader")

    const body = await request.json()
    const { url } = body

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    console.log("🚀 Starting import from:", url)

    // Step 1: Scrape the novel
    let scrapedNovel
    try {
      scrapedNovel = await scrapeFromGutenberg(url)
      console.log("✅ Successfully scraped novel:", scrapedNovel.title)
    } catch (error) {
      console.error("❌ Scraping failed:", error)
      return NextResponse.json(
        {
          error: `Failed to scrape content: ${error.message}`,
        },
        { status: 400 },
      )
    }

    // Step 2: Validate scraped content
    const title = scrapedNovel.title?.trim() || "Untitled Novel"
    const description = scrapedNovel.description?.trim() || "No description available."
    const author = scrapedNovel.author?.trim() || "Unknown Author"

    if (!scrapedNovel.content || scrapedNovel.content.length < 50) {
      return NextResponse.json(
        {
          error: "The scraped content is too short or empty. Please check the URL.",
        },
        { status: 400 },
      )
    }

    console.log("📖 Content length:", scrapedNovel.content.length, "characters")

    // Step 3: Parse chapters
    let chapters
    try {
      chapters = parseIntoChapters(scrapedNovel.content, title)
      console.log("📚 Parsed chapters:", chapters.length)

      if (chapters.length === 0) {
        return NextResponse.json(
          {
            error: "No chapters could be extracted from the content",
          },
          { status: 400 },
        )
      }

      // Log chapter info for debugging
      chapters.forEach((chapter, index) => {
        console.log(`Chapter ${index + 1}: "${chapter.title}" (${chapter.content.length} chars)`)
      })
    } catch (error) {
      console.error("❌ Chapter parsing failed:", error)
      return NextResponse.json(
        {
          error: `Failed to parse chapters: ${error.message}`,
        },
        { status: 400 },
      )
    }

    // Step 4: Create unique slug and handle duplicates
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")

    // If slug is too short or generic, enhance it
    if (baseSlug.length < 3 || baseSlug === "unknown" || baseSlug === "untitled") {
      const urlMatch = url.match(/\/files\/(\d+)\//)
      const fileId = urlMatch ? urlMatch[1] : Math.random().toString(36).substring(7)
      baseSlug = `imported-novel-${fileId}`
    }

    let slug = baseSlug
    let counter = 1

    // Check for existing novels and create unique slug
    while (true) {
      const existingNovel = await db.collection("novels").findOne({ slug })
      if (!existingNovel) {
        break
      }

      console.log(`🔄 Slug "${slug}" already exists, trying variant...`)
      slug = `${baseSlug}-${counter}`
      counter++

      // Prevent infinite loop
      if (counter > 100) {
        slug = `${baseSlug}-${Date.now()}`
        break
      }
    }

    console.log("🔗 Final slug:", slug)

    // Step 5: Create novel document
    const novel = {
      title,
      slug,
      description,
      coverImage: `/placeholder.svg?height=400&width=300&text=${encodeURIComponent(title)}`,
      author,
      status: "completed" as const,
      sourceUrl: scrapedNovel.sourceUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      chapterCount: chapters.length,
      imported: true,
      importedAt: new Date(),
    }

    console.log("💾 Creating novel document...")
    const novelResult = await db.collection("novels").insertOne(novel)
    console.log("✅ Novel created with ID:", novelResult.insertedId)

    // Step 6: Create chapter documents
    const chapterDocuments = chapters.map((chapter, index) => {
      let chapterSlug = chapter.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

      // Ensure chapter slug is not empty
      if (!chapterSlug || chapterSlug.length < 2) {
        chapterSlug = `chapter-${index + 1}`
      }

      return {
        title: chapter.title,
        slug: chapterSlug,
        content: chapter.content,
        novelSlug: slug,
        chapterNumber: chapter.chapterNumber,
        createdAt: new Date(),
        updatedAt: new Date(),
        imported: true,
      }
    })

    console.log("💾 Creating chapter documents...")
    const chaptersResult = await db.collection("chapters").insertMany(chapterDocuments)
    console.log(`✅ Inserted ${chaptersResult.insertedCount} chapters`)

    return NextResponse.json({
      success: true,
      novel: {
        id: novelResult.insertedId,
        slug,
        title,
        author,
        chapterCount: chapters.length,
      },
      message: `Successfully imported "${title}" with ${chapters.length} chapters`,
      debug: {
        originalUrl: url,
        contentLength: scrapedNovel.content.length,
        chaptersFound: chapters.length,
        chapterTitles: chapters.map((c) => c.title).slice(0, 5), // First 5 chapter titles
        slugGenerated: slug,
        titleExtracted: title,
        authorExtracted: author,
      },
    })
  } catch (error) {
    console.error("💥 Unexpected error during import:", error)

    // Return detailed error information
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: `Import failed: ${error.message}`,
          details: error.stack,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "An unexpected error occurred during import",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
