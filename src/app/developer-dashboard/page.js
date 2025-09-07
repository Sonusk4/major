'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function DeveloperDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch('/api/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          const data = await res.json();
          setError(data.message || "Failed to load profile.");
        }
      } catch (err) {
        setError("An error occurred while fetching profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [router]);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <Navbar />
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl">
              <i className="fas fa-code text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Developer Dashboard</h1>
          </div>
          <div className="mt-3 md:mt-0 flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="font-medium text-white">{user?.name || 'Developer'}!</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'D'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-800/30 rounded-2xl p-6 mb-10 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name?.split(' ')[0] || 'Developer'}! 👋</h2>
            <p className="text-blue-100 max-w-2xl">Your personalized dashboard is ready. Check your latest matches and career insights below.</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full"></div>
          <div className="absolute -right-5 -top-5 w-24 h-24 bg-cyan-500/10 rounded-full"></div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <i className="fas fa-briefcase text-blue-400"></i>
              </div>
              <span className="text-xs px-2 py-1 bg-green-900/30 text-green-400 rounded-full border border-green-800">+2.5%</span>
            </div>
            <div className="text-2xl font-bold text-white">24</div>
            <p className="text-sm text-gray-400">Applied Jobs</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <i className="fas fa-check-circle text-green-400"></i>
              </div>
              <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800">+5.2%</span>
            </div>
            <div className="text-2xl font-bold text-white">8</div>
            <p className="text-sm text-gray-400">Interviews</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <i className="fas fa-star text-yellow-400"></i>
              </div>
              <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-400 rounded-full border border-purple-800">New</span>
            </div>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-sm text-gray-400">Saved Jobs</p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-xl border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <i className="fas fa-bell text-purple-400"></i>
              </div>
              <span className="text-xs px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full border border-yellow-800">3 New</span>
            </div>
            <div className="text-2xl font-bold text-white">5</div>
            <p className="text-sm text-gray-400">Notifications</p>
          </div>
        </div>

        {/* AI Career Tools Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">AI Career Tools</h2>
              <p className="text-gray-400">Powered by our advanced AI to boost your career</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 text-white">
                All Tools
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">
                New
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Resume Analyzer Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="p-3 bg-blue-500/10 rounded-xl mr-4">
                  <i className="fas fa-file-alt text-blue-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Resume Analyzer</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800">
                      AI-Powered
                    </span>
                    <span className="ml-2 text-xs text-gray-400">Updated 2 days ago</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Get AI-powered insights about your resume. Discover job roles you&apos;re qualified for, 
                match percentages, and personalized recommendations to improve your career prospects.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <span>Job role matching with percentage scores</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <span>Skill gap analysis and recommendations</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <span>Course and certification suggestions</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link 
                  href="/resume-analyzer" 
                  className="inline-flex items-center bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                >
                  <i className="fas fa-magic mr-2"></i>
                  Analyze My Resume
                </Link>
                <span className="text-xs text-gray-400">
                  <i className="fas fa-clock mr-1"></i> 5 min
                </span>
              </div>
            </div>

            {/* Interview Practice Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
              <div className="flex items-start mb-6">
                <div className="p-3 bg-green-500/10 rounded-xl mr-4">
                  <i className="fas fa-comments text-green-400 text-xl"></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Interview Practice</h3>
                  <div className="flex items-center mt-1">
                    <span className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full border border-green-800">
                      New Feature
                    </span>
                    <span className="ml-2 text-xs text-gray-400">With AVA (AI Virtual Advisor)</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 mb-6">
                Practice your interview skills with AVA (AI Virtual Advisor). Get personalized questions 
                based on your resume and target role to improve your interview performance.
              </p>
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <span>Personalized questions based on your resume</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <span>Technical and behavioral interview practice</span>
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <i className="fas fa-check-circle text-green-400 mr-3"></i>
                  <span>Real-time conversation with AI interviewer</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Link 
                  href="/interview-practice" 
                  className="inline-flex items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
                >
                  <i className="fas fa-play mr-2"></i>
                  Start Practice
                </Link>
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-2">
                    <div className="w-6 h-6 rounded-full bg-blue-400 border-2 border-gray-800"></div>
                    <div className="w-6 h-6 rounded-full bg-purple-400 border-2 border-gray-800"></div>
                    <div className="w-6 h-6 rounded-full bg-yellow-400 border-2 border-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-900">5+</div>
                  </div>
                  <span className="text-xs text-gray-400">Active now</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
              <p className="text-gray-400">Get where you need to go, faster</p>
            </div>
            <Link href="/projects" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
              View all <i className="fas fa-chevron-right ml-1 text-xs"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/projects" 
              className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg mr-4 group-hover:bg-blue-500/20 transition-colors duration-300">
                  <i className="fas fa-briefcase text-blue-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">Browse Projects</h3>
              </div>
              <p className="text-gray-400 text-sm">Find exciting projects to work on</p>
              <div className="mt-4 flex items-center text-xs text-blue-400">
                <span>Explore now</span>
                <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
              </div>
            </Link>

            <Link 
              href="/my-applications" 
              className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg mr-4 group-hover:bg-green-500/20 transition-colors duration-300">
                  <i className="fas fa-paper-plane text-green-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-white group-hover:text-green-400 transition-colors duration-300">My Applications</h3>
              </div>
              <p className="text-gray-400 text-sm">Track your project applications</p>
              <div className="mt-4 flex items-center text-xs text-green-400">
                <span>View status</span>
                <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
              </div>
            </Link>

            <Link 
              href="/profile" 
              className="group bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg mr-4 group-hover:bg-purple-500/20 transition-colors duration-300">
                  <i className="fas fa-user text-purple-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors duration-300">Update Profile</h3>
              </div>
              <p className="text-gray-400 text-sm">Keep your profile current</p>
              <div className="mt-4 flex items-center text-xs text-purple-400">
                <span>Edit profile</span>
                <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
              </div>
            </Link>
          </div>
        </div>

        {/* Career Tips Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-blue-800/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/10 rounded-full -ml-16 -mb-16"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Career Tips</h2>
                <p className="text-blue-100">Expert advice to boost your career</p>
              </div>
              <div className="flex space-x-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-800/50 text-blue-300 hover:bg-blue-700/50 transition-colors">
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
                <button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 mb-4">
                  <i className="fas fa-lightbulb"></i>
                </div>
                <h3 className="font-semibold text-white mb-3">Resume Optimization</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Use our Resume Analyzer to identify skill gaps and get personalized recommendations 
                  for courses and certifications that can boost your career prospects.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400 mb-4">
                  <i className="fas fa-bullseye"></i>
                </div>
                <h3 className="font-semibold text-white mb-3">Interview Preparation</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Practice with AVA to improve your interview skills. Get comfortable with both 
                  technical questions and behavioral scenarios specific to your target role.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 mb-4">
                  <i className="fas fa-chart-line"></i>
                </div>
                <h3 className="font-semibold text-white mb-3">Skill Development</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Focus on building both technical and soft skills. Our AI tools can help you 
                  identify the most valuable skills for your target roles.
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">🤝 Networking</h3>
              <p className="text-gray-900 text-sm">
                Connect with other developers through our project platform. Collaboration 
                opportunities can lead to valuable learning experiences and career growth.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
