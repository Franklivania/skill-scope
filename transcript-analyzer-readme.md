# Transcript Analyzer - Core Functionality and Process

## Overview

The Transcript Analyzer is an AI-powered application that analyzes academic transcripts (PDF format) and provides personalized career guidance, educational recommendations, and actionable insights. It uses Groq's AI API to generate responses based on transcript content, user context, and selected analysis preferences.

## Architecture

### Folder Structure

```
src/
├── components/
│   ├── transcript-uploader.jsx      # PDF upload with drag-drop
│   ├── tone-selector.jsx            # Tone selection UI
│   ├── analysis-method-selector.jsx # Analysis method selection
│   ├── context-input.jsx            # Additional context textarea
│   ├── chat-interface.jsx          # Conversation display
│   └── response-display.jsx         # Formatted response rendering
├── services/
│   ├── pdf-reader.js                # Native JS PDF text extraction
│   ├── groq-client.js               # Groq API communication
│   └── session-storage.js           # Session-based conversation history
├── utils/
│   └── prompt-builder.js            # Prompt construction based on tone/method
└── hooks/
    └── use-transcript-analyzer.js   # Main orchestration hook
```

## Core Functionality

### 1. PDF Reading Process (`src/services/pdf-reader.js`)

The PDF reader service handles both text-based and image-based PDFs using native JavaScript:

**Text-based PDFs:**
- Parses PDF structure using FileReader API
- Extracts text patterns from PDF content streams
- Uses regex patterns to identify text objects (BT/ET markers, parentheses, brackets)
- Cleans and formats extracted text

**Image-based PDFs:**
- Renders PDF in hidden iframe using browser's native PDF viewer
- Attempts to extract selectable text from rendered content
- Falls back to user guidance if extraction is limited
- Supports PDF.js if available in browser

**Key Functions:**
- `extractTextFromPDF(file)` - Main entry point for PDF extraction
- `extractTextFromPDFDirect(file)` - Direct text extraction from PDF structure
- `extractTextFromPDFRender(file)` - Browser rendering approach
- `isValidPDF(file)` - Validates file type

**Limitations:**
- Native JS approach has limitations for complex PDFs
- Image-based PDFs may require manual input via context field
- OCR capabilities are limited without external libraries

### 2. Groq API Integration (`src/services/groq-client.js`)

The Groq client handles all communication with the Groq API:

**Configuration:**
- API URL: `VITE_GROQ_API_URL` environment variable
- API Key: `VITE_GROQ_API_KEY` environment variable
- Model: `meta-llama/llama-4-maverick-17b-128e-instruct`

**Features:**
- Streaming and non-streaming response support
- Error handling with retry logic
- Chunk-based streaming with callback support
- Automatic response parsing

**Key Functions:**
- `sendGroqRequest(messages, stream, onChunk)` - Main API call function
- `sendStreamingRequest(messages, onChunk)` - Streaming implementation
- `sendNonStreamingRequest(messages)` - Non-streaming implementation
- `validateGroqConfig()` - Configuration validation

**Message Format:**
```javascript
[
  { role: 'system', content: '...' },
  { role: 'user', content: '...' },
  { role: 'assistant', content: '...' }
]
```

### 3. Session Storage Management (`src/services/session-storage.js`)

Manages conversation history in browser sessionStorage:

**Storage Structure:**
```javascript
{
  messages: [
    { role: 'user' | 'assistant', content: string, timestamp: number }
  ],
  lastUpdated: number
}
```

**Features:**
- Maximum 5 messages stored (FIFO)
- Automatically cleared when tab closes (sessionStorage behavior)
- Per-session isolation
- API-ready message formatting

**Key Functions:**
- `addMessage(role, content)` - Add message to history
- `getHistory()` - Retrieve full history
- `getMessagesForAPI(count)` - Get formatted messages for API
- `clearHistory()` - Clear all history
- `getMessageCount()` - Get current message count
- `hasHistory()` - Check if history exists

### 4. Prompt Building (`src/utils/prompt-builder.js`)

Constructs AI prompts based on tone and analysis method:

**Tone Options:**
- **Casual**: Friendly, conversational, encouraging
- **Direct**: Straightforward, no-nonsense, factual
- **Counsellor**: Empathetic, supportive, guidance-focused
- **Coach**: Motivational, action-oriented, goal-focused
- **Analyst**: Data-driven, structured, detailed

**Analysis Methods:**
- **Structured**: Extract courses, grades, achievements
- **Strengths**: Identify strong, weak, and mid-performing areas
- **Career**: Generate career path recommendations
- **Resources**: Curate learning resources and school recommendations
- **Combinations**: Suggest optimal skill combinations

**Key Functions:**
- `buildSystemPrompt(tone)` - Build system prompt based on tone
- `buildAnalysisInstructions(method)` - Get analysis method instructions
- `buildUserPrompt(transcriptText, additionalContext, analysisMethod)` - Build user prompt
- `buildMessages(...)` - Build complete message array for API
- `getAvailableTones()` - Get all available tones
- `getAvailableAnalysisMethods()` - Get all available methods

**Prompt Structure:**
1. System prompt (tone-based)
2. Conversation history (last 5 messages)
3. Current user prompt (transcript + context + analysis method)

### 5. Main Hook (`src/hooks/use-transcript-analyzer.js`)

Orchestrates the entire transcript analysis flow:

**State Management:**
- Transcript text
- Additional context
- Selected tone and analysis method
- Message history
- Loading/streaming states
- Error handling

**Key Functions:**
- `handleTranscriptExtracted(text, fileName)` - Process extracted PDF text
- `handleSubmit(isFollowUp)` - Submit for analysis
- `handleFollowUp()` - Submit follow-up question
- `handleClear()` - Clear all data and history
- `handleError(message)` - Error handling

**Flow:**
1. User uploads PDF → Extract text
2. User selects tone/method (optional)
3. User adds context (optional)
4. User submits → Build prompt → Call Groq API
5. Stream response → Update UI → Store in session
6. User can ask follow-up questions

## Component Descriptions

### TranscriptUploader
- Drag-and-drop PDF upload
- File input fallback
- Processing state indicator
- File validation
- Error display

### ToneSelector
- Visual tone selection buttons
- Tone descriptions
- Active state styling

### AnalysisMethodSelector
- Dropdown selection
- Method descriptions
- Optional selection (defaults to comprehensive)

### ContextInput
- Textarea for additional context
- Character counter
- Optional field

### ChatInterface
- Message history display
- User/assistant message differentiation
- Streaming text display
- Auto-scroll to latest message
- Empty state handling

### ResponseDisplay
- Basic markdown formatting
- Paragraph handling
- List rendering (bulleted and numbered)
- Header support

## Process Flow

### Initial Analysis Flow

1. **Upload Phase**
   - User drags/drops or selects PDF file
   - `TranscriptUploader` validates file type
   - `pdf-reader.js` extracts text
   - Extracted text stored in hook state

2. **Configuration Phase**
   - User selects tone (default: casual)
   - User selects analysis method (optional)
   - User adds additional context (optional)

3. **Submission Phase**
   - User clicks "Analyze Transcript"
   - `use-transcript-analyzer` hook:
     - Builds messages using `prompt-builder.js`
     - Retrieves conversation history from `session-storage.js`
     - Calls `groq-client.js` with streaming enabled
     - Updates UI with streaming chunks
     - Stores complete response in session storage

4. **Response Phase**
   - AI response displayed in `ChatInterface`
   - Response stored in session history
   - User can ask follow-up questions

### Follow-up Question Flow

1. User types question in follow-up input
2. Hook retrieves last 5 messages from session storage
3. New user message added to history
4. API called with full context (system prompt + history + new question)
5. Response streamed and displayed
6. Conversation continues with context

## Session Management

- **Storage**: Browser sessionStorage (cleared on tab close)
- **Limit**: Maximum 5 messages (user + assistant pairs)
- **Isolation**: Each browser tab has separate session
- **Persistence**: Only within current browser session
- **Auto-clear**: Automatic on tab close (sessionStorage behavior)

## Error Handling

- PDF extraction errors → Display error message, allow retry
- API errors → Show error message, maintain state
- Network errors → Display user-friendly message
- Validation errors → Prevent submission, show guidance

## Environment Variables

Required in `.env` file:
```
VITE_GROQ_API_URL=https://api.groq.com/openai/v1
VITE_GROQ_API_KEY=your_api_key_here
```

## Styling Integration

- Uses existing theme system (CSS variables)
- Responsive design for mobile/desktop
- Theme-aware components
- Consistent with existing design patterns

## Limitations and Considerations

1. **PDF Reading**: Native JS approach has limitations; complex PDFs may require manual input
2. **Session Storage**: Limited to 5 messages; older messages are discarded
3. **API Rate Limits**: Subject to Groq API rate limits
4. **Browser Compatibility**: PDF rendering depends on browser capabilities
5. **Streaming**: Requires stable network connection

## Future Enhancements

- Enhanced PDF OCR capabilities
- Markdown rendering library integration
- Export conversation history
- Multiple transcript comparison
- Advanced analysis visualizations
- Custom prompt templates

