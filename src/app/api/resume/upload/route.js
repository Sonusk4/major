import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse/lib/pdf-parse.js';

// This helper function correctly extracts the token from the 'Authorization' header
const getDataFromToken = (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function POST(request) {
  await dbConnect();
  try {
    const userData = getDataFromToken(request);
    if (!userData || userData.role !== 'developer') {
      return NextResponse.json({ message: "Unauthorized: Invalid or missing token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    console.log('File buffer size:', fileBuffer.length);
    
    let parsedText = '';
    
    try {
        console.log('Starting PDF parsing with pdf-parse...');
        
        const data = await pdf(fileBuffer);
        parsedText = data.text;
        
        console.log('Parsed text length:', parsedText?.length || 0);
        console.log('Parsed text preview:', parsedText ? parsedText.substring(0, 200) + '...' : 'No text');
        
        if (!parsedText || parsedText.trim().length === 0) {
            throw new Error('No text content could be extracted from the PDF');
        }
    } catch (parseError) {
        console.error('Error parsing PDF with pdf-parse:', parseError);
        return NextResponse.json({ 
            message: "Failed to parse PDF: " + (parseError.message || 'Unknown error') 
        }, { status: 400 });
    }

    // Persist uploaded PDF to public/uploads/resumes so it can be served statically
    const fileName = `resume-${userData.id}-${Date.now()}.pdf`;
    const publicDir = path.join(process.cwd(), 'public');
    const resumesDir = path.join(publicDir, 'uploads', 'resumes');
    try {
      if (!fs.existsSync(resumesDir)) {
        fs.mkdirSync(resumesDir, { recursive: true });
      }
      const filePath = path.join(resumesDir, fileName);
      fs.writeFileSync(filePath, fileBuffer);
    } catch (writeErr) {
      console.error('Error saving resume PDF:', writeErr);
      return NextResponse.json({ message: "Failed to save uploaded file" }, { status: 500 });
    }
    const pdfUrl = `/uploads/resumes/${fileName}`;

    // First, find the existing profile
    let profile = await Profile.findOne({ user: userData.id });
    
    // If profile doesn't exist, create a new one
    if (!profile) {
      profile = new Profile({
        user: userData.id,
        headline: "Software Developer",
        bio: "Resume uploaded",
        skills: [],
        experience: [],
        education: []
      });
    }
    
    // Update the profile with new data
    profile.parsedResumeText = parsedText;
    profile.resumePDF = pdfUrl;
    
    // Save the profile
    const updatedProfile = await profile.save();
    
    console.log('Resume upload - User ID:', userData.id);
    console.log('Resume upload - Profile updated:', !!updatedProfile);
    console.log('Resume upload - Parsed text length:', parsedText ? parsedText.length : 0);
    console.log('Resume upload - Parsed text preview:', parsedText ? parsedText.substring(0, 200) + '...' : 'No text');

    return NextResponse.json({ 
      message: "Resume parsed and saved successfully", 
      filePath: pdfUrl,
      parsedText: parsedText
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}