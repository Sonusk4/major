'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, 
  FaFilePdf, FaUpload, FaCheck, FaSpinner, FaUserEdit, 
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaGraduationCap,
  FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaFileAlt, FaDownload,
  FaBuilding
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';

// Custom Components
const SectionCard = ({ title, icon: Icon, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md ${className}`}>
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center">
      <Icon className="text-white mr-3" size={18} />
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const InfoRow = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`flex items-start mb-4 last:mb-0 ${className}`}>
    <div className="bg-blue-50 p-2 rounded-lg mr-3">
      <Icon className="text-blue-600" size={16} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-gray-800">{value || 'Not specified'}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch profile');
      }
      
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    headline: 'Software Developer',
    bio: '',
    skills: [],
    experience: [],
    education: [],
    socialLinks: {
      linkedin: '',
      github: '',
      twitter: '',
      portfolio: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    profilePicture: '/default-avatar.png',
    resumeFile: null,
    resumeText: '',
    resumeName: '',
    resumeLastUpdated: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }
        
        const response = await fetch('/api/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch profile');
        }
        
        const data = await response.json();
        
        // Transform the API response to match our component's expected format
        const formattedProfile = {
          ...data,
          fullName: data.fullName || '',
          email: data.email || '',
          phone: data.phone || '',
          headline: data.headline || 'Software Developer',
          bio: data.bio || '',
          skills: data.skills || [],
          experience: data.experience?.map(exp => ({
            id: exp._id || Math.random().toString(36).substr(2, 9),
            title: exp.title || '',
            company: exp.company || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            current: exp.current || false,
            description: exp.description || ''
          })) || [],
          education: data.education?.map(edu => ({
            id: edu._id || Math.random().toString(36).substr(2, 9),
            degree: edu.degree || '',
            school: edu.school || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || ''
          })) || [],
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || ''
          },
          socialLinks: {
            linkedin: data.socialLinks?.linkedin || '',
            github: data.socialLinks?.github || '',
            twitter: data.socialLinks?.twitter || '',
            website: data.socialLinks?.website || ''
          },
          profilePicture: data.profilePicture || '/default-avatar.png'
        };
        
        setProfile(formattedProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        // You might want to show an error message to the user here
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects like address and socialLinks
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent] || {}), // Ensure parent exists
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    
    try {
      console.log('Starting resume upload for file:', file.name);
      const formData = new FormData();
      formData.append('resume', file);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      // First upload the file
      console.log('Uploading resume to server...');
      const uploadResponse = await fetch('/api/profile/upload-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
        }
        throw new Error(errorData.message || 'Failed to upload resume');
      }

      // Then parse the resume by sending the file directly
      console.log('Parsing resume...');
      const parseFormData = new FormData();
      parseFormData.append('resume', file);
      
      const parseResponse = await fetch('/api/profile/parse-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: parseFormData
      });

      if (!parseResponse.ok) {
        const errorText = await parseResponse.text();
        console.error('Parse error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`Parse failed with status ${parseResponse.status}: ${errorText}`);
        }
        throw new Error(errorData.message || 'Failed to parse resume');
      }

      const result = await parseResponse.json();
      console.log('Parse successful, extracted data:', result);
      
      if (!result) {
        throw new Error('No data returned from resume parser');
      }

      // Handle both response formats - direct text or object with text property
      const { text, extractedData = {} } = result;
      
      if (!text) {
        throw new Error('No text was extracted from the resume');
      }
      
      // Update profile with parsed data
      const updatedProfile = {
        ...profile, // Use the current profile state
        parsedResumeText: text || '',
        resumeText: text || '', // Keep both for backward compatibility
        resumeName: file.name,
        resumeLastUpdated: new Date().toISOString(),
        skills: [...new Set([
          ...(profile.skills || []), 
          ...(extractedData.skills || [])
        ])],
        experience: extractedData.experience || profile.experience || [],
        education: extractedData.education || profile.education || [],
        fullName: extractedData.name || profile.fullName || '',
        email: extractedData.email || profile.email || '',
        phone: extractedData.phone || profile.phone || ''
      };
      
      // Update the profile in the database
      const updateResponse = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedProfile)
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update profile with parsed resume data');
      }

      setProfile(updatedProfile);
      
      setSuccess('Resume uploaded and parsed successfully!');
      console.log('Resume processing completed successfully');
    } catch (err) {
      // Log detailed error information
      const errorDetails = {
        name: err.name,
        message: err.message,
        stack: err.stack,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: await (async () => {
            try {
              return await err.response.clone().text();
            } catch (e) {
              return 'Could not read response body';
            }
          })()
        } : undefined
      };
      
      console.error('Error in handleResumeUpload:', JSON.stringify(errorDetails, null, 2));
      
      // Set a more descriptive error message
      let errorMessage = 'Failed to process resume. ';
      try {
        if (err.response) {
          const errorData = await err.response.clone().json().catch(() => ({}));
          errorMessage += errorData.message || err.response.statusText || `HTTP ${err.response.status}`;
        } else if (err.message) {
          errorMessage += err.message;
        } else {
          errorMessage += 'An unknown error occurred.';
        }
      } catch (e) {
        console.error('Error processing error response:', e);
        errorMessage += 'An error occurred while processing your request.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    // Optionally refetch the profile to discard changes
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4 mx-auto" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 bg-red-50 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="relative group mb-6 md:mb-0 md:mr-8">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <Image 
                  src={profile.profilePicture || '/default-avatar.png'} 
                  alt={profile.fullName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop if default avatar also fails
                    e.target.src = '/default-avatar.png';
                    e.target.onerror = null;
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.fullName) + '&background=3B82F6&color=fff&size=256';
                  }}
                />
              </div>
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-colors">
                <FaEdit />
              </button>
            </div>
            
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-2">{profile.fullName}</h1>
              <p className="text-xl text-blue-100 mb-4">{profile.headline}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.slice(0, 5).map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-blue-500 bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
                {profile.skills.length > 5 && (
                  <span className="text-blue-200 text-sm self-center">+{profile.skills.length - 5} more</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-1.5 text-blue-200" />
                  <span>{[profile.address.city, profile.address.country].filter(Boolean).join(', ')}</span>
                </div>
                <div className="flex items-center">
                  <FaEnvelope className="mr-1.5 text-blue-200" />
                  <a href={`mailto:${profile.email}`} className="hover:underline">{profile.email}</a>
                </div>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 flex space-x-3">
              <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center">
                <FaFilePdf className="mr-2" /> Download CV
              </button>
              {editing ? (
                <button 
                  onClick={handleCancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center"
                >
                  Cancel
                </button>
              ) : (
                <button 
                  onClick={handleEditClick}
                  className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center"
                >
                  <FaUserEdit className="mr-2" /> Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <SectionCard title="About Me" icon={FaUser}>
              {editing ? (
                <form onSubmit={handleSubmit}>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {profile.bio || 'No bio added yet.'}
                  </p>
                  <button 
                    onClick={handleEditClick}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <FaEdit className="mr-1.5" /> Edit Bio
                  </button>
                </>
              )}
            </SectionCard>

            {/* Experience Section */}
            <SectionCard title="Work Experience" icon={FaBriefcase}>
              {profile.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-blue-200 pl-4 relative pb-6">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg text-gray-900">{exp.title}</h4>
                      <div className="flex items-center text-gray-600 mb-1">
                        <FaBuilding className="mr-2 text-sm" />
                        <span>{exp.company}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <FaCalendarAlt className="mr-2" />
                        <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                        {exp.current && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50">
                        <FaEdit size={14} />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{exp.description}</p>
                </div>
              ))}
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <FaPlus className="mr-1.5" /> Add Experience
              </button>
            </SectionCard>

            {/* Education Section */}
            <SectionCard title="Education" icon={FaGraduationCap}>
              {profile.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-blue-200 pl-4 relative pb-6">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                      <p className="text-gray-600">{edu.school}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        <FaCalendarAlt className="inline mr-1.5" />
                        {edu.startDate} - {edu.endDate}
                      </p>
                    </div>
                    <div className="flex space-x-2 mt-2 sm:mt-0">
                      <button className="text-blue-600 hover:text-blue-800 p-1.5 rounded-full hover:bg-blue-50">
                        <FaEdit size={14} />
                      </button>
                      <button className="text-red-600 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50">
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <FaPlus className="mr-1.5" /> Add Education
              </button>
            </SectionCard>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <SectionCard title="Contact Information" icon={FaEnvelope}>
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address.street"
                      value={profile.address.street}
                      onChange={handleInputChange}
                      placeholder="Street"
                      className="w-full p-2 border border-gray-300 rounded-md mb-2"
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        name="address.city"
                        value={profile.address.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        className="p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        name="address.state"
                        value={profile.address.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="address.zipCode"
                        value={profile.address.zipCode}
                        onChange={handleInputChange}
                        placeholder="ZIP Code"
                        className="p-2 border border-gray-300 rounded-md"
                      />
                      <input
                        type="text"
                        name="address.country"
                        value={profile.address.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        className="p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <InfoRow icon={FaEnvelope} label="Email" value={profile.email} />
                  <InfoRow icon={FaPhone} label="Phone" value={profile.phone || 'Not specified'} />
                  <InfoRow 
                    icon={FaMapMarkerAlt} 
                    label="Address" 
                    value={
                      [profile.address.street, profile.address.city, 
                       profile.address.state, profile.address.country, profile.address.zipCode]
                        .filter(Boolean).join(', ') || 'Not specified'
                    } 
                  />
                </div>
              )}
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Social Links</h4>
                <div className="space-y-2">
                  {profile.socialLinks?.linkedin && (
                    <a 
                      href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <FaLinkedin className="mr-2.5 text-blue-700" /> LinkedIn Profile
                    </a>
                  )}
                  {profile.socialLinks?.github && (
                    <a 
                      href={`https://github.com/${profile.socialLinks.github}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <FaGithub className="mr-2.5 text-gray-700" /> GitHub Profile
                    </a>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* Skills */}
            <SectionCard title="Skills & Expertise" icon={FaCheck}>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <FaPlus className="mr-1.5" /> Add Skills
              </button>
            </SectionCard>

            {/* Resume */}
            <SectionCard title="Resume" icon={FaFilePdf}>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FaFilePdf className="text-red-500 text-2xl" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Resume.pdf</p>
                    <p className="text-sm text-gray-500 mt-1">Last updated: {new Date().toLocaleDateString()}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a 
                        href="#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaFileAlt className="mr-1.5" /> View
                      </a>
                      <a 
                        href="#" 
                        download
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaDownload className="mr-1.5" /> Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
                <label
                  htmlFor="resume-upload"
                  className="w-full cursor-pointer bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 flex items-center justify-center"
                >
                  <FaUpload className="mr-2" /> 
                  {loading ? 'Processing...' : 'Upload New Resume'}
                </label>
                {profile.resumeText && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Resume Content:</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          {profile.resumeName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(profile.resumeLastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-md max-h-60 overflow-y-auto text-sm text-gray-700 whitespace-pre-line">
                        {profile.resumeText}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(profile.resumeText);
                            setSuccess('Resume text copied to clipboard!');
                          }}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Copy Text
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}