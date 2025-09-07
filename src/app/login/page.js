'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!email || !password) {
      setError('Both email and password are required.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        const decodedToken = JSON.parse(atob(data.token.split('.')[1]));

        // Route users based on role to avoid unauthorized dashboard API calls
        if (decodedToken.role === 'cofounder') {
          router.push('/dashboard');
        } else {
          router.push('/developer-dashboard');
        }
      } else {
        const data = await res.json();
        setError(data.message || 'Login failed.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
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
                Welcome Back to Your Future
              </h2>
              <div className="h-1 w-16 bg-blue-500 mb-6"></div>
              <p className="text-lg text-gray-100 max-w-lg leading-relaxed mb-8">
                Continue your journey with us. Access your personalized dashboard, connect with your network, and take the next step in your tech career or startup venture.
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

        {/* Right Column - Login Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-gray-800">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-gray-300 mt-2">Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Input */}
            <div className="mb-5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-envelope text-gray-600"></i></div>
                <input 
                  id="email" 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-500 bg-white" 
                  placeholder="you@example.com" 
                  required 
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
                <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><i className="fas fa-lock text-gray-600"></i></div>
                <input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 placeholder-gray-500 bg-white" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            {/* Error Message */}
            {error && <div className="p-3 text-sm text-red-600 bg-red-900/30 border border-red-800 rounded-md mb-4">{error}</div>}

            {/* Submit Button */}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-all transform hover:scale-105 disabled:bg-gray-600 flex justify-center items-center shadow-lg hover:shadow-blue-500/20" disabled={loading}>
              {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-300">
            New to CareerHub?{' '}
            <Link href="/signup" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}