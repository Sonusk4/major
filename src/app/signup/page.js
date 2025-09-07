'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  // States from our original form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('developer');
  
  // New states for a better form
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Loading state
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!termsAccepted) newErrors.terms = 'You must accept the terms of service';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Our original handleSubmit function, adapted for the new form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      if (res.ok) {
        router.push('/login'); // Redirect to login on success
      } else {
        const data = await res.json();
        setErrors({ api: data.message || 'User registration failed.' });
      }
    } catch (error) {
      setErrors({ api: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="flex w-full max-w-6xl mx-auto bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-700">
        
        {/* Left Column - Image */}
        <div className="hidden lg:block w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')" }}>
          <div className="relative h-full bg-gradient-to-t from-gray-900 via-gray-900/90 to-transparent p-12 text-white flex flex-col justify-end">
              <div className="mb-2">
                <span className="inline-block bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">INNOVATE • COLLABORATE • GROW</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Forge Your Future in Tech
              </h2>
              <div className="h-1 w-16 bg-blue-500 mb-6"></div>
              <p className="text-lg text-gray-100 max-w-lg leading-relaxed mb-8">
                Collaborate with top-tier developers, visionary co-founders, and industry leaders to transform innovative ideas into successful ventures. Join a thriving ecosystem of tech professionals and startups.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-400 border-2 border-gray-800"></div>
                  <div className="h-8 w-8 rounded-full bg-green-400 border-2 border-gray-800"></div>
                  <div className="h-8 w-8 rounded-full bg-purple-400 border-2 border-gray-800"></div>
                  <div className="h-8 w-8 rounded-full bg-yellow-400 border-2 border-gray-800 flex items-center justify-center text-xs font-bold text-gray-900">500+</div>
                </div>
                <span className="text-sm text-gray-300">Join our growing community</span>
              </div>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-gray-800">
          <div className="mb-6">
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center">
              <i className="fas fa-arrow-left mr-2"></i>
              <span>Back to Login</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Create your account</h2>
            <p className="text-gray-300 mt-2">Join the community of innovators and entrepreneurs</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-user text-gray-600"></i></div>
                <input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${name ? 'bg-white' : 'bg-gray-700 text-white'} border-gray-600 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500 focus:bg-white focus:text-gray-900'}`} 
                  placeholder="John Doe" 
                  required 
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-envelope text-gray-600"></i></div>
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${email ? 'bg-white' : 'bg-gray-700 text-white'} border-gray-600 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500 focus:bg-white focus:text-gray-900'}`} 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            
            <div className="mb-5">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-lock text-gray-600"></i></div>
                <input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${password ? 'bg-white' : 'bg-gray-700 text-white'} border-gray-600 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500 focus:bg-white focus:text-gray-900'}`} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="mb-5">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-lock text-gray-600"></i></div>
                <input 
                  id="confirmPassword" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 transition-all text-gray-900 placeholder-gray-400 ${confirmPassword ? 'bg-white' : 'bg-gray-700 text-white'} border-gray-600 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500 focus:bg-white focus:text-gray-900'}`} 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div className="mb-6">
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">I am a:</label>
                <select 
                  id="role" 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-white bg-gray-700 border-gray-600"
                >
                    <option value="developer">Developer</option>
                    <option value="cofounder">Co-founder</option>
                </select>
            </div>

            <div className="mb-6 flex items-start">
                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="h-4 w-4 mt-1 text-blue-500 focus:ring-blue-500 border-gray-600 rounded bg-gray-700" />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-300">I agree to the <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-400 hover:text-blue-300 hover:underline">Privacy Policy</a></label>
            </div>
            {errors.terms && <p className="mt-1 text-sm text-red-600">{errors.terms}</p>}
            
            {errors.api && <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md mb-4">{errors.api}</div>}

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-600 flex justify-center items-center shadow-lg hover:shadow-blue-500/20" disabled={loading}>
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Create account'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-gray-300">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}