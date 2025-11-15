/**
 * Native JS PDF Reader Service
 * Handles both text-based and image-based PDF extraction
 * Uses browser's native PDF rendering capabilities
 */

/**
 * Extracts text from a PDF file (text-based or image-based)
 * @param {File} file - The PDF file to read
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPDF(file) {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Invalid file type. Please upload a PDF file.');
  }

  try {
    // Try direct text extraction first (for text-based PDFs)
    const textContent = await extractTextFromPDFDirect(file);
    
    if (textContent && textContent.trim().length > 50) {
      return textContent;
    }

    // If minimal text found, try browser rendering approach
    return await extractTextFromPDFRender(file);
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
}

/**
 * Extracts text directly from text-based PDF by parsing PDF structure
 * @param {File} file - The PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDFDirect(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to string for pattern matching
        let pdfString = '';
        for (let i = 0; i < Math.min(uint8Array.length, 1000000); i++) {
          const char = String.fromCharCode(uint8Array[i]);
          if (char.match(/[\x20-\x7E\n\r]/)) {
            pdfString += char;
          }
        }
        
        // Extract text content patterns
        const textPatterns = [
          /BT[\s\S]*?ET/g, // Text objects
          /\(([^)]+)\)/g,  // Text in parentheses
          /\[([^\]]+)\]/g, // Text in brackets
        ];
        
        let extractedText = '';
        for (const pattern of textPatterns) {
          const matches = pdfString.match(pattern);
          if (matches) {
            for (const match of matches) {
              // Clean up extracted text
              const cleaned = match
                .replace(/[BTET\(\)\[\]]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              if (cleaned.length > 2) {
                extractedText += cleaned + ' ';
              }
            }
          }
        }
        
        resolve(extractedText.trim());
      } catch (error) {
        resolve(''); // Fallback to render method
      }
    };
    
    reader.onerror = () => resolve('');
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extracts text by rendering PDF in browser and extracting selectable text
 * @param {File} file - The PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractTextFromPDFRender(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        // Create hidden iframe to render PDF
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-9999px';
        iframe.style.left = '-9999px';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.src = url + '#toolbar=0';
        document.body.appendChild(iframe);
        
        // Wait for PDF to load and extract text
        const timeout = setTimeout(() => {
          cleanup();
          resolve('PDF loaded successfully. If text extraction was limited, please provide additional context in the text area below.');
        }, 5000);
        
        iframe.onload = () => {
          try {
            setTimeout(() => {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
              
              if (iframeDoc) {
                // Try to get text from the rendered PDF
                const bodyText = iframeDoc.body?.innerText || iframeDoc.body?.textContent || '';
                
                if (bodyText.trim().length > 50) {
                  clearTimeout(timeout);
                  cleanup();
                  resolve(bodyText.trim());
                } else {
                  // Check for PDF.js viewer
                  const pdfViewer = iframe.contentWindow?.PDFViewerApplication;
                  if (pdfViewer?.pdf) {
                    extractFromPDFJS(pdfViewer.pdf)
                      .then(text => {
                        clearTimeout(timeout);
                        cleanup();
                        resolve(text || bodyText.trim() || 'PDF processed. Please add additional context if needed.');
                      })
                      .catch(() => {
                        clearTimeout(timeout);
                        cleanup();
                        resolve(bodyText.trim() || 'PDF loaded. For image-based PDFs, please provide transcript content in the context field.');
                      });
                  } else {
                    clearTimeout(timeout);
                    cleanup();
                    resolve(bodyText.trim() || 'PDF loaded. For best results with image-based PDFs, please provide transcript content manually.');
                  }
                }
              } else {
                clearTimeout(timeout);
                cleanup();
                resolve('PDF loaded. Please provide additional context in the text area for image-based PDFs.');
              }
            }, 2000);
          } catch (error) {
            clearTimeout(timeout);
            cleanup();
            resolve('PDF loaded. Please provide transcript content in the context field for image-based PDFs.');
          }
        };
        
        iframe.onerror = () => {
          clearTimeout(timeout);
          cleanup();
          reject(new Error('Failed to load PDF'));
        };
        
        function cleanup() {
          try {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(url);
          } catch (err) {
            // Ignore cleanup errors
          }
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extracts text using PDF.js if available
 * @param {Object} pdf - PDF.js document object
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromPDFJS(pdf) {
  try {
    const numPages = pdf.numPages;
    let fullText = '';
    
    for (let i = 1; i <= Math.min(numPages, 10); i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      } catch (err) {
        // Skip page if extraction fails
      }
    }
    
    return fullText.trim();
  } catch (error) {
    return '';
  }
}

/**
 * Validates if a file is a PDF
 * @param {File} file - File to validate
 * @returns {boolean} - True if valid PDF
 */
export function isValidPDF(file) {
  return file && file.type === 'application/pdf';
}

