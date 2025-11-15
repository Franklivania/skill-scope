import { useState, useRef } from 'react';
import { extractTextFromPDF, isValidPDF } from '../services/pdf-reader';

export default function TranscriptUploader({ onTranscriptExtracted, onError, isProcessing, processingStage, uploadedFileName }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLocalProcessing, setIsLocalProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileSelect = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file) => {
    if (!isValidPDF(file)) {
      onError?.('Please upload a valid PDF file.');
      return;
    }

    setIsLocalProcessing(true);
    setUploadedFile(file);

    try {
      const extractedText = await extractTextFromPDF(file);
      onTranscriptExtracted?.(extractedText, file.name);
    } catch (error) {
      onError?.(error.message || 'Failed to extract text from PDF.');
      setUploadedFile(null);
    } finally {
      setIsLocalProcessing(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onTranscriptExtracted?.('', '');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-primary bg-surface' 
            : 'border-border hover:border-primary'
          }
          ${(isLocalProcessing || isProcessing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        style={{
          borderColor: isDragging 
            ? `hsl(var(--color-primary))` 
            : `hsl(var(--color-border))`,
          backgroundColor: isDragging 
            ? `hsl(var(--color-surface))` 
            : 'transparent',
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!(isLocalProcessing || isProcessing) ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLocalProcessing || isProcessing}
        />

        {(isLocalProcessing || isProcessing) ? (
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p style={{ color: 'hsl(var(--color-text-muted))' }}>
              {isLocalProcessing 
                ? 'Extracting text from PDF...' 
                : processingStage === 'summarizing'
                ? 'Analyzing and summarizing transcript...'
                : 'Processing...'}
            </p>
            {processingStage === 'summarizing' && (
              <p className="text-xs" style={{ color: 'hsl(var(--color-text-muted))' }}>
                This may take a moment
              </p>
            )}
          </div>
        ) : (uploadedFile || uploadedFileName) ? (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-12 h-12"
              style={{ color: 'hsl(var(--color-primary))' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-semibold">{uploadedFile?.name || uploadedFileName}</p>
            {processingStage === 'ready' && (
              <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-primary))' }}>
                ✓ Ready to analyze
              </p>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="text-sm mt-2"
              style={{ color: 'hsl(var(--color-primary))' }}
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg
              className="w-12 h-12"
              style={{ color: 'hsl(var(--color-text-muted))' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="font-semibold">Drop your transcript PDF here</p>
            <p className="text-sm" style={{ color: 'hsl(var(--color-text-muted))' }}>
              or click to browse
            </p>
            <p className="text-xs mt-2" style={{ color: 'hsl(var(--color-text-muted))' }}>
              Supports both text-based and image-based PDFs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

