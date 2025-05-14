import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (name && email && password && confirmPassword) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      
      try {
        setLoading(true);
        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        setLoading(false);
        navigate('/dashboard'); // Redirect to dashboard after successful signup
      } catch (error) {
        setLoading(false);
        if (error.code === 'auth/email-already-in-use') {
          setError('Email already in use');
        } else {
          setError('Failed to create an account: ' + error.message);
        }
      }
    } else {
      setError('Please fill in all fields');
    }
  };

  // Google Auth handler
  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      setError('Google sign-up failed: ' + error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Sprouty</h1>
        
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-100 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
            {password && password.length < 8 && (
              <p className="text-sm text-red-500">Password must be at least 8 characters long.</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <input 
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 rounded"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full px-4 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 text-gray-700 font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm"
        >
          {/* Google G Icon */}
          <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
            <g>
              <path d="M16.318 13.714v3.484h7.844c-.318 2.016-2.36 5.924-7.844 5.924-4.72 0-8.56-3.908-8.56-8.714s3.84-8.714 8.56-8.714c2.688 0 4.492 1.072 5.528 1.992l3.772-3.66C23.06 2.6 19.92 1 16.318 1 8.732 1 2.318 7.414 2.318 15s6.414 14 14 14c8.06 0 13.38-5.66 13.38-13.624 0-.916-.1-1.616-.224-2.286H16.318z" fill="#4285F4"/>
              <path d="M16.318 29c5.66 0 10.4-3.74 12.08-8.924l-4.96-4.06c-.9 2.36-3.08 4.06-7.12 4.06-4.72 0-8.56-3.908-8.56-8.714s3.84-8.714 8.56-8.714c2.688 0 4.492 1.072 5.528 1.992l3.772-3.66C23.06 2.6 19.92 1 16.318 1 8.732 1 2.318 7.414 2.318 15s6.414 14 14 14z" fill="#34A853"/>
              <path d="M29.318 15c0-.916-.1-1.616-.224-2.286H16.318v3.484h7.844c-.318 2.016-2.36 5.924-7.844 5.924-4.72 0-8.56-3.908-8.56-8.714s3.84-8.714 8.56-8.714c2.688 0 4.492 1.072 5.528 1.992l3.772-3.66C23.06 2.6 19.92 1 16.318 1 8.732 1 2.318 7.414 2.318 15s6.414 14 14 14c8.06 0 13.38-5.66 13.38-13.624z" fill="#FBBC05"/>
              <path d="M16.318 1c3.602 0 6.742 1.6 8.78 4.312l-3.772 3.66C20.81 6.072 19.006 5 16.318 5c-4.72 0-8.56 3.908-8.56 8.714s3.84 8.714 8.56 8.714c4.04 0 6.22-1.7 7.12-4.06l4.96 4.06C26.718 25.26 21.978 29 16.318 29c-7.586 0-14-6.414-14-14S8.732 1 16.318 1z" fill="#EA4335"/>
            </g>
          </svg>
          Sign up with Google
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-200">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
