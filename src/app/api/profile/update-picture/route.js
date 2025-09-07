import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { userId, pictureUrl } = await request.json();
    
    if (!userId || !pictureUrl) {
      return NextResponse.json(
        { success: false, error: 'User ID and picture URL are required' },
        { status: 400 }
      );
    }
    
    // Update the profile with the new picture URL
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: userId },
      { profilePicture: pictureUrl },
      { new: true, upsert: true }
    );
    
    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile picture updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile picture' },
      { status: 500 }
    );
  }
}
