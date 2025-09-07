import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';

// Ensure uploads directory exists
const fs = require('fs');
const uploadsDir = join(process.cwd(), 'public', 'uploads', 'resumes');

// Check for required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please create a .env.local file with these variables');
}

try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory at:', uploadsDir);
  }
} catch (error) {
  console.error('Error creating uploads directory:', error);
  process.exit(1);
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const data = await request.formData();
    const file = data.get('resume');
    
    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${fileExtension}`;
    
    const filePath = join(uploadsDir, fileName);
    
    try {
      await writeFile(filePath, buffer);
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { message: 'Failed to save file' },
        { status: 500 }
      );
    }
    
    // Get user ID from token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      console.error('No authorization token provided');
      return NextResponse.json(
        { message: 'Authentication required. Please log in again.' },
        { status: 401 }
      );
    }
    
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }
      
      const userData = jwt.verify(token, process.env.JWT_SECRET);
      
      // Update profile with resume path
      const profile = await Profile.findOneAndUpdate(
        { user: userData.id },
        { 
          resumePath: `/uploads/resumes/${fileName}`,
          resumeName: file.name,
          resumeLastUpdated: new Date()
        },
        { new: true, upsert: true }
      );
      
      return NextResponse.json({ 
        success: true, 
        fileName: file.name,
        filePath: `/uploads/resumes/${fileName}`
      });
    } catch (error) {
      console.error('JWT verification failed:', error);
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Error in upload-resume:', error);
    return NextResponse.json(
      { 
        message: 'Error processing your request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
