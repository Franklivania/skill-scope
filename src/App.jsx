import { useState } from 'react';
import WebHeader from './components/web-header';
import TranscriptUploader from './components/transcript-uploader';
import ToneSelector from './components/tone-selector';
import AnalysisMethodSelector from './components/analysis-method-selector';
import ContextInput from './components/context-input';
import ChatInterface from './components/chat-interface';
import { useTranscriptAnalyzer } from './hooks/use-transcript-analyzer';

function App() {
  const {
    summarizedText,
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
    setAdditionalContext,
    setTone,
    setAnalysisMethod,
    handleTranscriptExtracted,
    handleError,
    handleSubmit,
    handleFollowUp,
    handleClear,
  } = useTranscriptAnalyzer();

  const [showInputs, setShowInputs] = useState(true);

  const canSubmit = (summarizedText.trim() || additionalContext.trim()) && !isProcessing;
  const hasMessages = messages.length > 0;

  return (
    <main
      className="min-h-screen w-full h-screen flex flex-col"
      style={{
        backgroundColor: 'hsl(var(--color-background))',
        color: 'hsl(var(--color-text))',
      }}
    >
      <WebHeader />
      
      <div className="flex-1 flex flex-col overflow-x-hidden pt-16">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col gap-6 max-w-7xl">
          {/* Input Section */}
          {showInputs && (
            <div className="space-y-4">
              <div className="bg-surface rounded-lg p-6" style={{ backgroundColor: 'hsl(var(--color-surface))' }}>
                <h2 className="text-2xl font-bold mb-4">Upload Your Transcript</h2>
                
                <div className="space-y-4">
                  <TranscriptUploader
                    onTranscriptExtracted={handleTranscriptExtracted}
                    onError={handleError}
                    isProcessing={isProcessing}
                    processingStage={processingStage}
                    uploadedFileName={uploadedFileName}
                  />

                  <ToneSelector
                    selectedTone={tone}
                    onToneChange={setTone}
                  />

                  <AnalysisMethodSelector
                    selectedMethod={analysisMethod}
                    onMethodChange={setAnalysisMethod}
                  />

                  <ContextInput
                    value={additionalContext}
                    onChange={setAdditionalContext}
                  />

                  {error && (
                    <div
                      className="p-3 rounded-lg"
                      style={{
                        backgroundColor: 'hsl(var(--color-accent))',
                        color: 'hsl(var(--color-text))',
                      }}
                    >
                      <p className="text-sm">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={!canSubmit || isLoading || isStreaming || isProcessing}
                      className="default primary px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing 
                        ? 'Processing transcript...' 
                        : isLoading || isStreaming 
                        ? 'Getting analysis...' 
                        : 'Analyze Transcript'}
                    </button>
                    
                    {hasMessages && (
                      <button
                        onClick={handleClear}
                        className="default secondary px-6 py-2 rounded-lg font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Section */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-surface rounded-lg p-4 flex-1 flex flex-col min-h-0" style={{ backgroundColor: 'hsl(var(--color-surface))' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Conversation</h2>
                <button
                  onClick={() => setShowInputs(!showInputs)}
                  className="text-sm px-3 py-1 rounded"
                  style={{
                    backgroundColor: `hsl(var(--color-accent))`,
                    color: `hsl(var(--color-text))`,
                  }}
                >
                  {showInputs ? 'Hide Inputs' : 'Show Inputs'}
                </button>
              </div>

              <ChatInterface
                messages={messages}
                isStreaming={isStreaming}
                streamingText={streamingText}
              />

              {/* Follow-up Input */}
              {hasMessages && (
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'hsl(var(--color-border))' }}>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={additionalContext}
                      onChange={(e) => setAdditionalContext(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleFollowUp();
                        }
                      }}
                      placeholder="Ask a follow-up question..."
                      className="flex-1 px-4 py-2 rounded-lg border text-base"
                      style={{
                        backgroundColor: `hsl(var(--color-background))`,
                        color: `hsl(var(--color-text))`,
                        borderColor: `hsl(var(--color-border))`,
                      }}
                    />
                    <button
                      onClick={handleFollowUp}
                      disabled={!additionalContext.trim() || isLoading || isStreaming}
                      className="default primary px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
