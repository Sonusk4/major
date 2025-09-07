import { NextResponse } from 'next/server';
import { readFile, access, constants, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';
import { extractTextFromPDF } from '@/lib/pdfParser';
import { extractTextFromDocx } from '@/lib/docxParser';

// Helper function to check if file exists
async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Helper function to get file extension from filename
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

export async function POST(request) {
  await dbConnect();
  
  try {
    console.log('Starting resume parsing...');
    
    // Get the uploaded file from form data
    const formData = await request.formData();
    const file = formData.get('resume');
    
    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }
    
    // Get user ID from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.error('No authorization token provided');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    
    // Get the file extension
    const fileExtension = getFileExtension(file.name);
    
    if (!['pdf', 'doc', 'docx'].includes(fileExtension)) {
      return NextResponse.json(
        { 
          message: 'Unsupported file type. Please upload a PDF or Word document.' }, 
        { status: 400 }
      );
    }
    
    let text = '';
    try {
      // Convert the file to a buffer using Buffer.from() to avoid deprecation warning
      const arrayBuffer = await file.arrayBuffer();
      const buffer = arrayBuffer instanceof Buffer ? arrayBuffer : Buffer.from(arrayBuffer);
      
      if (fileExtension === 'pdf') {
        console.log('Extracting text from PDF...');
        text = await extractTextFromPDF(buffer);
      } else {
        console.log('Extracting text from Word document...');
        text = await extractTextFromDocx(buffer);
      }
      console.log('Successfully extracted text from resume');
    } catch (parseError) {
      console.error('Error extracting text from resume:', parseError);
      return NextResponse.json(
        { 
          message: 'Error extracting text from resume',
          error: parseError.message 
        },
        { status: 500 }
      );
    }

    // Basic data extraction
    const extractedData = {
      name: '',
      email: '',
      phone: '',
      skills: [],
      experience: [],
      education: []
    };

    // Simple email extraction
    const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
    if (emailMatch) {
      extractedData.email = emailMatch[0];
    }

    // Simple phone number extraction
    const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\d{10}/);
    if (phoneMatch) {
      extractedData.phone = phoneMatch[0];
    }

    // Simple name extraction (first two words in the first line)
    const firstLine = text.split('\n')[0].trim();
    if (firstLine) {
      extractedData.name = firstLine.split(/\s+/).slice(0, 2).join(' ');
    }

    // Log the extracted text and data for debugging
    console.log('Extracted text length:', text.length);
    console.log('Extracted data:', JSON.stringify(extractedData, null, 2));

    // Update or create profile with parsed data
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      {
        $set: {
          parsedResumeText: text,
          resumeText: text, // Keep both for backward compatibility
          resumeName: file.name,
          resumeLastUpdated: new Date(),
          ...extractedData,
          updatedAt: new Date()
        },
        $setOnInsert: {
          user: userId,
          createdAt: new Date()
        }
      },
      { 
        upsert: true,
        new: true, // Return the updated document
        runValidators: true
      }
    );

    console.log('Updated profile with resume data:', {
      id: updatedProfile._id,
      hasText: !!updatedProfile.parsedResumeText,
      textLength: updatedProfile.parsedResumeText?.length
    });

    return NextResponse.json({
      message: 'Resume parsed successfully',
      text,
      extractedData
    });

  } catch (error) {
    console.error('Error in parse-resume API:', error);
    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
function extractResumeData(text) {
  // This is a simplified version. In a real app, you'd want to use a more sophisticated NLP library
  const data = {
    skills: [],
    experience: [],
    education: [],
    name: '',
    email: '',
    phone: ''
  };
  
  // Extract email
  const emailMatch = text.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/);
  if (emailMatch) data.email = emailMatch[0];
  
  // Extract phone number (simple pattern)
  const phoneMatch = text.match(/(\+\d{1,3}[- ]?)?\d{10}/);
  if (phoneMatch) data.phone = phoneMatch[0];
  
  // Extract skills (this is a very basic example)
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'HTML', 'CSS', 
    'SQL', 'MongoDB', 'Express', 'Git', 'Docker', 'AWS', 'TypeScript'
  ];
  
  data.skills = commonSkills.filter(skill => 
    new RegExp(`\\b${skill}\\b`, 'i').test(text)
  );
  
  // In a real app, you'd want to use more sophisticated parsing for experience and education
  
  return data;
}
