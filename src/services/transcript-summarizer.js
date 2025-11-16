/**
 * Transcript Summarizer Service
 * Summarizes long transcripts to reduce token usage
 */

import { sendGroqRequest } from './groq-client';

const MAX_SUMMARY_LENGTH = 4000; // Target length for summary in characters
const MAX_INPUT_LENGTH = 50000; // Max characters to send to summarization API

/**
 * Summarizes a transcript to reduce token usage
 * @param {string} transcriptText - The full transcript text
 * @returns {Promise<string>} - Summarized transcript
 */
export async function summarizeTranscript(transcriptText) {
  if (!transcriptText || !transcriptText.trim()) {
    return '';
  }

  // If transcript is already short enough, return as-is
  if (transcriptText.length <= MAX_SUMMARY_LENGTH) {
    return transcriptText;
  }

  try {
    // Truncate if too long to prevent API errors
    const textToSummarize = transcriptText.length > MAX_INPUT_LENGTH
      ? transcriptText.substring(0, MAX_INPUT_LENGTH) + '\n\n[Content truncated for processing...]'
      : transcriptText;

    const summaryPrompt = `You are an academic transcript analyzer. Summarize the following transcript, extracting key information:

- All courses/subjects with their grades or performance indicators
- Overall academic performance (GPA, class rank, honors, etc.)
- Areas of strength (subjects with high performance)
- Areas needing improvement (subjects with lower performance)
- Academic achievements, awards, or distinctions
- Any notable patterns or trends

Be concise but comprehensive. Focus on factual information that would be useful for career guidance and educational planning. Keep the summary under ${MAX_SUMMARY_LENGTH} characters.

TRANSCRIPT:
${textToSummarize}

Provide a structured summary that captures all essential information.`;

    const messages = [
      {
        role: 'system',
        content: 'You are a concise academic transcript analyzer. Extract and summarize key information efficiently.',
      },
      {
        role: 'user',
        content: summaryPrompt,
      },
    ];

    const summary = await sendGroqRequest(messages, false);
    return summary.trim() || transcriptText.substring(0, MAX_SUMMARY_LENGTH);
  } catch (error) {
    console.error('Summarization failed:', error);
    // Fallback: return truncated version
    return transcriptText.substring(0, MAX_SUMMARY_LENGTH) + '...';
  }
}

