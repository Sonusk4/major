import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { resumeText, targetRole } = await request.json();
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!resumeText || !targetRole) {
      return NextResponse.json({ message: 'Resume text and target role are required' }, { status: 400 });
    }

    // Generate initial interview question based on resume and target role
    const initialQuestion = await generateInitialQuestion(resumeText, targetRole);

    return NextResponse.json({ message: initialQuestion });
  } catch (error) {
    console.error('Interview start error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function generateInitialQuestion(resumeText, targetRole) {
  // Extract key information from resume
  const skills = extractSkillsFromResume(resumeText);
  const projects = extractProjectsFromResume(resumeText);
  const experience = extractExperienceFromResume(resumeText);
  
  // Generate contextual greeting and first question
  const greeting = `Hello! I'm AVA, your AI Virtual Advisor. I'm here to help you practice for your ${targetRole} interview. I've reviewed your resume and I'm excited to learn more about your experience.`;
  
  let firstQuestion = '';
  
  if (projects.length > 0) {
    const recentProject = projects[0];
    firstQuestion = `I see on your resume that you worked on ${recentProject}. Could you walk me through your specific contributions to that project and what technologies you used?`;
  } else if (skills.length > 0) {
    const primarySkill = skills[0];
    firstQuestion = `I notice you have experience with ${primarySkill}. Could you tell me about a specific project or challenge where you used ${primarySkill} and how you approached solving it?`;
  } else if (experience > 0) {
    firstQuestion = `You mentioned ${experience} years of experience in your field. Could you tell me about a significant challenge you faced in your most recent role and how you overcame it?`;
  } else {
    firstQuestion = `I'd like to start by understanding your background better. Could you tell me about your educational journey and what initially drew you to ${targetRole}?`;
  }
  
  return `${greeting}\n\n${firstQuestion}`;
}

function extractSkillsFromResume(resumeText) {
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
    'docker', 'kubernetes', 'aws', 'azure', 'html', 'css', 'typescript',
    'vue', 'angular', 'express', 'django', 'flask', 'machine learning',
    'pandas', 'numpy', 'tensorflow', 'pytorch', 'git', 'jenkins',
    'linux', 'bash', 'api', 'rest', 'graphql', 'microservices'
  ];
  
  return skillKeywords.filter(skill => resumeText.toLowerCase().includes(skill));
}

function extractProjectsFromResume(resumeText) {
  // Simple project extraction - look for project-related keywords
  const projectKeywords = ['project', 'application', 'system', 'platform', 'website', 'app'];
  const sentences = resumeText.split(/[.!?]+/);
  
  const projectSentences = sentences.filter(sentence => 
    projectKeywords.some(keyword => sentence.toLowerCase().includes(keyword))
  );
  
  return projectSentences.slice(0, 3); // Return top 3 project mentions
}

function extractExperienceFromResume(resumeText) {
  const yearMatches = resumeText.match(/(\d+)\s*(?:years?|yrs?)/gi);
  if (yearMatches) {
    const years = yearMatches.map(match => parseInt(match.match(/\d+/)[0]));
    return Math.max(...years);
  }
  return 0;
}
