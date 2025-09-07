'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to view your applications.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/my-applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setApplications(data.applications);
        } else {
           const data = await res.json();
           setError(data.message || "Failed to load applications.");
        }
      } catch (err) {
        setError("An error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  if (loading) return <p>Loading your applications...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div style={{ maxWidth: '800px', margin: 'auto', padding: '2rem' }}>
      <h1>My Applications</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {applications.length > 0 ? (
          applications.map(project => (
            <div key={project._id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
              <h2>
                <Link href={`/projects/${project._id}`} style={{ textDecoration: 'none', color: '#0070f3' }}>
                  {project.title}
                </Link>
              </h2>
              <p><strong>Posted by:</strong> {project.createdBy?.name || 'A Co-founder'}</p>
              <p><strong>Status:</strong> Applied</p>
            </div>
          ))
        ) : (
          <p>You have not applied to any projects yet.</p>
        )}
      </div>
    </div>
  );
}