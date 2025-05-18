import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {FcGoogle} from 'react-icons/fc';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMessage, setResetMessage] = useState({ type: '', text: '' });
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/user-not-found' || 
          error.code === 'auth/wrong-password' || 
          error.code === 'auth/invalid-credential') {
        setError('Incorrect email or password');
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetMessage({ type: '', text: '' });
    
    if (!resetEmail) {
      setResetMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    try {
      setResetLoading(true);
      await sendPasswordResetEmail(auth, resetEmail);
      setResetLoading(false);
      setResetMessage({ 
        type: 'success', 
        text: 'Password reset link sent! Check your email inbox.' 
      });
      // Clear the form after 3 seconds and close the modal
      setTimeout(() => {
        setResetEmail('');
        setShowResetModal(false);
        setResetMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setResetLoading(false);
      if (error.code === 'auth/user-not-found') {
        setResetMessage({ type: 'error', text: 'No account found with this email address' });
      } else {
        setResetMessage({ type: 'error', text: `Failed to send reset email: ${error.message}` });
      }
    }
  };

  const openResetModal = (e) => {
    e.preventDefault();
    setResetEmail(email); // Pre-fill with login email if available
    setShowResetModal(true);
    setResetMessage({ type: '', text: '' });
  };

  // Google Auth handler
  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      setError('Google sign-in failed: ' + error.message);
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
            <div className="flex items-center justify-between">
              <button 
                onClick={openResetModal} 
                className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors duration-200"
              >
                Forgot Password?
              </button>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 rounded"
                />
                <label htmlFor="showPassword" className="text-sm text-gray-600">Show Password</label>
              </div>
            </div>
          </div>
          <button 
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 text-gray-700 font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <FcGoogle className='text-xl mr-2'/>Continue with Google
        </button>
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-200">Sign Up</Link>
        </p>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Password</h2>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 mt-1 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              {resetMessage.text && (
                <div className={`p-3 text-sm rounded-lg ${
                  resetMessage.type === 'error' 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-green-100 text-green-600'
                }`}>
                  {resetMessage.text}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    resetLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;