'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProjectDetailsPage() {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (id) {
      const fetchProjectDetails = async () => {
        try {
          const res = await fetch(`/api/projects/${id}`);
          if (res.ok) {
            const data = await res.json();
            setProject(data.project);
          }
        } catch (error) {
          console.error("Failed to fetch project details:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProjectDetails();
    }
  }, [id]);

  const checkApplicationStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`/api/projects/${id}/apply`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplicationStatus(data);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  }, [id]);

  useEffect(() => {
    // Check if user is logged in and get their role
    const token = localStorage.getItem('token');
    console.log('Token found:', !!token);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        console.log('User role from token:', payload.role);
        setUserRole(payload.role);
        
        // Check application status if user is a developer
        if (payload.role === 'developer') {
          console.log('User is developer, checking application status');
          checkApplicationStatus();
        } else {
          console.log('User is not developer, role:', payload.role);
        }
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    } else {
      console.log('No token found in localStorage');
    }
  }, [id, checkApplicationStatus]);

  const handleApply = async () => {
    console.log('Apply button clicked!');
    console.log('Current userRole:', userRole);
    console.log('Current project ID:', id);
    
    setApplyMessage('');
    setApplying(true);
    
    const token = localStorage.getItem('token');
    console.log('Token for apply:', !!token);
    if (!token) {
      setApplyMessage('You must be logged in to apply.');
      setApplying(false);
      return;
    }

    try {
      console.log('Making POST request to:', `/api/projects/${id}/apply`);
      const res = await fetch(`/api/projects/${id}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({})
      });
      
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (res.ok) {
        setApplyMessage(data.message);
        setApplicationStatus({
          hasApplied: true,
          status: data.status,
          applicationId: data.applicationId
        });
      } else {
        setApplyMessage(data.message || 'Failed to apply. Please try again.');
      }
    } catch (error) {
      console.error('Error in handleApply:', error);
      setApplyMessage("An error occurred while applying. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const getApplicationStatusText = () => {
    if (!applicationStatus?.hasApplied) return null;
    
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'reviewed': 'bg-blue-100 text-blue-800 border-blue-200',
      'accepted': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };

    const statusText = {
      'pending': 'Application Pending Review',
      'reviewed': 'Application Under Review',
      'accepted': 'Application Accepted! 🎉',
      'rejected': 'Application Not Selected'
    };

    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusColors[applicationStatus.status]}`}>
        <span className="mr-2">
          {applicationStatus.status === 'pending' && '⏳'}
          {applicationStatus.status === 'reviewed' && '👀'}
          {applicationStatus.status === 'accepted' && '✅'}
          {applicationStatus.status === 'rejected' && '❌'}
        </span>
        {statusText[applicationStatus.status]}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <i className="fas fa-circle-notch fa-spin text-4xl text-blue-600"></i>
        <p className="mt-4 text-gray-900">Loading Project Details...</p>
      </div>
    );
  }

  if (!project) return <p className="text-center mt-10">Project not found.</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-gray-900 mt-2">
              Posted by: {project.createdBy?.name || 'A Co-founder'} on {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {/* Application Status or Apply Button */}
          <div className="mt-4 md:mt-0 flex-shrink-0">
            {console.log('Rendering apply section, userRole:', userRole, 'applicationStatus:', applicationStatus)}
            {userRole === 'developer' ? (
              <div className="text-center">
                {applicationStatus?.hasApplied ? (
                  <div className="mb-3">
                    {getApplicationStatusText()}
                  </div>
                ) : (
                  <button 
                    onClick={handleApply} 
                    disabled={applying}
                    className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm w-full md:w-auto"
                  >
                    {applying ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
              </div>
            ) : userRole === 'cofounder' ? (
              <div className="text-center">
                <span className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm">
                  👑 Co-founder View
                </span>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="px-6 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full md:w-auto"
              >
                Login to Apply
              </Link>
            )}
          </div>
        </div>

        {/* Debug Information */}
        <div className="mt-6 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>User Role: {userRole || 'Not set'}</p>
          <p>Project ID: {id || 'Not set'}</p>
          <p>Has Applied: {applicationStatus?.hasApplied ? 'Yes' : 'No'}</p>
          <p>Application Status: {applicationStatus?.status || 'None'}</p>
          <p>Token Exists: {localStorage.getItem('token') ? 'Yes' : 'No'}</p>
        </div>

        {/* Application Message */}
        {applyMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            applyMessage.includes('successfully') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-center font-medium">{applyMessage}</p>
          </div>
        )}
        
        <hr className="my-6" />

        <div>
          <h3 className="text-2xl font-semibold text-gray-800">Description</h3>
          <p className="text-gray-700 mt-4 whitespace-pre-wrap leading-relaxed">{project.description}</p>
        </div>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-gray-800">Required Skills</h3>
          <div className="flex flex-wrap gap-3 mt-4">
            {project.requiredSkills.map(skill => (
              <span key={skill} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Applicants Count for Co-founders */}
        {userRole === 'cofounder' && (
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              📊 Application Statistics
            </h3>
            <p className="text-blue-700">
              Total Applicants: <span className="font-semibold">{project.applicants?.length || 0}</span>
            </p>
            <Link 
              href={`/applications/${project._id}`}
              className="inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              View All Applications
            </Link>
          </div>
        )}

        <div className="mt-10 bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-gray-800">Ready to stand out?</h3>
          <p className="text-gray-900 mt-2 mb-4">
            {userRole === 'developer' 
              ? "See how your resume compares to this project's requirements with our advanced AI analysis."
              : "Help developers understand how well they match your project requirements."
            }
          </p>
          <Link 
            href={`/analyzer/${project._id}`} 
            className="inline-block px-8 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            {userRole === 'developer' ? 'Run AI Resume Analysis' : 'View AI Analysis'}
          </Link>
        </div>
      </div>
    </div>
  );
}