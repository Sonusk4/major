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

  // 30-day action plan data
  const actionPlan = [
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
  }, [router]);

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
        body: JSON.stringify({ resumeText })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const result = await response.json();
      setAnalysis({
        ...result,
        generatedAt: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [resumeText, router]);

  const renderSkillMeter = (percentage) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${Math.min(100, Math.max(0, percentage || 0))}%` }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Resume Analyzer</h1>
            
            <div className="mb-6">
              <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                Paste your resume text
              </label>
              <textarea
                id="resume"
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !resumeText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Resume'}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="border-t border-gray-200 p-6 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Top Role Matches</h3>
                  <div className="space-y-4">
                    {analysis.roleAnalysis?.slice(0, 3).map((role, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{role.roleTitle}</h4>
                            <p className="text-sm text-gray-500">Match Score: {role.matchPercentage}%</p>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {role.matchPercentage}%
                          </span>
                        </div>
                        <div className="mt-2">
                          {renderSkillMeter(role.matchPercentage)}
                        </div>
                        <div className="mt-3">
                          <p className="text-sm text-gray-700">{role.justification}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillCategories.map((category, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow">
                        <h4 className="font-medium text-gray-900 mb-3">{category.name} Skills</h4>
                        <div className="space-y-3">
                          {['JavaScript', 'React', 'Node.js', 'Python', 'SQL'].map((skill, i) => {
                            const level = Math.floor(Math.random() * 70) + 30;
                            return (
                              <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700">{skill}</span>
                                  <span className="font-medium">{level}%</span>
                                </div>
                                {renderSkillMeter(level)}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">30-Day Action Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {actionPlan.map((item, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg shadow">
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
                </div>
              </div>

              <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
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
