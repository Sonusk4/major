import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { resumeText, targetRole, conversationHistory } = await request.json();
    
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

    if (!conversationHistory || conversationHistory.length === 0) {
      return NextResponse.json({ message: 'Conversation history is required' }, { status: 400 });
    }

    // Get the last user message
    const lastUserMessage = conversationHistory[conversationHistory.length - 1];
    if (lastUserMessage.role !== 'user') {
      return NextResponse.json({ message: 'Last message must be from user' }, { status: 400 });
    }

    // Generate AVA's response based on the conversation context
    const avaResponse = await generateAvaResponse(
      resumeText, 
      targetRole, 
      conversationHistory, 
      lastUserMessage.content
    );

    return NextResponse.json({ message: avaResponse });
  } catch (error) {
    console.error('Interview chat error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function generateAvaResponse(resumeText, targetRole, conversationHistory, userMessage) {
  const conversationLength = conversationHistory.length;
  
  // Determine the type of response based on conversation length and content
  if (conversationLength <= 3) {
    // Early in conversation - ask follow-up technical questions
    return generateTechnicalFollowUp(userMessage, resumeText, targetRole);
  } else if (conversationLength <= 6) {
    // Middle of conversation - mix technical and behavioral questions
    return generateMixedQuestion(userMessage, resumeText, targetRole);
  } else {
    // Later in conversation - focus on behavioral and situational questions
    return generateBehavioralQuestion(userMessage, resumeText, targetRole);
  }
}

function generateTechnicalFollowUp(userMessage, resumeText, targetRole) {
  const lowerMessage = userMessage.toLowerCase();
  const skills = extractSkillsFromResume(resumeText);
  
  // Check what the user mentioned in their response
  if (lowerMessage.includes('optimiz') || lowerMessage.includes('performance')) {
    return "That's interesting! When you mention optimization, what specific metrics did you use to measure the improvement? And what tools or techniques did you employ for monitoring performance?";
  }
  
  if (lowerMessage.includes('database') || lowerMessage.includes('sql') || lowerMessage.includes('mongodb')) {
    return "Great! Database work is crucial. Could you walk me through your database design decisions? What considerations did you make regarding scalability and data integrity?";
  }
  
  if (lowerMessage.includes('api') || lowerMessage.includes('rest') || lowerMessage.includes('endpoint')) {
    return "Excellent! API development is a key skill. How did you handle error handling and authentication in your API? What was your approach to API documentation?";
  }
  
  if (lowerMessage.includes('frontend') || lowerMessage.includes('ui') || lowerMessage.includes('user interface')) {
    return "That's great! User experience is so important. How did you approach responsive design and accessibility? What was your process for gathering user feedback?";
  }
  
  // Default technical follow-up
  const primarySkill = skills[0] || 'technology';
  return `Thanks for sharing that! I'd like to dive deeper into your ${primarySkill} experience. Can you tell me about a specific challenge you encountered while working with ${primarySkill} and how you debugged or resolved it?`;
}

function generateMixedQuestion(userMessage, resumeText, targetRole) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for team collaboration mentions
  if (lowerMessage.includes('team') || lowerMessage.includes('collaborat') || lowerMessage.includes('work with')) {
    return "That sounds like a great team experience! Can you tell me about a time when you had a disagreement with a team member on a technical decision? How did you handle it and what was the outcome?";
  }
  
  // Check for problem-solving mentions
  if (lowerMessage.includes('problem') || lowerMessage.includes('challenge') || lowerMessage.includes('issue')) {
    return "Problem-solving is a crucial skill. What's your typical approach when you encounter a bug or issue you've never seen before? Walk me through your debugging process.";
  }
  
  // Check for learning mentions
  if (lowerMessage.includes('learn') || lowerMessage.includes('new') || lowerMessage.includes('first time')) {
    return "Learning new technologies is essential in our field. How do you typically approach learning a new framework or technology? What resources do you find most helpful?";
  }
  
  // Default mixed question
  return "That's really insightful! Now, let me ask you a situational question: If you were given a project with an unclear scope and tight deadline, how would you approach it? What steps would you take to ensure success?";
}

function generateBehavioralQuestion(userMessage, resumeText, targetRole) {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for leadership or mentoring mentions
  if (lowerMessage.includes('lead') || lowerMessage.includes('mentor') || lowerMessage.includes('guide')) {
    return "Leadership experience is valuable! Can you tell me about a time when you had to mentor a junior developer? What was the most challenging aspect and how did you help them grow?";
  }
  
  // Check for failure or mistake mentions
  if (lowerMessage.includes('fail') || lowerMessage.includes('mistake') || lowerMessage.includes('wrong')) {
    return "It's important to learn from mistakes. What's the most significant technical mistake you've made in your career? How did you handle it and what did you learn from it?";
  }
  
  // Check for success or achievement mentions
  if (lowerMessage.includes('success') || lowerMessage.includes('achieve') || lowerMessage.includes('proud')) {
    return "That's an impressive achievement! What do you think contributed most to that success? And how do you think that experience has prepared you for the challenges you might face in a ${targetRole} role?";
  }
  
  // Default behavioral questions
  const behavioralQuestions = [
    "Great conversation so far! Let me ask you about your career goals: Where do you see yourself in 3-5 years, and how does this ${targetRole} position align with those goals?",
    "Excellent! One final question: What's your approach to staying updated with the latest technologies and industry trends? How do you ensure you're continuously learning and growing?",
    "That's very insightful! As we wrap up, can you tell me about a time when you had to work with a difficult stakeholder or client? How did you manage the relationship and ensure project success?"
  ];
  
  return behavioralQuestions[Math.floor(Math.random() * behavioralQuestions.length)];
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
