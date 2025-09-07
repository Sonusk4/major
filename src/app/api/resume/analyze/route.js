import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { dbConnect } from '@/lib/dbConnect';
import User from '@/models/User';
import Profile from '@/models/Profile';
import fs from 'fs';
import path from 'path';
import PDFParser from 'pdf2json';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { resumeText } = await request.json();
    
    // Get token from headers
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader); // Debug log
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized - No valid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    console.log('Token extracted:', token ? 'Token exists' : 'No token'); // Debug log
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug log
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    
    // Verify user exists
    const user = await User.findById(decoded.id);
    console.log('User found:', user ? 'Yes' : 'No'); // Debug log
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Try provided text first
    let textForAnalysis = (resumeText || '').trim();

    // Load profile once for potential fallbacks
    const profile = await Profile.findOne({ user: decoded.id });

    if (!textForAnalysis) {
      // Fallback to parsed resume stored in profile
      const stored = (profile?.parsedResumeText || '').trim();
      if (stored) {
        textForAnalysis = stored;
      } else if (profile?.resumePDF) {
        // As a further fallback, read the uploaded PDF from disk and extract text using pdf2json
        try {
          const publicDir = path.join(process.cwd(), 'public');
          const pdfPath = path.join(publicDir, profile.resumePDF.replace(/^\//, ''));
          if (fs.existsSync(pdfPath)) {
            const buffer = fs.readFileSync(pdfPath);
            const pdfParser = new PDFParser();
            const text = await new Promise((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('PDF parsing timeout')), 30000);
              pdfParser.on('pdfParser_dataError', errData => {
                clearTimeout(timeout);
                reject(errData.parserError || new Error('PDF parse error'));
              });
              pdfParser.on('pdfParser_dataReady', () => {
                clearTimeout(timeout);
                resolve(pdfParser.getRawTextContent() || '');
              });
              pdfParser.parseBuffer(buffer);
            });
            if (text) {
              textForAnalysis = String(text).trim();
            }
          }
        } catch (fileErr) {
          console.error('Error extracting text from uploaded PDF (pdf2json):', fileErr);
        }
      }
    }

    // Final fallback: build text from known profile fields if parsing yielded little/no text
    if (!textForAnalysis || textForAnalysis.length < 50) {
      const headline = (profile?.headline || '').trim();
      const bio = (profile?.bio || '').trim();
      const skills = Array.isArray(profile?.skills) ? profile.skills.join(', ') : '';
      const synthetic = [headline, bio, skills].filter(Boolean).join('\n');
      if (synthetic && synthetic.length >= 20) {
        textForAnalysis = synthetic;
      }
    }

    // Try Gemini AI first; if unavailable, fall back to local heuristic
    let analysis;
    try {
      analysis = await analyzeWithGemini(textForAnalysis);
    } catch (aiErr) {
      console.error('Gemini analysis failed, falling back. Reason:', aiErr?.message || aiErr);
      analysis = await analyzeResumeWithAI(textForAnalysis);
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Resume analysis error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

async function analyzeWithGemini(resumeText) {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });

  const prompt = `You are an expert career coach and resume analyst. Analyze the following resume text and provide a comprehensive analysis in the specified JSON format.

RESPONSE FORMAT (JSON ONLY):
{
  "roleAnalysis": [{
    "roleTitle": "string",
    "matchPercentage": 0-100,
    "justification": "string",
    "skillGaps": [{
      "gap": "string",
      "suggestions": [{
        "title": "string",
        "type": "course|book|certification|project",
        "platform": "string",
        "link": "string"
      }]
    }]
  }],
  "skillAnalysis": {
    "technical": [{"name": "string", "level": 1-5, "relevance": 1-5}],
    "soft": [{"name": "string", "level": 1-5, "relevance": 1-5}],
    "languages": [{"name": "string", "proficiency": "basic|intermediate|advanced|native"}]
  },
  "actionPlan": [{
    "week": "string",
    "title": "string",
    "tasks": ["string"],
    "priority": "high|medium|low"
  }],
  "proTips": ["string"]
}

RULES:
1. Be specific and actionable in your analysis
2. Provide concrete suggestions with resources when possible
3. Focus on the most relevant skills and roles
4. Keep justifications concise but informative
5. For skill levels: 1=Beginner, 3=Intermediate, 5=Expert

RESUME TO ANALYZE:
${resumeText.substring(0, 15000)}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.();
    
    if (!text) {
      throw new Error('Empty response from Gemini API');
    }

    // Clean up the response to extract JSON
    let jsonString = text.trim();
    
    // Remove markdown code fences if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.substring(7);
    }
    if (jsonString.endsWith('```')) {
      jsonString = jsonString.substring(0, jsonString.length - 3);
    }
    if (jsonString.startsWith('```')) {
      jsonString = jsonString.substring(3);
    }
    
    // Parse and validate the JSON response
    const parsed = JSON.parse(jsonString);
    
    // Validate and normalize the response
    if (!parsed) {
      throw new Error('Empty response from Gemini');
    }

    // Normalize role analysis
    const roleAnalysis = (Array.isArray(parsed.roleAnalysis) ? parsed.roleAnalysis : [])
      .slice(0, 5) // Limit to top 5 roles
      .map(item => ({
        roleTitle: String(item.roleTitle || 'Unspecified Role').trim(),
        matchPercentage: Math.max(0, Math.min(100, Math.round(Number(item.matchPercentage) || 0))),
        justification: String(item.justification || 'No justification provided').trim(),
        skillGaps: Array.isArray(item.skillGaps) ? item.skillGaps.slice(0, 3).map(gap => ({
          gap: String(gap.gap || 'Unspecified skill gap').trim(),
          suggestions: Array.isArray(gap.suggestions) ? gap.suggestions.slice(0, 3).map(suggestion => ({
            type: String(suggestion.type || 'resource').toLowerCase(),
            title: String(suggestion.title || 'Unspecified resource').trim(),
            platform: String(suggestion.platform || 'Various platforms').trim(),
            link: String(suggestion.link || '').trim()
          })) : []
        })) : []
      }));

    // Normalize skill analysis
    const skillAnalysis = {
      technical: (Array.isArray(parsed.skillAnalysis?.technical) ? parsed.skillAnalysis.technical : [])
        .slice(0, 10) // Limit to top 10 technical skills
        .map(skill => ({
          name: String(skill.name || 'Skill').trim(),
          level: Math.max(1, Math.min(5, Math.round(Number(skill.level) || 3))),
          relevance: Math.max(1, Math.min(5, Math.round(Number(skill.relevance) || 3)))
        })),
      soft: (Array.isArray(parsed.skillAnalysis?.soft) ? parsed.skillAnalysis.soft : [])
        .slice(0, 5) // Limit to top 5 soft skills
        .map(skill => ({
          name: String(skill.name || 'Skill').trim(),
          level: Math.max(1, Math.min(5, Math.round(Number(skill.level) || 3)))
        })),
      languages: (Array.isArray(parsed.skillAnalysis?.languages) ? parsed.skillAnalysis.languages : [])
        .slice(0, 5) // Limit to top 5 languages
        .map(lang => ({
          name: String(lang.name || 'Language').trim(),
          proficiency: ['basic', 'intermediate', 'advanced', 'native'].includes(String(lang.proficiency).toLowerCase())
            ? String(lang.proficiency).toLowerCase()
            : 'basic'
        }))
    };

    // Normalize action plan
    const actionPlan = (Array.isArray(parsed.actionPlan) ? parsed.actionPlan : [])
      .slice(0, 4) // Limit to 4 weeks
      .map(item => ({
        week: String(item.week || 'Week X').trim(),
        title: String(item.title || 'Weekly Goal').trim(),
        tasks: Array.isArray(item.tasks) 
          ? item.tasks.slice(0, 3).map(t => String(t || '').trim()).filter(Boolean)
          : [],
        priority: ['high', 'medium', 'low'].includes(String(item.priority).toLowerCase())
          ? String(item.priority).toLowerCase()
          : 'medium'
      }));

    // Normalize pro tips
    const proTips = (Array.isArray(parsed.proTips) ? parsed.proTips : [])
      .slice(0, 3) // Limit to 3 tips
      .map(tip => String(tip || '').trim())
      .filter(Boolean);

    return {
      roleAnalysis,
      skillAnalysis,
      actionPlan: actionPlan.length ? actionPlan : generateDefaultActionPlan(),
      proTips: proTips.length ? proTips : [
        'Regularly update your resume with new skills and projects.',
        'Consider getting certifications in your field to stand out.',
        'Network with professionals in your desired industry.'
      ]
    };
  } catch (error) {
    console.error('Error in analyzeWithGemini:', error);
    // Return a default response in case of errors
    return {
      roleAnalysis: [{
        roleTitle: 'Software Developer',
        matchPercentage: 70,
        justification: 'Analysis could not be completed due to an error.',
        skillGaps: []
      }]
    };
  }
}

async function analyzeResumeWithAI(resumeText) {
  // Fallback analysis when Gemini API fails
  const lowerResume = resumeText.toLowerCase();
  
  // Basic skill extraction with categories
  const allSkills = {
    technical: [
      { name: 'JavaScript', keywords: ['javascript', 'js', 'es6'] },
      { name: 'React', keywords: ['react', 'react.js'] },
      { name: 'Node.js', keywords: ['node', 'node.js', 'express'] },
      { name: 'Python', keywords: ['python', 'django', 'flask'] },
      { name: 'Java', keywords: ['java', 'spring', 'hibernate'] },
      { name: 'AWS', keywords: ['aws', 'amazon web services', 's3', 'lambda'] },
      { name: 'Docker', keywords: ['docker', 'containers'] },
      { name: 'SQL', keywords: ['sql', 'postgresql', 'mysql'] },
      { name: 'MongoDB', keywords: ['mongodb', 'nosql'] },
      { name: 'Git', keywords: ['git', 'github', 'gitlab'] }
    ],
    soft: [
      'Communication', 'Teamwork', 'Problem Solving', 
      'Leadership', 'Time Management', 'Adaptability'
    ]
  };

  // Extract technical skills
  const technicalSkills = allSkills.technical
    .filter(skill => 
      skill.keywords.some(keyword => lowerResume.includes(keyword))
    )
    .map(skill => ({
      name: skill.name,
      level: Math.floor(Math.random() * 3) + 3, // 3-5
      relevance: Math.floor(Math.random() * 3) + 3 // 3-5
    }));

  // Extract soft skills (random selection for fallback)
  const softSkills = allSkills.soft
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
    .map(skill => ({
      name: skill,
      level: Math.floor(Math.random() * 3) + 3 // 3-5
    }));

  // Role matching with more detailed scoring
  const roles = [
    { 
      title: 'Frontend Developer', 
      keywords: ['react', 'javascript', 'typescript', 'frontend', 'web', 'ui', 'ux', 'html', 'css', 'redux'],
      required: ['javascript', 'html', 'css']
    },
    { 
      title: 'Backend Developer', 
      keywords: ['node', 'python', 'java', 'api', 'server', 'database', 'rest', 'graphql', 'microservices'],
      required: ['api', 'database']
    },
    { 
      title: 'Full Stack Developer', 
      keywords: ['react', 'node', 'javascript', 'fullstack', 'express', 'mongodb', 'sql', 'frontend', 'backend'],
      required: ['javascript', 'api', 'database']
    },
    { 
      title: 'DevOps Engineer', 
      keywords: ['aws', 'docker', 'kubernetes', 'ci/cd', 'devops', 'azure', 'gcp', 'infrastructure', 'terraform'],
      required: ['docker', 'ci/cd']
    },
    { 
      title: 'Data Scientist', 
      keywords: ['python', 'machine learning', 'data analysis', 'pandas', 'numpy', 'tensorflow', 'pytorch', 'data visualization'],
      required: ['python', 'data analysis']
    }
  ];
  
  // Calculate role matches with more sophisticated scoring
  const roleScores = roles.map(role => {
    const keywordHits = role.keywords.filter(keyword => 
      lowerResume.includes(keyword)
    ).length;
    
    const requiredHits = role.required.filter(keyword =>
      lowerResume.includes(keyword)
    ).length;
    
    // Base score on keyword matches, with bonus for required skills
    const score = (keywordHits * 5) + (requiredHits * 20);
    const matchPercentage = Math.min(90, Math.max(10, score / 2));
    
    // Generate skill gaps based on missing required skills
    const missingRequired = role.required.filter(keyword => 
      !role.keywords.some(k => lowerResume.includes(k))
    );
    
    const skillGaps = missingRequired.length > 0 ? [{
      gap: `Missing required skill${missingRequired.length > 1 ? 's' : ''}: ${missingRequired.join(', ')}`,
      suggestions: [{
        title: `Learn ${missingRequired[0]}`,
        type: 'course',
        platform: 'Online Learning Platform',
        link: '#'
      }]
    }] : [];
    
    return {
      roleTitle: role.title,
      matchPercentage,
      justification: `Your resume shows ${keywordHits} relevant skills for this role.`,
      skillGaps
    };
  })
  .filter(r => r.matchPercentage >= 30) // Only show roles with at least 30% match
  .sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  // Generate a simple 4-week action plan
  const actionPlan = [
    {
      week: 'Week 1',
      title: 'Skill Assessment & Learning Plan',
      tasks: [
        'Identify top 3 skills to improve',
        'Set up development environment',
        'Complete first learning module'
      ],
      priority: 'high'
    },
    {
      week: 'Week 2',
      title: 'Hands-on Practice',
      tasks: [
        'Work on a small project',
        'Solve coding challenges',
        'Review documentation'
      ],
      priority: 'high'
    },
    {
      week: 'Week 3',
      title: 'Project Work',
      tasks: [
        'Start a portfolio project',
        'Implement new skills',
        'Write unit tests'
      ],
      priority: 'medium'
    },
    {
      week: 'Week 4',
      title: 'Polish & Apply',
      tasks: [
        'Complete portfolio project',
        'Update resume with new skills',
        'Apply to 5 relevant jobs'
      ],
      priority: 'high'
    }
  ];

  const roleAnalysis = roleScores.map(role => {
    // Generate skill gaps for each role
    const missingRequired = role.required.filter(keyword => 
      !role.keywords.some(k => lowerResume.includes(k))
    );
    
    const skillGaps = missingRequired.length > 0 ? missingRequired.slice(0, 3).map(skill => ({
      gap: `Lacking experience with ${skill}`,
      suggestions: [
        {
          type: 'Course',
          title: `Learn ${skill}`,
          platform: 'Pluralsight, Udemy, or Coursera'
        },
        {
          type: 'Project',
          title: `Build a project using ${skill}`,
          platform: 'GitHub'
        }
      ]
    })) : [{
      gap: 'No major skill gaps identified',
      suggestions: [{
        type: 'Next Step',
        title: 'Continue building projects',
        platform: 'Personal projects or open source'
      }]
    }];
    
    return {
      roleTitle: role.title,
      matchPercentage: role.matchPercentage,
      justification: role.justification,
      skillGaps
    };
  });
  
  // Sort by best match
  roleAnalysis.sort((a, b) => b.matchPercentage - a.matchPercentage);
  
  return { 
    roleAnalysis,
    skillAnalysis: {
      technical: technicalSkills,
      soft: softSkills,
      languages: [
        { name: 'English', proficiency: 'native' },
        { name: 'Hindi', proficiency: 'native' }
      ]
    },
    actionPlan: [
      {
        week: 'Week 1',
        title: 'Skill Assessment & Learning Plan',
        tasks: [
          'Identify top 3 skills to improve',
          'Set up development environment',
          'Complete first learning module'
        ],
        priority: 'high'
      },
      {
        week: 'Week 2',
        title: 'Hands-on Practice',
        tasks: [
          'Work on a small project',
          'Solve coding challenges',
          'Review documentation'
        ],
        priority: 'high'
      },
      {
        week: 'Week 3',
        title: 'Project Work',
        tasks: [
          'Start a portfolio project',
          'Implement new skills',
          'Write unit tests'
        ],
        priority: 'medium'
      },
      {
        week: 'Week 4',
        title: 'Polish & Apply',
        tasks: [
          'Complete portfolio project',
          'Update resume with new skills',
          'Apply to 5 relevant jobs'
        ],
        priority: 'high'
      }
    ],
    proTips: [
      'Focus on building projects that showcase your skills',
      'Contribute to open source to gain experience',
      'Network with professionals in your target industry'
    ]
  };
}

function extractSkills(resumeText) {
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'mongodb',
    'docker', 'kubernetes', 'aws', 'azure', 'html', 'css', 'typescript',
    'vue', 'angular', 'express', 'django', 'flask', 'machine learning',
    'pandas', 'numpy', 'tensorflow', 'pytorch', 'git', 'jenkins',
    'linux', 'bash', 'api', 'rest', 'graphql', 'microservices'
  ];
  
  return skillKeywords.filter(skill => resumeText.includes(skill));
}

function extractExperience(resumeText) {
  // Simple experience extraction - look for years mentioned
  const yearMatches = resumeText.match(/(\d+)\s*(?:years?|yrs?)/gi);
  if (yearMatches) {
    const years = yearMatches.map(match => parseInt(match.match(/\d+/)[0]));
    return Math.max(...years);
  }
  return 0;
}

function extractEducation(resumeText) {
  const educationKeywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college'];
  return educationKeywords.some(keyword => resumeText.includes(keyword));
}
