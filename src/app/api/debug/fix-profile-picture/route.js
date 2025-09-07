import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';

export async function POST() {
  try {
    await dbConnect();
    
    // Find all profiles with the broken image URL
    const profiles = await Profile.find({
      profilePicture: "/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1757001163336.jpg"
    });
    
    if (profiles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No profiles with broken image found',
        updatedCount: 0
      });
    }
    
    // Update all matching profiles to use a working image
    const result = await Profile.updateMany(
      { profilePicture: "/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1757001163336.jpg" },
      { $set: { profilePicture: "/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1754933639536.jpg" } }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Profile pictures updated successfully',
      updatedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error('Error fixing profile pictures:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix profile pictures' },
      { status: 500 }
    );
  }
}
