'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []); // This simple check runs once on load

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              CareerHub
            </Link>
          </div>
          <div className="flex items-baseline space-x-4">
            {isLoggedIn ? (
              <>
                <Link href="/projects" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Projects</Link>
                <Link href="/profile" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">My Profile</Link>
                <Link href="/my-applications" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">My Applications</Link>
                <Link href="/resume-analyzer" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Resume Analyzer</Link>
                <Link href="/interview-practice" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Interview Practice</Link>
                <Link href="/developer-dashboard" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Developer Dashboard</Link>
                <Link href="/dashboard" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Co-founder Dashboard</Link>
                <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                <Link href="/signup" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}