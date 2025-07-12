interface ScrapedNovel {
  title: string
  author: string
  description: string
  content: string
  sourceUrl: string
}

interface ParsedChapter {
  title: string
  content: string
  chapterNumber: number
}

export async function scrapeFromGutenberg(url: string): Promise<ScrapedNovel> {
  try {
    // Validate URL
    if (!url.includes("gutenberg.org")) {
      throw new Error("Only Project Gutenberg URLs are supported")
    }

    // Fetch the content
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`)
    }

    const content = await response.text()

    // Extract metadata from the text
    const metadata = extractMetadata(content, url)

    // Clean the content
    const cleanedContent = cleanGutenbergText(content)

    return {
      title: metadata.title,
      author: metadata.author,
      description: metadata.description,
      content: cleanedContent,
      sourceUrl: url,
    }
  } catch (error) {
    console.error("Error scraping from Gutenberg:", error)
    throw error
  }
}

function extractMetadata(content: string, url: string) {
  const lines = content.split("\n")
  let title = ""
  let author = ""
  let description = ""

  // Look for title and author in the first 100 lines
  for (let i = 0; i < Math.min(100, lines.length); i++) {
    const line = lines[i].trim()

    // Common patterns for titles in Gutenberg texts
    if (line.match(/^Title:\s*(.+)$/i)) {
      const extractedTitle = line.replace(/^Title:\s*/i, "").trim()
      if (extractedTitle && extractedTitle.length > 2) {
        title = extractedTitle
      }
    } else if (line.match(/^Author:\s*(.+)$/i)) {
      const extractedAuthor = line.replace(/^Author:\s*/i, "").trim()
      if (extractedAuthor && extractedAuthor.length > 2) {
        author = extractedAuthor
      }
    } else if (line.match(/^The Project Gutenberg eBook of\s*(.+?)(?:,|\s*by)/i)) {
      const match = line.match(/^The Project Gutenberg eBook of\s*(.+?)(?:,|\s*by)/i)
      if (match && match[1].trim().length > 2) {
        title = match[1].trim()
      }
    }

    // Try to extract author from "by [Author]" patterns
    if (!author && line.match(/\s+by\s+(.+?)(?:\s|$)/i)) {
      const match = line.match(/\s+by\s+(.+?)(?:\s|$)/i)
      if (match && match[1].trim().length > 2) {
        author = match[1].trim().replace(/[,.]$/, "")
      }
    }
  }

  // Generate fallback title if none found
  if (!title || title.toLowerCase().includes("unknown") || title.length < 3) {
    // Try to extract from URL
    const urlMatch = url.match(/\/files\/(\d+)\//)
    const fileId = urlMatch ? urlMatch[1] : Math.random().toString(36).substring(7)

    // Try to find a meaningful first line or paragraph
    const contentLines = content.split("\n").filter((line) => line.trim().length > 10)
    let firstMeaningfulLine = ""

    for (const line of contentLines.slice(0, 20)) {
      const cleanLine = line.trim()
      // Skip common header patterns
      if (
        !cleanLine.match(
          /^(Project Gutenberg|Copyright|Produced by|Release Date|Language|Character set|START OF|END OF|\*\*\*)/i,
        )
      ) {
        if (cleanLine.length > 10 && cleanLine.length < 100) {
          firstMeaningfulLine = cleanLine
          break
        }
      }
    }

    if (firstMeaningfulLine) {
      title = `${firstMeaningfulLine.substring(0, 50)}${firstMeaningfulLine.length > 50 ? "..." : ""}`
    } else {
      title = `Imported Novel ${fileId}`
    }
  }

  // Generate fallback author if none found
  if (!author || author.toLowerCase().includes("unknown") || author.length < 2) {
    author = "Unknown Author"
  }

  // Clean up title and author
  title = title
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  author = author
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()

  // Generate description
  if (author === "Unknown Author") {
    description = `An imported novel from Project Gutenberg. This digital edition has been formatted for easy reading.`
  } else {
    description = `A work by ${author}. This digital edition is provided by Project Gutenberg and has been formatted for easy reading.`
  }

  console.log("📋 Extracted metadata:", { title, author, description: description.substring(0, 100) + "..." })

  return { title, author, description }
}

function cleanGutenbergText(content: string): string {
  const lines = content.split("\n")
  let startIndex = 0
  let endIndex = lines.length

  // Find the start of the actual content (after the header)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase()
    if (
      line.includes("*** start of") ||
      line.includes("chapter 1") ||
      line.includes("chapter i") ||
      line.match(/^(chapter|part|book)\s+(1|i|one)/i) ||
      line.includes("contents") ||
      (line.length > 50 && !line.includes("gutenberg") && !line.includes("copyright"))
    ) {
      startIndex = i
      break
    }
  }

  // Find the end of the content (before the footer)
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim().toLowerCase()
    if (line.includes("*** end of") || line.includes("end of the project gutenberg")) {
      endIndex = i
      break
    }
  }

  // Extract the main content
  const mainContent = lines.slice(startIndex, endIndex).join("\n")

  // Clean up the text
  return mainContent
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\n{3,}/g, "\n\n") // Reduce multiple line breaks
    .replace(/^\s+|\s+$/g, "") // Trim whitespace
    .replace(/\s+/g, " ") // Normalize spaces
    .replace(/\n\s+/g, "\n") // Remove leading spaces on lines
}

export function parseIntoChapters(content: string, title: string): ParsedChapter[] {
  console.log("🔍 Starting chapter parsing...")
  console.log("📄 Content preview:", content.substring(0, 500))

  const chapters: ParsedChapter[] = []

  // Improved regex patterns for better chapter detection
  const chapterPatterns = [
    // CHAPTER I, CHAPTER II, etc. with optional titles
    /(?:^|\n)\s*(CHAPTER\s+[IVXLCDM]+(?:\.|:|\s).*?)(?=\n\s*CHAPTER\s+[IVXLCDM]+|\n\s*THE\s+END|\n\s*EPILOGUE|\n\s*FINIS|$)/gis,
    // CHAPTER 1, CHAPTER 2, etc. with optional titles
    /(?:^|\n)\s*(CHAPTER\s+\d+(?:\.|:|\s).*?)(?=\n\s*CHAPTER\s+\d+|\n\s*THE\s+END|\n\s*EPILOGUE|\n\s*FINIS|$)/gis,
    // Chapter I, Chapter II, etc. with optional titles
    /(?:^|\n)\s*(Chapter\s+[IVXLCDM]+(?:\.|:|\s).*?)(?=\n\s*Chapter\s+[IVXLCDM]+|\n\s*The\s+End|\n\s*Epilogue|\n\s*Finis|$)/gis,
    // Chapter 1, Chapter 2, etc. with optional titles
    /(?:^|\n)\s*(Chapter\s+\d+(?:\.|:|\s).*?)(?=\n\s*Chapter\s+\d+|\n\s*The\s+End|\n\s*Epilogue|\n\s*Finis|$)/gis,
    // More flexible patterns for numbered sections
    /(?:^|\n)\s*([IVXLCDM]+\.?\s+.*?)(?=\n\s*[IVXLCDM]+\.|\n\s*THE\s+END|\n\s*EPILOGUE|$)/gis,
    /(?:^|\n)\s*(\d+\.?\s+.*?)(?=\n\s*\d+\.|\n\s*THE\s+END|\n\s*EPILOGUE|$)/gis,
    // Story/section breaks
    /(?:^|\n)\s*(.*?)(?=\n\s*\*\s*\*\s*\*|\n\s*---|\n\s*THE\s+END|$)/gis,
  ]

  let matches: RegExpMatchArray[] = []
  let patternUsed = -1

  // Try each pattern until we find chapters
  for (let i = 0; i < chapterPatterns.length; i++) {
    const pattern = chapterPatterns[i]
    matches = Array.from(content.matchAll(pattern))
    console.log(`🔍 Pattern ${i + 1} found ${matches.length} matches`)

    if (matches.length > 1) {
      patternUsed = i
      break
    }
  }

  if (matches.length === 0 || matches.length === 1) {
    console.log("⚠️ No clear chapter divisions found, treating as single chapter")
    // If no chapters found or only one match, treat the entire content as one chapter
    return [
      {
        title: title,
        content: content.trim(),
        chapterNumber: 1,
      },
    ]
  }

  console.log(`✅ Using pattern ${patternUsed + 1}, found ${matches.length} potential chapters`)

  matches.forEach((match, index) => {
    const chapterText = match[1].trim()
    const lines = chapterText.split("\n").filter((line) => line.trim())

    if (lines.length === 0) {
      console.log(`⚠️ Skipping empty chapter ${index + 1}`)
      return
    }

    // Extract chapter title from the first line
    const chapterTitle = lines[0].trim()
    console.log(`📖 Processing: "${chapterTitle}"`)

    // Parse chapter number and title
    let chapterNumber = index + 1
    let cleanTitle = `Chapter ${chapterNumber}`

    // Try to extract chapter number and title
    const chapterMatch = chapterTitle.match(/^(CHAPTER|Chapter)\s+([IVXLCDM]+|\d+)(?:\.|:|\s+)(.*)$/i)

    if (chapterMatch) {
      const [, , numberPart, titlePart] = chapterMatch

      // Convert Roman numerals to numbers if needed
      if (/^[IVXLCDM]+$/i.test(numberPart)) {
        chapterNumber = romanToNumber(numberPart) || index + 1
      } else {
        chapterNumber = Number.parseInt(numberPart) || index + 1
      }

      // Use the extracted title or generate one
      if (titlePart && titlePart.trim()) {
        cleanTitle = `Chapter ${chapterNumber}: ${titlePart.trim()}`
      } else {
        cleanTitle = `Chapter ${chapterNumber}`
      }
    } else {
      // Try simpler patterns
      const simpleMatch = chapterTitle.match(/^([IVXLCDM]+|\d+)\.?\s+(.*)$/i)
      if (simpleMatch) {
        const [, numberPart, titlePart] = simpleMatch
        if (/^[IVXLCDM]+$/i.test(numberPart)) {
          chapterNumber = romanToNumber(numberPart) || index + 1
        } else {
          chapterNumber = Number.parseInt(numberPart) || index + 1
        }
        cleanTitle = titlePart.trim() || `Chapter ${chapterNumber}`
      } else {
        // Use the first line as title if it's reasonable length
        if (chapterTitle.length > 5 && chapterTitle.length < 100) {
          cleanTitle = chapterTitle
        }
      }
    }

    // Extract chapter content (everything after the title)
    const chapterContent = lines.slice(1).join("\n").trim()

    // Include chapters even with minimal content for single-chapter works
    if (chapterContent.length > 10 || matches.length === 1) {
      console.log(`✅ Added chapter: "${cleanTitle}" (${chapterContent.length} chars)`)
      chapters.push({
        title: cleanTitle,
        content: chapterContent,
        chapterNumber: chapterNumber,
      })
    } else {
      console.log(`⚠️ Skipping short chapter: "${cleanTitle}" (${chapterContent.length} chars)`)
    }
  })

  // If we didn't get any valid chapters, return the whole content as one chapter
  if (chapters.length === 0) {
    console.log("⚠️ No valid chapters found, using entire content")
    return [
      {
        title: title,
        content: content.trim(),
        chapterNumber: 1,
      },
    ]
  }

  console.log(`🎉 Successfully parsed ${chapters.length} chapters`)
  return chapters.sort((a, b) => a.chapterNumber - b.chapterNumber)
}

// Helper function to convert Roman numerals to numbers
function romanToNumber(roman: string): number {
  const romanNumerals: { [key: string]: number } = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  }

  let result = 0
  const upperRoman = roman.toUpperCase()

  for (let i = 0; i < upperRoman.length; i++) {
    const current = romanNumerals[upperRoman[i]]
    const next = romanNumerals[upperRoman[i + 1]]

    if (next && current < next) {
      result += next - current
      i++ // Skip next character
    } else {
      result += current
    }
  }

  return result
}
