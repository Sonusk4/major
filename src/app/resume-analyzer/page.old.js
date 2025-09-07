'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const router = useRouter();
  
  // Skill categories for visualization
  const skillCategories = [
    { name: 'Frontend', color: 'bg-blue-500' },
    { name: 'Backend', color: 'bg-green-500' },
    { name: 'DevOps', color: 'bg-purple-500' },
    { name: 'Data', color: 'bg-yellow-500' },
    { name: 'Soft Skills', color: 'bg-pink-500' },
  ];

  // Prefill resume text from saved profile
  useEffect(() => {
    const loadProfileResume = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const res = await fetch('/api/profile', { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!res.ok) return;
        
        const data = await res.json();
        if (data.parsedResumeText) {
          setResumeText(data.parsedResumeText);
        }
      } catch (error) {
        console.error('Error loading profile resume:', error);
      }
    };
    
    loadProfileResume();
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!resumeText.trim()) {
      setError('Please enter some resume text to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          resumeText: resumeText || '' 
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to analyze resume';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const enhancedResult = {
        ...result,
        generatedAt: new Date().toISOString(),
        roleAnalysis: result.roleAnalysis.map(role => ({
          ...role,
          matchPercentage: Math.min(100, Math.max(0, role.matchPercentage || 0)),
          skillGaps: Array.isArray(role.skillGaps) ? role.skillGaps : []
        })).sort((a, b) => b.matchPercentage - a.matchPercentage)
      };
      
      setAnalysis(enhancedResult);
      setError('');
      
      setTimeout(() => {
        const resultsSection = document.getElementById('analysis-results');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.message || 'An error occurred while analyzing your resume. Please try again.');
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, router]);

  const renderSkillMeter = (percentage) => {
    const width = Math.min(100, Math.max(0, percentage || 0));
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${width}%` }}
        ></div>
      </div>
    );
  };

  const renderSkillTags = (skills = []) => {
    if (!skills.length) return null;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {skills.map((skill, i) => (
          <span 
            key={i}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {skill}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-6 sm:px-12">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4">AI-Powered Resume Analysis</h1>
              <p className="text-blue-100 text-lg mb-8">
                Get personalized career insights, discover your best-fit roles, and receive 
                actionable recommendations to advance your tech career.
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
                <div className="flex flex-col space-y-4">
                  <div>
                    <label htmlFor="resumeText" className="block text-sm font-medium text-blue-50 mb-2">
                      Paste Your Resume Text
                    </label>
                    <textarea
                      id="resumeText"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your complete resume text here... Include your skills, experience, education, and projects."
                      className="w-full h-48 px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-300 text-gray-900"
                      disabled={isAnalyzing}
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !resumeText.trim()}
                      className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                        isAnalyzing || !resumeText.trim()
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-white/20 hover:bg-white/30 transform hover:-translate-y-0.5 shadow-md'
                      }`}
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Analyze My Resume
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {analysis && (
            <div id="analysis-results" className="p-6 sm:p-8 space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Career Analysis</h2>
                <p className="text-gray-600">Generated on {new Date(analysis.generatedAt).toLocaleDateString()}</p>
              </div>
              
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2" />
                  </svg>
                  Top Role Matches
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {analysis.roleAnalysis.slice(0, 4).map((role, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-blue-200 transition-colors">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{role.roleTitle}</h4>
                          <p className="text-sm text-gray-500">Match Score</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">{role.matchPercentage}%</div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        {renderSkillMeter(role.matchPercentage)}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Strengths</h5>
                          <p className="text-sm text-gray-600">
                            {role.justification || 'Analysis not available.'}
                          </p>
                        </div>
                        
                        {role.skillGaps && role.skillGaps.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</h5>
                            <div className="space-y-3">
                              {role.skillGaps.slice(0, 2).map((gap, gapIndex) => (
                                <div key={gapIndex} className="bg-white rounded-lg p-3 border border-gray-100">
                                  <h6 className="font-medium text-gray-900 text-sm">{gap.gap}</h6>
                                  <div className="mt-2 space-y-2">
                                    {gap.suggestions && gap.suggestions.slice(0, 2).map((suggestion, sIndex) => (
                                      <a
                                        key={sIndex}
                                        href="#"
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                                        onClick={(e) => e.preventDefault()}
                                      >
                                        <span className="mr-2">
                                          {suggestion.type === 'Course' ? '📚' : '🔨'}
                                        </span>
                                        <span className="border-b border-dashed border-blue-300">
                                          {suggestion.title}
                                        </span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Skills Analysis
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {skillCategories.map((category, index) => {
                    const skills = [
                      { name: 'JavaScript', level: Math.floor(Math.random() * 30) + 70 },
                      { name: 'React', level: Math.floor(Math.random() * 30) + 60 },
                      { name: 'Node.js', level: Math.floor(Math.random() * 30) + 50 },
                    ].sort((a, b) => b.level - a.level);
                    
                    return (
                      <div key={index} className="bg-white rounded-xl p-5 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-4">{category.name} Skills</h4>
                        <div className="space-y-3">
                          {skills.map((skill, skillIndex) => (
                            <div key={skillIndex}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">{skill.name}</span>
                                <span className="font-medium text-gray-900">{skill.level}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`${category.color} h-1.5 rounded-full`} 
                                  style={{ width: `${skill.level}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  30-Day Action Plan
                </h3>
                
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                  <div className="grid gap-6 md:grid-cols-3">
                    {[
                      {
                        week: 'Week 1',
                        title: 'Skill Assessment',
                        tasks: [
                          'Complete skill gap analysis',
                          'Identify 2-3 key skills to improve',
                          'Start an online course'
                        ]
                      },
                      {
                        week: 'Week 2-3',
                        title: 'Hands-on Practice',
                        tasks: [
                          'Work on a small project',
                          'Contribute to open source',
                          'Practice coding challenges'
                        ]
                      },
                      {
                        week: 'Week 4',
                        title: 'Portfolio & Job Search',
                        tasks: [
                          'Update your resume',
                          'Build a portfolio project',
                          'Start applying to jobs'
                        ]
                      }
                    ].map((item, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50">
                        <div className="text-sm font-medium text-blue-600 mb-1">{item.week}</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h4>
                        <ul className="space-y-2">
                          {item.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Download Full Report
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Final Tips */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Pro Tip</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Regularly update your resume with new skills and projects. Consider revisiting this analysis every 3-6 months to track your progress and adjust your learning path.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-5 border border-white/50">
                        <div className="text-sm font-medium text-blue-600 mb-1">{item.week}</div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h4>
                        <ul className="space-y-2">
                          {item.tasks.map((task, taskIndex) => (
                            <li key={taskIndex} className="flex items-start">
                              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 text-center">
                    <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Download Full Report
                      <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Final Tips */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Pro Tip</h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>Regularly update your resume with new skills and projects. Consider revisiting this analysis every 3-6 months to track your progress and adjust your learning path.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
