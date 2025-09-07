'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function InterviewPracticePage() {
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const jobRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
    'Machine Learning Engineer',
    'Cloud Engineer',
    'Cybersecurity Analyst'
  ];

  const startInterview = async () => {
    if (!resumeText.trim() || !targetRole) {
      setError('Please provide both resume text and select a target role');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          resumeText, 
          targetRole,
          conversationHistory: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation([data.message]);
        setIsInterviewStarted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to start interview');
      }
    } catch (err) {
      setError('An error occurred while starting the interview');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resumeText,
          targetRole,
          conversationHistory: [...conversation, userMessage]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setConversation(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to get response');
      }
    } catch (err) {
      setError('An error occurred while sending message');
    } finally {
      setIsLoading(false);
    }
  };

  const resetInterview = () => {
    setConversation([]);
    setIsInterviewStarted(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Interview Practice</h1>
            <p className="text-gray-900 max-w-2xl mx-auto">
              Practice your interview skills with AVA (AI Virtual Advisor). Get personalized questions 
              based on your resume and target role to improve your interview performance.
            </p>
          </div>

          {!isInterviewStarted ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="resumeText" className="block text-sm font-medium text-gray-700 mb-2">
                  Paste Your Resume Text
                </label>
                <textarea
                  id="resumeText"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your complete resume text here... Include your skills, experience, education, and projects."
                  className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="targetRole" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Target Role
                </label>
                <select
                  id="targetRole"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a role...</option>
                  {jobRoles.map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={startInterview}
                  disabled={isLoading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Starting Interview...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <i className="fas fa-play mr-2"></i>
                      Start Interview with AVA
                    </span>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Interviewing for: {targetRole}
                </h2>
                <button
                  onClick={resetInterview}
                  className="text-gray-900 hover:text-gray-700 text-sm font-medium"
                >
                  <i className="fas fa-refresh mr-1"></i>
                  Start New Interview
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.role === 'user' ? 'You' : 'AVA'}
                        </div>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="text-sm font-medium mb-1">AVA</div>
                        <div className="text-sm">
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Typing...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Type your response..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      sendMessage(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <button
                  onClick={(e) => {
                    const input = e.target.previousElementSibling;
                    if (input.value.trim() && !isLoading) {
                      sendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>

              <div className="text-center text-sm text-gray-900">
                <p>💡 Tip: Be specific and detailed in your responses. AVA will ask follow-up questions based on your answers.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
