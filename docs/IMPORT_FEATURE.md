# Novel Import Feature

This feature allows administrators to import novels from external sources, particularly Project Gutenberg, directly into the novel reader application.

## Features

- **Automatic Content Scraping**: Fetches novel content from Project Gutenberg URLs
- **Intelligent Chapter Parsing**: Automatically detects and splits content into chapters
- **Metadata Extraction**: Extracts title, author, and generates descriptions
- **Progress Tracking**: Shows import progress with loading indicators
- **Error Handling**: Comprehensive error messages for various failure scenarios
- **Source Attribution**: Maintains links to original sources

## Supported Sources

### Project Gutenberg
- **Format**: Plain text (.txt) files
- **URL Pattern**: `https://www.gutenberg.org/files/[ID]/[ID]-0.txt`
- **Features**: Automatic chapter detection, metadata extraction

### Sample URLs to Test

1. **Alice's Adventures in Wonderland**
   \`\`\`
   https://www.gutenberg.org/files/11/11-0.txt
   \`\`\`

2. **Pride and Prejudice**
   \`\`\`
   https://www.gutenberg.org/files/1342/1342-0.txt
   \`\`\`

3. **The Adventures of Sherlock Holmes**
   \`\`\`
   https://www.gutenberg.org/files/1661/1661-0.txt
   \`\`\`

## How It Works

### 1. Content Scraping
- Fetches the raw text content from the provided URL
- Validates that the URL is from a supported source
- Handles network errors and invalid responses

### 2. Metadata Extraction
- Searches for title and author information in the text header
- Generates appropriate descriptions for imported novels
- Creates URL-friendly slugs for database storage

### 3. Content Cleaning
- Removes Project Gutenberg headers and footers
- Normalizes line endings and spacing
- Preserves paragraph structure

### 4. Chapter Parsing
- Uses multiple regex patterns to detect chapter boundaries
- Supports various chapter numbering formats (Roman numerals, Arabic numbers)
- Handles both "CHAPTER" and "Chapter" formatting
- Falls back to single chapter if no divisions are found

### 5. Database Storage
- Creates novel entry with metadata and source attribution
- Stores individual chapters with proper ordering
- Maintains relationships between novels and chapters

## API Endpoints

### POST /api/admin/import-novel

**Request Body:**
\`\`\`json
{
  "url": "https://www.gutenberg.org/files/11/11-0.txt"
}
\`\`\`

**Success Response:**
\`\`\`json
{
  "success": true,
  "novel": {
    "id": "...",
    "slug": "alice-s-adventures-in-wonderland",
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "chapterCount": 12
  },
  "message": "Successfully imported \"Alice's Adventures in Wonderland\" with 12 chapters"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "error": "Only Project Gutenberg URLs are currently supported."
}
\`\`\`

## Usage Instructions

### For Administrators

1. **Navigate to Admin Panel**
   - Go to `/admin` in your application
   - Click on the "Import Novel" tab

2. **Enter Source URL**
   - Paste a Project Gutenberg .txt URL
   - Click "Import Novel"

3. **Monitor Progress**
   - Watch the loading indicator
   - Review success/error messages
   - Click "View Imported Novel" to see results

### For Developers

1. **Testing the Import**
   \`\`\`bash
   # Run the test script
   node scripts/test-import.js
   \`\`\`

2. **Adding New Sources**
   - Extend `scrapeFromGutenberg.ts` with new scraper functions
   - Update the import API to handle different source types
   - Add validation for new URL patterns

## Error Handling

The import system handles various error scenarios:

- **Invalid URLs**: Validates URL format and supported domains
- **Network Errors**: Handles fetch failures and timeouts
- **Parsing Errors**: Manages content that can't be properly parsed
- **Duplicate Content**: Prevents importing the same novel twice
- **Database Errors**: Handles MongoDB connection and insertion issues

## Performance Considerations

- **Large Files**: The system can handle novels up to several MB in size
- **Chapter Parsing**: Complex regex operations may take time for very long texts
- **Database Operations**: Batch inserts are used for chapters to improve performance
- **Memory Usage**: Content is processed in memory, so very large files may require optimization

## Future Enhancements

- **Additional Sources**: Support for other public domain repositories
- **Format Support**: HTML, EPUB, and other formats
- **Batch Import**: Import multiple novels at once
- **Import History**: Track and manage previous imports
- **Content Validation**: Verify chapter quality and completeness
- **Custom Parsing**: Allow custom chapter detection patterns

## Troubleshooting

### Common Issues

1. **"Only Project Gutenberg URLs are supported"**
   - Ensure you're using a gutenberg.org URL
   - Check that the URL points to a .txt file

2. **"No chapters could be extracted"**
   - The text may not have clear chapter divisions
   - Content will be imported as a single chapter

3. **"Novel with this title already exists"**
   - A novel with the same title has already been imported
   - Check the existing novels list

4. **Network timeouts**
   - Large files may take time to download
   - Check your internet connection
   - Try again later if the source server is busy

### Debug Mode

Enable detailed logging by setting the environment variable:
\`\`\`bash
DEBUG_IMPORT=true
\`\`\`

This will provide additional console output during the import process.
\`\`\`

This comprehensive import system adds powerful functionality to your novel reader application, allowing administrators to easily populate the library with classic literature from Project Gutenberg and other sources. The system is designed to be extensible, so you can easily add support for additional sources in the future.
