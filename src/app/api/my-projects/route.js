import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Project from '@/models/Project';
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
    if (!userData || userData.role !== 'cofounder') {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const projects = await Project.find({ createdBy: userData.id })
      .populate('applicants', 'name email');

    return NextResponse.json({ projects }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}