'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaSpinner, FaCheck, FaExclamationTriangle, FaSync } from 'react-icons/fa';

export default function ProfilePicturesDebug() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/debug/profile-pictures');
      const data = await response.json();
      if (data.success) {
        setProfiles(data.data);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to fetch profiles' });
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
      setMessage({ type: 'error', text: 'Failed to fetch profiles' });
    } finally {
      setLoading(false);
    }
  };

  const fixProfilePicture = async (userId, currentPicture) => {
    try {
      setUpdating(prev => ({ ...prev, [userId]: true }));
      
      // Find the actual file in the uploads directory
      const fileName = currentPicture?.split('/').pop();
      if (!fileName) {
        setMessage({ type: 'error', text: 'No file name found' });
        return;
      }

      // Check if file exists
      const fileExists = await fetch(`/uploads/profile-pictures/${fileName}`, { method: 'HEAD' })
        .then(res => res.ok)
        .catch(() => false);

      if (!fileExists) {
        // Find a matching file with the same user ID
        const userFiles = await fetch('/api/debug/list-files')
          .then(res => res.json())
          .catch(() => ({}));
        
        const matchingFile = userFiles.files?.find(file => 
          file.includes(userId) && file.endsWith(fileName.split('-').pop())
        );

        if (matchingFile) {
          // Update the profile with the correct path
          const response = await fetch('/api/profile/update-picture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              pictureUrl: `/uploads/profile-pictures/${matchingFile}`
            })
          });
          
          const result = await response.json();
          if (result.success) {
            setMessage({ type: 'success', text: 'Profile picture updated successfully' });
            fetchProfiles();
          } else {
            throw new Error(result.error || 'Failed to update profile');
          }
        } else {
          setMessage({ type: 'error', text: 'No matching file found' });
        }
      } else {
        setMessage({ type: 'info', text: 'File exists but there might be a path issue' });
      }
    } catch (error) {
      console.error('Error fixing profile picture:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to fix profile picture' });
    } finally {
      setUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mb-4" />
          <p>Loading profile data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Profile Pictures Debug</h1>
          <button
            onClick={async () => {
              try {
                const response = await fetch('/api/debug/fix-profile-picture', {
                  method: 'POST'
                });
                const result = await response.json();
                alert(result.message);
                if (result.success) {
                  // Refresh the page to see changes
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error fixing profile pictures:', error);
                alert('Failed to fix profile pictures');
              }
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"
          >
            Fix Broken Profile Pictures
          </button>
        </div>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-md ${
            message.type === 'error' ? 'bg-red-900/50 border border-red-700' :
            message.type === 'success' ? 'bg-green-900/50 border border-green-700' :
            'bg-blue-900/50 border border-blue-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800/80 border-b border-gray-700 font-medium">
            <div className="col-span-4">User</div>
            <div className="col-span-4">Profile Picture</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          {profiles.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No profiles found</div>
          ) : (
            profiles.map(profile => (
              <div key={profile.userId} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-700/50 hover:bg-gray-800/30">
                <div className="col-span-4">
                  <div className="font-medium">{profile.email || 'Unknown User'}</div>
                  <div className="text-sm text-gray-400">{profile.userId}</div>
                </div>
                
                <div className="col-span-4 truncate">
                  {profile.profilePicture ? (
                    <a 
                      href={profile.profilePicture} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {profile.profilePicture}
                    </a>
                  ) : (
                    <span className="text-gray-500">No picture</span>
                  )}
                </div>
                
                <div className="col-span-2 flex justify-center">
                  {profile.profilePicture ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Exists</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span>Missing</span>
                    </div>
                  )}
                </div>
                
                <div className="col-span-2 flex justify-end">
                  {profile.profilePicture && (
                    <button
                      onClick={() => fixProfilePicture(profile.userId, profile.profilePicture)}
                      disabled={updating[profile.userId]}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-md text-sm flex items-center disabled:opacity-50"
                    >
                      {updating[profile.userId] ? (
                        <>
                          <FaSpinner className="animate-spin mr-1" />
                          Fixing...
                        </>
                      ) : (
                        <>
                          <FaSync className="mr-1" />
                          Fix
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Available Profile Pictures</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'profile-68889a3bc09a68b166e8e515-1754933602166.jpg',
              'profile-68889a3bc09a68b166e8e515-1754933639536.jpg',
              'profile-68af28688f33d20de8fde720-1756380503183.jpg'
            ].map((file) => (
              <div key={file} className="bg-gray-700/30 p-3 rounded-md border border-gray-600">
                <div className="aspect-square bg-gray-700/50 mb-2 overflow-hidden rounded-md">
                  <Image 
                    src={`/uploads/profile-pictures/${file}`} 
                    alt={file}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </div>
                <div className="text-xs truncate text-gray-300">{file}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
