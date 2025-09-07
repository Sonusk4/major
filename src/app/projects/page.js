'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600"></i>
        <p className="mt-4 text-gray-900">Loading Projects...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Available Projects</h1>
      <div className="space-y-6">
        {projects.length > 0 ? (
          projects.map(project => (
            <div key={project._id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-blue-700 hover:text-blue-800 mb-1">
                          <Link href={`/projects/${project._id}`}>
                            {project.title}
                          </Link>
                        </h2>
                        <div className="text-sm text-gray-900 mb-4">
                          <span>Posted by: {project.createdBy?.name || 'A Co-founder'}</span>
                          <span className="mx-2">·</span>
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <Link href={`/projects/${project._id}`} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap mt-4 sm:mt-0">
                      View Details
                    </Link>
                </div>
                
                <p className="text-gray-700 my-4 line-clamp-2">{project.description}</p>
                
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.requiredSkills.map(skill => (
                      <span key={skill} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-folder-open text-gray-600 text-3xl"></i>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects Available</h3>
            <p className="text-gray-900">Please check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}