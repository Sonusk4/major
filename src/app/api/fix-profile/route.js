import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';

export async function POST() {
  try {
    await dbConnect();
    
    // Update the specific user's profile picture
    const result = await Profile.updateOne(
      { user: '68889a3bc09a68b166e8e515' }, // User ID from the token
      { 
        $set: { 
          profilePicture: '/uploads/profile-pictures/profile-68889a3bc09a68b166e8e515-1754933639536.jpg'
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully',
      updated: result.modifiedCount > 0
    });
    
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
