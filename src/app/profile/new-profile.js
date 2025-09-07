'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBriefcase, 
  FaFilePdf, FaUpload, FaCheck, FaSpinner, FaUserEdit, 
  FaLinkedin, FaGithub, FaTwitter, FaGlobe, FaGraduationCap,
  FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaLink, FaBuilding,
  FaFileAlt, FaDownload
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

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

export default function NewProfilePage() {
  const [profile, setProfile] = useState({
    fullName: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    headline: 'Senior Full Stack Developer',
    bio: 'Passionate about building scalable web applications with modern technologies. Specializing in React, Node.js, and cloud architecture.',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'GraphQL', 'Docker'],
    experience: [
      {
        id: 1,
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        startDate: '2020',
        endDate: 'Present',
        current: true,
        description: 'Leading a team of developers to build scalable web applications using React and Node.js.'
      },
      {
        id: 2,
        title: 'Frontend Developer',
        company: 'WebSolutions LLC',
        startDate: '2018',
        endDate: '2020',
        current: false,
        description: 'Developed and maintained responsive web applications using React and Redux.'
      }
    ],
    education: [
      {
        id: 1,
        degree: 'Master of Computer Science',
        school: 'Stanford University',
        startDate: '2016',
        endDate: '2018'
      },
      {
        id: 2,
        degree: 'Bachelor of Technology in CSE',
        school: 'IIT Delhi',
        startDate: '2012',
        endDate: '2016'
      }
    ],
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94107',
      country: 'United States'
    },
    socialLinks: {
      linkedin: 'alexjohnson',
      github: 'alexjohnson',
      twitter: 'alexjohnson',
      website: 'alexjohnson.dev'
    },
    profilePicture: '/profile-avatar.jpg',
    resumePDF: '/resume.pdf'
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Simulate loading data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
                  src={profile.profilePicture} 
                  alt={profile.fullName}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                  onError={(e) => {
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
              <button className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors flex items-center">
                <FaUserEdit className="mr-2" /> Edit Profile
              </button>
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
              <p className="text-gray-700 mb-6 leading-relaxed">
                {profile.bio}
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <FaEdit className="mr-1.5" /> Edit Bio
              </button>
            </SectionCard>

            {/* Experience Section */}
            <SectionCard title="Work Experience" icon={FaBriefcase}>
              {profile.experience.length > 0 ? (
                <div className="space-y-6">
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaBriefcase className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-500">No work experience added yet</p>
                </div>
              )}
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <FaPlus className="mr-1.5" /> Add Experience
              </button>
            </SectionCard>

            {/* Education Section */}
            <SectionCard title="Education" icon={FaGraduationCap}>
              {profile.education.length > 0 ? (
                <div className="space-y-6">
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
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaGraduationCap className="mx-auto text-gray-300 text-4xl mb-3" />
                  <p className="text-gray-500">No education information added yet</p>
                </div>
              )}
              <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <FaPlus className="mr-1.5" /> Add Education
              </button>
            </SectionCard>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <SectionCard title="Contact Information" icon={FaEnvelope}>
              <div className="space-y-4">
                <InfoRow icon={FaEnvelope} label="Email" value={profile.email} />
                <InfoRow icon={FaPhone} label="Phone" value={profile.phone} />
                <InfoRow 
                  icon={FaMapMarkerAlt} 
                  label="Address" 
                  value={
                    [profile.address.street, profile.address.city, 
                     profile.address.state, profile.address.country, profile.address.zipCode]
                      .filter(Boolean).join(', ')
                  } 
                />
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-500 mb-3">Social Links</h4>
                <div className="space-y-2">
                  <a 
                    href={`https://linkedin.com/in/${profile.socialLinks.linkedin}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaLinkedin className="mr-2.5 text-blue-700" /> LinkedIn Profile
                  </a>
                  <a 
                    href={`https://github.com/${profile.socialLinks.github}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <FaGithub className="mr-2.5 text-gray-700" /> GitHub Profile
                  </a>
                  <a 
                    href={`https://twitter.com/${profile.socialLinks.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <FaTwitter className="mr-2.5 text-blue-400" /> @{profile.socialLinks.twitter}
                  </a>
                  <a 
                    href={`https://${profile.socialLinks.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <FaGlobe className="mr-2.5 text-gray-600" /> {profile.socialLinks.website}
                  </a>
                </div>
                <button className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                  <FaEdit className="mr-1.5" /> Edit Social Links
                </button>
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
                        href={profile.resumePDF} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaFileAlt className="mr-1.5" /> View
                      </a>
                      <a 
                        href={profile.resumePDF} 
                        download
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaDownload className="mr-1.5" /> Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <button className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 flex items-center justify-center">
                <FaUpload className="mr-2" /> Upload New Resume
              </button>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
