import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profile-pictures');
    
    // Check if directory exists
    if (!fs.existsSync(uploadsDir)) {
      return NextResponse.json({
        success: true,
        files: [],
        message: 'Uploads directory does not exist'
      });
    }
    
    // Read directory
    const files = fs.readdirSync(uploadsDir);
    
    // Filter out any non-files (directories, etc.)
    const fileList = files.filter(file => {
      const filePath = path.join(uploadsDir, file);
      return fs.statSync(filePath).isFile();
    });
    
    return NextResponse.json({
      success: true,
      files: fileList,
      count: fileList.length
    });
    
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
