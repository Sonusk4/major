import { readFile } from 'fs/promises';
import { extractRawText } from 'mammoth';

export async function extractTextFromDocx(fileOrBuffer) {
  try {
    let buffer;
    
    // If it's a file path, read the file
    if (typeof fileOrBuffer === 'string') {
      buffer = await readFile(fileOrBuffer);
    } 
    // If it's a file object with arrayBuffer method (like from FormData)
    else if (fileOrBuffer.arrayBuffer) {
      const arrayBuffer = await fileOrBuffer.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }
    // If it's already a buffer
    else if (Buffer.isBuffer(fileOrBuffer)) {
      buffer = fileOrBuffer;
    } else {
      throw new Error('Unsupported file type. Expected file path, File object, or Buffer.');
    }
    
    // Extract text using mammoth
    const result = await extractRawText({ buffer });
    
    // Return the extracted text
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error(`Failed to extract text from Word document: ${error.message}`);
  }
}
