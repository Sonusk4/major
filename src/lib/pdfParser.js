import { readFile } from 'fs/promises';
import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extracts text from a PDF file or buffer using pdf-parse
 * @param {string|Buffer|File} fileOrPath - Path to PDF file, Buffer, or File object
 * @returns {Promise<string>} Extracted text from the PDF
 */
export async function extractTextFromPDF(fileOrPath) {
  try {
    let buffer;
    
    // Handle different input types
    if (typeof fileOrPath === 'string') {
      // It's a file path
      buffer = await readFile(fileOrPath);
    } else if (fileOrPath.arrayBuffer) {
      // It's a File object (from FormData)
      const arrayBuffer = await fileOrPath.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else if (Buffer.isBuffer(fileOrPath)) {
      // It's already a Buffer
      buffer = fileOrPath;
    } else {
      throw new Error('Unsupported file type. Expected file path, File object, or Buffer.');
    }
    
    console.log('Starting PDF text extraction...');
    console.log('Buffer length:', buffer.length);
    
    try {
      // Extract text using pdf-parse
      const data = await pdf(buffer);
      console.log('PDF text extraction successful');
      console.log('Extracted text length:', data.text.length);
      return data.text;
    } catch (pdfError) {
      console.error('Error in pdf-parse:', {
        message: pdfError.message,
        name: pdfError.name,
        stack: pdfError.stack
      });
      throw pdfError;
    }
    
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw new Error(`Failed to process PDF: ${error.message}`);
  }
}
