// Test script to verify the import functionality
const testUrls = [
  {
    name: "Alice's Adventures in Wonderland",
    url: "https://www.gutenberg.org/files/11/11-0.txt",
    expectedChapters: 12,
  },
  {
    name: "Pride and Prejudice",
    url: "https://www.gutenberg.org/files/1342/1342-0.txt",
    expectedChapters: 61,
  },
  {
    name: "The Adventures of Sherlock Holmes",
    url: "https://www.gutenberg.org/files/1661/1661-0.txt",
    expectedChapters: 12,
  },
]

async function testImport(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`)
  console.log(`📖 URL: ${testCase.url}`)

  try {
    const response = await fetch("http://localhost:3000/api/admin/import-novel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: testCase.url }),
    })

    const result = await response.json()

    if (response.ok) {
      console.log(`✅ Success: ${result.message}`)
      console.log(`📚 Chapters imported: ${result.novel.chapterCount}`)
      console.log(`🔗 Novel slug: ${result.novel.slug}`)

      if (result.novel.chapterCount >= testCase.expectedChapters * 0.8) {
        console.log(`✅ Chapter count looks good (expected ~${testCase.expectedChapters})`)
      } else {
        console.log(
          `⚠️  Chapter count lower than expected (got ${result.novel.chapterCount}, expected ~${testCase.expectedChapters})`,
        )
      }
    } else {
      console.log(`❌ Error: ${result.error}`)
    }
  } catch (error) {
    console.log(`❌ Network error: ${error.message}`)
  }
}

async function runTests() {
  console.log("🚀 Starting import tests...")
  console.log("Make sure your Next.js server is running on http://localhost:3000")

  for (const testCase of testUrls) {
    await testImport(testCase)
    // Wait a bit between tests to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 2000))
  }

  console.log("\n🏁 All tests completed!")
}

// Run the tests
runTests().catch(console.error)
