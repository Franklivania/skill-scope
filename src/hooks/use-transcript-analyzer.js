import { useState, useCallback } from 'react';
import { sendGroqRequest } from '../services/groq-client';
import { addMessage, getMessagesForAPI, clearHistory } from '../services/session-storage';
import { buildMessages } from '../utils/prompt-builder';
import { summarizeTranscript } from '../services/transcript-summarizer';

export function useTranscriptAnalyzer() {
  const [transcriptText, setTranscriptText] = useState(''); // Raw text (hidden from user)
  const [summarizedText, setSummarizedText] = useState(''); // Summarized version (used for API)
  const [additionalContext, setAdditionalContext] = useState('');
  const [tone, setTone] = useState('casual');
  const [analysisMethod, setAnalysisMethod] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(''); // 'extracting', 'summarizing', 'ready'
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleTranscriptExtracted = useCallback(async (text, fileName) => {
    if (!text || !text.trim()) {
      setError('No text could be extracted from the PDF.');
      return;
    }

    setTranscriptText(text);
    setUploadedFileName(fileName || '');
    setError(null);
    setIsProcessing(true);
    setProcessingStage('summarizing');

    try {
      // Summarize in the background
      const summary = await summarizeTranscript(text);
      setSummarizedText(summary);
      setProcessingStage('ready');
    } catch (err) {
      console.error('Summarization error:', err);
      // Use original text if summarization fails
      setSummarizedText(text);
      setProcessingStage('ready');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleError = useCallback((errorMessage) => {
    setError(errorMessage);
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const handleSubmit = useCallback(async (isFollowUp = false) => {
    if (isLoading || isStreaming) return;

    // Validate input
    if (!isFollowUp && !summarizedText.trim() && !additionalContext.trim()) {
      setError('Please wait for transcript processing to complete or provide additional context.');
      return;
    }

    // Check if still processing
    if (isProcessing) {
      setError('Please wait for transcript processing to complete.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingText('');

    try {
      // Get conversation history (last 5 messages)
      const history = getMessagesForAPI(5);

      // Build messages for API using summarized text
      // Pass isFollowUp flag to distinguish between initial analysis and follow-ups
      const apiMessages = buildMessages(
        isFollowUp ? '' : summarizedText, // Only include transcript for initial analysis
        additionalContext,
        tone,
        isFollowUp ? '' : analysisMethod, // Only include analysis method for initial analysis
        history,
        isFollowUp // Pass the follow-up flag
      );

      // Add user message to local state (don't show raw transcript)
      const userMessageContent = isFollowUp
        ? additionalContext
        : `I've uploaded my transcript${uploadedFileName ? ` (${uploadedFileName})` : ''}.${additionalContext ? `\n\nAdditional Context: ${additionalContext}` : ''}`;

      const newUserMessage = {
        role: 'user',
        content: userMessageContent,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newUserMessage]);
      addMessage('user', userMessageContent);

      // Stream response
      let fullResponse = '';
      const onChunk = (chunk) => {
        fullResponse += chunk;
        setStreamingText(fullResponse);
      };

      const response = await sendGroqRequest(apiMessages, true, onChunk);

      setIsStreaming(false);
      setStreamingText('');

      // Add assistant response to local state
      const assistantMessage = {
        role: 'assistant',
        content: response || fullResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      addMessage('assistant', response || fullResponse);

      // Clear additional context for follow-up questions
      if (isFollowUp) {
        setAdditionalContext('');
      }
    } catch (err) {
      handleError(err.message || 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [summarizedText, additionalContext, tone, analysisMethod, isLoading, isStreaming, isProcessing, uploadedFileName]);

  const handleFollowUp = useCallback(() => {
    if (!additionalContext.trim()) {
      setError('Please enter a question or additional context.');
      return;
    }
    handleSubmit(true);
  }, [additionalContext, handleSubmit]);

  const handleClear = useCallback(() => {
    setTranscriptText('');
    setSummarizedText('');
    setAdditionalContext('');
    setMessages([]);
    setError(null);
    setUploadedFileName('');
    setProcessingStage('');
    setIsProcessing(false);
    clearHistory();
  }, []);

  return {
    // State
    transcriptText, // Raw (hidden)
    summarizedText, // Summarized (used for API)
    additionalContext,
    tone,
    analysisMethod,
    messages,
    isLoading,
    isStreaming,
    streamingText,
    error,
    isProcessing,
    processingStage,
    uploadedFileName,

    // Setters
    setAdditionalContext,
    setTone,
    setAnalysisMethod,

    // Handlers
    handleTranscriptExtracted,
    handleError,
    handleSubmit,
    handleFollowUp,
    handleClear,
  };
}

