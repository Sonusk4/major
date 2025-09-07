import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  console.log('Received profile picture upload request');
  
  try {
    await dbConnect();
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No auth token provided');
      return NextResponse.json({ 
        success: false,
        message: 'Unauthorized: No token provided' 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified for user ID:', decoded.id);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ 
        success: false,
        message: 'Invalid or expired token' 
      }, { status: 401 });
    }
    
    // Verify user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found with ID:', decoded.id);
      return NextResponse.json({ 
        success: false,
        message: 'User not found' 
      }, { status: 404 });
    }

    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      console.log('No file in form data');
      return NextResponse.json({ 
        success: false,
        message: 'No file uploaded' 
      }, { status: 400 });
    }

    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    if (!file.type || !file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ 
        success: false,
        message: 'Only image files are allowed (JPEG, PNG, etc.)' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size, 'bytes');
      return NextResponse.json({ 
        success: false,
        message: 'File size must be less than 5MB' 
      }, { status: 400 });
    }

    // Save the image to public/uploads/profile-pictures so it can be served statically
    try {
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const profilePicturesDir = path.join(uploadsDir, 'profile-pictures');
      
      console.log('Ensuring directories exist...');
      if (!fs.existsSync(uploadsDir)) {
        console.log('Creating uploads directory...');
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      if (!fs.existsSync(profilePicturesDir)) {
        console.log('Creating profile-pictures directory...');
        fs.mkdirSync(profilePicturesDir, { recursive: true });
      }

      // Generate a safe filename
      const fileExt = path.extname(file.name).toLowerCase() || '.jpg';
      const safeFileName = `profile-${user._id}-${Date.now()}${fileExt}`;
      // Ensure the filename is URL-safe
      const safeFileNameEncoded = encodeURIComponent(safeFileName);
      const filePath = path.join(profilePicturesDir, safeFileName);
      const publicPath = `/uploads/profile-pictures/${safeFileNameEncoded}`;
      
      console.log('Saving file to:', filePath);
      console.log('Public URL will be:', publicPath);
      
      try {
        // Test directory write access
        const testFilePath = path.join(profilePicturesDir, 'test-write-access');
        await fs.promises.writeFile(testFilePath, 'test');
        await fs.promises.unlink(testFilePath);
        console.log('Write access verified');
      } catch (accessError) {
        console.error('Directory write access error:', accessError);
        throw new Error(`Cannot write to directory: ${accessError.message}`);
      }
      
      // Save the actual file
      await fs.promises.writeFile(filePath, fileBuffer);
      console.log('File saved successfully');

      // Verify file was written
      const stats = await fs.promises.stat(filePath);
      if (stats.size === 0) {
        throw new Error('File was saved but has 0 bytes');
      }
      console.log('File size after save:', stats.size, 'bytes');

      // Use the public path for the URL
      const fileUrl = publicPath;
      console.log('File URL:', fileUrl);

      // Update profile with new picture URL
      console.log('Updating profile with new picture URL...');
      const updatedProfile = await Profile.findOneAndUpdate(
        { user: user._id },
        { profilePicture: fileUrl },
        { upsert: true, new: true }
      );
      
      if (!updatedProfile) {
        console.error('Failed to update profile with new picture URL');
        throw new Error('Failed to update profile with new picture URL');
      }
      console.log('Profile updated successfully');

      return NextResponse.json({ 
        success: true,
        message: 'Profile picture uploaded successfully',
        fileUrl: fileUrl
      });
    } catch (error) {
      console.error('Error processing profile picture:', error);
      return NextResponse.json({ 
        success: false,
        message: 'Failed to process profile picture',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Profile picture upload error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
