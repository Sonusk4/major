'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState(null);

  useEffect(() => {
    const fetchMyProjects = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/my-projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        } else {
          const data = await res.json();
          setError(data.message || "Failed to load projects.");
        }
      } catch (err) {
        setError("An error occurred while fetching projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyProjects();
  }, []);

  const toggleApplicants = (projectId) => {
    setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
  };
  
  const totalProjects = projects.length;
  const totalApplicants = projects.reduce((sum, project) => sum + project.applicants.length, 0);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <i className="fas fa-rocket text-blue-400 text-2xl"></i>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Co-founder Hub</h1>
          </div>
          <Link 
            href="/post-project" 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-blue-500/20"
          >
            <i className="fas fa-plus mr-2"></i>
            Post New Project
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <i className="fas fa-project-diagram text-blue-400 text-xl"></i>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Active</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalProjects}</div>
            <div className="text-gray-400 text-sm">Total Projects Posted</div>
            <div className="h-1 w-full bg-gray-700 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <i className="fas fa-users text-green-400 text-xl"></i>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Total</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalApplicants}</div>
            <div className="text-gray-400 text-sm">Total Applicants</div>
            <div className="h-1 w-full bg-gray-700 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <i className="fas fa-clock text-purple-400 text-xl"></i>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Pending</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{totalProjects}</div>
            <div className="text-gray-400 text-sm">Projects Awaiting Review</div>
            <div className="h-1 w-full bg-gray-700 mt-3 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Your Posted Projects</h2>
              <p className="text-gray-400">Manage and review your project listings</p>
            </div>
            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
              <button className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 text-white">
                All
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">
                Active
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">
                Drafts
              </button>
            </div>
          </div>
          
          {projects.length > 0 ? projects.map((project) => (
            <div key={project._id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <i className="fas fa-project-diagram text-blue-400"></i>
                      </div>
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center">
                        <i className="far fa-calendar-alt mr-2"></i>
                        {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center">
                        <i className="fas fa-user-friends mr-2"></i>
                        {project.applicants.length} Applicants
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-800">
                        <i className="fas fa-circle text-[6px] mr-2"></i>
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-4 md:mt-0">
                    <button 
                      onClick={() => toggleApplicants(project._id)} 
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center"
                    >
                      <i className="fas fa-users mr-2"></i>
                      {expandedProjectId === project._id ? 'Hide' : 'View'} Applicants
                      <i className={`fas fa-chevron-${expandedProjectId === project._id ? 'up' : 'down'} ml-2 transition-transform`}></i>
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center">
                      <i className="fas fa-edit mr-2"></i>
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              {expandedProjectId === project._id && (
                <div className="border-t border-gray-700 bg-gray-800/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-white">Applicants <span className="text-gray-400">({project.applicants.length})</span></h4>
                    <div className="relative">
                      <select className="appearance-none bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 pr-8">
                        <option>Sort by: Newest</option>
                        <option>Sort by: Experience</option>
                        <option>Sort by: Skills Match</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {project.applicants.length > 0 ? project.applicants.map((applicant) => (
                      <div key={applicant._id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-750 transition-colors duration-200">
                        <div className="flex items-start md:items-center space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
                              {applicant.name.charAt(0)}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-gray-800 rounded-full"></span>
                          </div>
                          <div>
                            <h5 className="font-semibold text-white">{applicant.name}</h5>
                            <p className="text-gray-400 text-sm mt-1">{applicant.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-xs px-2.5 py-1 bg-blue-900/30 text-blue-400 rounded-full border border-blue-800">
                                Frontend
                              </span>
                              <span className="text-xs px-2.5 py-1 bg-green-900/30 text-green-400 rounded-full border border-green-800">
                                React
                              </span>
                              <span className="text-xs px-2.5 py-1 bg-purple-900/30 text-purple-400 rounded-full border border-purple-800">
                                +3 more
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 mt-4 md:mt-0">
                          <Link 
                            href={`/profile/${applicant._id}`} 
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center text-sm"
                          >
                            <i className="far fa-eye mr-2"></i>
                            View Profile
                          </Link>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center text-sm">
                            <i className="far fa-comment-dots mr-2"></i>
                            Message
                          </button>
                        </div>
                      </div>
                    )) : <p>No one has applied to this project yet.</p>}
                  </div>
                </div>
              )}
            </div>
          )) : (
             <div className="text-center py-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 px-6">
               <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                 <i className="fas fa-folder-plus text-white text-3xl"></i>
               </div>
               <h3 className="text-2xl font-bold text-white mb-3">No Projects Yet</h3>
               <p className="text-gray-400 max-w-md mx-auto mb-8">You haven't posted any projects yet. Start your journey by creating your first project and find the perfect team members.</p>
               <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Link 
                   href="/post-project" 
                   className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3.5 rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-blue-500/20"
                 >
                   <i className="fas fa-plus mr-2"></i>
                   Post Your First Project
                 </Link>
                 <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center">
                   <i className="fas fa-question-circle mr-2"></i>
                   How It Works
                 </button>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}