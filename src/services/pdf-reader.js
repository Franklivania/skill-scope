/**
 * PDF Reader using pdfjs-dist v5.4.394
 * Fully supports text extraction from all PDF types
 */

import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// 🔥 IMPORTANT: workerSrc must be set manually in pdfjs v5
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * Extract text from a PDF using pdfjs-dist v5.4.394
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromPDF(file) {
  if (!file || file.type !== "application/pdf") {
    throw new Error("Invalid file type. Please upload a PDF file.");
  }

  const arrayBuffer = await file.arrayBuffer();

  // Load PDF
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";

  // Loop pages
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n\n";
  }

  return fullText.trim();
}

/**
 * Validates PDF file
 */
export function isValidPDF(file) {
  return file && file.type === "application/pdf";
}
