import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Profile from '@/models/Profile';
import Project from '@/models/Project';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getDataFromToken = (request) => {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1] || '';
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export async function GET(request, { params }) {
  await dbConnect();
  try {
    const userData = getDataFromToken(request);
    if (!userData) {
      return NextResponse.json({ 
        message: "Unauthorized" 
      }, { status: 401 });
    }

    const { projectId } = await params;

    const profile = await Profile.findOne({ user: userData.id });
    const project = await Project.findById(projectId);

    console.log('User ID:', userData.id);
    console.log('Profile found:', !!profile);
    console.log('Profile data:', profile);
    console.log('Project found:', !!project);

    if (!profile) {
      return NextResponse.json({ message: "Profile not found. Please upload a resume first." }, { status: 404 });
    }
    if (!profile.parsedResumeText) {
      return NextResponse.json({ message: "Resume text not found. Please upload a resume first." }, { status: 404 });
    }
    if (!project) {
      return NextResponse.json({ message: "Project not found." }, { status: 404 });
    }

    const prompt = `
      Analyze the following resume based on the job description for a "${project.title}".
      JOB DESCRIPTION: "${project.description}"
      Required Skills: ${project.requiredSkills.join(', ')}
      RESUME TEXT: "${profile.parsedResumeText}"
      Based on the analysis, provide a response in JSON format. The JSON object should have the following structure and nothing else:
      {
        "matchScore": <A number between 0 and 100>,
        "assessmentTitle": "<A short, encouraging title like 'Good Match'>",
        "executiveSummary": "<A 2-3 sentence professional summary>",
        "strengths": ["<A bullet point describing a strength.>"],
        "weaknesses": ["<A bullet point describing a weakness.>"],
        "missingKeywords": ["<An array of important missing keywords>"]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const jsonResponse = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, '').trim());

    return NextResponse.json(jsonResponse, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "An error occurred during AI analysis." }, { status: 500 });
  }
}