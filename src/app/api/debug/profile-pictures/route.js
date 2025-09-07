import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    const profiles = await Profile.find({}).populate('user', 'email');
    
    const profileData = profiles.map(profile => ({
      userId: profile.user?._id,
      email: profile.user?.email,
      profilePicture: profile.profilePicture || null,
      hasPicture: !!profile.profilePicture
    }));
    
    return NextResponse.json({ success: true, data: profileData });
  } catch (error) {
    console.error('Error fetching profile pictures:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile pictures' },
      { status: 500 }
    );
  }
}
