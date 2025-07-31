# Notion File API Endpoints

## Overview

This system now includes API endpoints to serve Notion file content directly. Instead of just passing Notion URLs to customers, we now have proper API endpoints that download the file from Notion and serve it to customers.

## API Endpoints

### 1. Download File by Composition ID
```
GET /api/notion/compositions/:compositionId/file
```

**Parameters:**
- `compositionId` (string, required): The Notion page ID of the composition

**Response:**
- **Success (200)**: PDF file content with proper headers
- **Error (404)**: Composition not found or no file available
- **Error (500)**: Server error

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Composition_Name.pdf"`
- `Content-Length: [file size in bytes]`

### 2. Download File by Slug
```
GET /api/notion/compositions/slug/:slug/file
```

**Parameters:**
- `slug` (string, required): The slug of the composition

**Response:**
- **Success (200)**: PDF file content with proper headers
- **Error (404)**: Composition not found or no file available
- **Error (500)**: Server error

**Headers:**
- `Content-Type: application/pdf`
- `Content-Disposition: attachment; filename="Composition_Name.pdf"`
- `Content-Length: [file size in bytes]`

## How It Works

1. **Customer makes purchase** → Stripe webhook triggers
2. **Our server** looks up composition by slug in Notion
3. **Gets the "Website Download File" URL** from Notion
4. **Sends email** with our API endpoint URL (not the direct Notion URL)
5. **Customer clicks link** → Our API downloads the file from Notion and serves it

## Email Integration

The email template now uses our API endpoint instead of the direct Notion URL:

```javascript
// Before (direct Notion URL)
downloadLink: purchaseData.pdfUrl

// After (our API endpoint)
downloadLink: `${process.env.WEBSITE_URL}/api/notion/compositions/slug/${purchaseData.slug}/file`
```

## Security Features

- **Rate limiting**: 100 requests per minute per IP
- **Input validation**: Validates composition IDs and slugs
- **Timeout protection**: 30-second timeout for file downloads
- **Error handling**: Proper error responses for missing files
- **No caching**: Files are downloaded fresh each time

## Testing

Run the test to verify the API works:

```bash
node test-file-api.js
```

## Example Usage

### Customer receives email with link:
```
https://your-website.com/api/notion/compositions/slug/coming-home/file
```

### Customer clicks link → Downloads PDF:
- File is downloaded from Notion
- Served with proper PDF headers
- Filename: "Coming_Home.pdf"

## Benefits

1. **✅ Direct file serving**: No more broken Notion URLs
2. **✅ Proper file headers**: Correct Content-Type and filename
3. **✅ Security**: Rate limiting and validation
4. **✅ Reliability**: Our server handles the file serving
5. **✅ Tracking**: We can log file downloads if needed

## File Flow

```
Notion Database
    ↓ (Website Download File property)
Notion File URL
    ↓ (Our API downloads)
Our Server Buffer
    ↓ (Served to customer)
Customer PDF Download
```

This ensures customers always get their purchased sheet music files reliably! 🎵 