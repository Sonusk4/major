import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';
import jwt from 'jsonwebtoken';

const getDataFromToken = (request) => {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1] || '';
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function GET(request) {
  await dbConnect();
  try {
    const userData = getDataFromToken(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let profile = await Profile.findOne({ user: userData.id });
    if (!profile) {
      // Create a new profile if none exists
      profile = new Profile({
        user: userData.id,
        fullName: userData.name || '',
        headline: 'Software Developer',
        bio: '',
        skills: [],
        experience: [],
        education: [],
        parsedResumeText: '',
        resumePDF: ''
      });
      await profile.save();
    }
    
    // Ensure parsedResumeText is always included in the response
    const responseData = {
      ...profile.toObject(),
      parsedResumeText: profile.parsedResumeText || '',
      resumePDF: profile.resumePDF || ''
    };
    
    return NextResponse.json(responseData, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const userData = getDataFromToken(request);
    if (!userData) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const reqBody = await request.json();

    const profile = await Profile.findOneAndUpdate(
      { user: userData.id },
      { ...reqBody, user: userData.id },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ message: "Profile updated successfully", profile }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}