import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { authAPI } from '../services/api';
import { googleAuthService } from '../services/googleAuth';
import LogoOJT from '../assets/LogoOJT.png';
import { useTheme } from '../components/ThemeProvider';

function Signup() {
  const { isDarkMode } = useTheme();
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
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Starting registration process...');
      
      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        authProvider: 'local'
      };

      console.log('Registration data:', { ...registrationData, password: '[HIDDEN]' });
      
      const backendAuth = await authAPI.register(registrationData);
      
      console.log('Registration successful:', backendAuth);
      
      // Store the backend token
      if (backendAuth.token) {
        localStorage.setItem('authToken', backendAuth.token);
      }
      
      // Store user information
      if (backendAuth.user) {
        localStorage.setItem('user', JSON.stringify({
          id: backendAuth.user.id || backendAuth.user._id,
          name: backendAuth.user.name,
          email: backendAuth.user.email,
          authProvider: backendAuth.user.authProvider || 'local'
        }));
      }
      
      setLoading(false);
      navigate('/dashboard');
      
    } catch (error) {
      setLoading(false);
      console.error('Registration error details:', error);
      
      let errorMessage = 'Failed to register account';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        if (errorMessage.includes('email')) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (!error.response) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setLoading(true);
    
    try {
      // Try One Tap first
      try {
        const idToken = await googleAuthService.signInWithPopup();
        await processGoogleAuth(idToken);
        return;
      } catch (oneTapError) {
        console.log('One Tap failed, showing manual button');
      }

      const buttonId = 'google-signup-button-' + Date.now();
      const tempDiv = document.createElement('div');
      tempDiv.id = buttonId;
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-1000px';
      document.body.appendChild(tempDiv);

      await googleAuthService.renderSignInButton(buttonId, {
        callback: async (response) => {
          document.body.removeChild(tempDiv);
          if (response.credential) {
            await processGoogleAuth(response.credential);
          } else {
            setLoading(false);
            setError('No credential received from Google');
          }
        }
      });

      setTimeout(() => {
        const button = tempDiv.querySelector('div[role="button"]');
        if (button) {
          button.click();
        } else {
          document.body.removeChild(tempDiv);
          setLoading(false);
          setError('Could not initialize Google Sign-In');
        }
      }, 500);

    } catch (error) {
      setLoading(false);
      console.error('Google sign-up error:', error);
      setError('Google sign-up failed: ' + error.message);
    }
  };

  const processGoogleAuth = async (idToken) => {
    try {
      const backendAuth = await authAPI.googleAuth(idToken);
      
      localStorage.setItem('authToken', backendAuth.token);
      localStorage.setItem('user', JSON.stringify({
        id: backendAuth.user.id || backendAuth.user._id,
        name: backendAuth.user.name,
        email: backendAuth.user.email,
        avatar: backendAuth.user.avatar,
        authProvider: backendAuth.user.authProvider
      }));
      
      setLoading(false);
      navigate('/dashboard');
    } catch (error) {
      setLoading(false);
      console.error('Backend auth error:', error);
      
      let errorMessage = 'Google sign-up failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100 dark:border-gray-700">
        {/* Logo Header */}
        <div className="text-center">
          <img 
            src={LogoOJT} 
            alt="Sprouty Logo" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Join Sprouty
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Start your plant care journey today</p>
        </div>
        
        {error && (
          <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input 
              type="text" 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white"
            />
            {password && password.length < 6 && (
              <p className="text-sm text-red-500 dark:text-red-400">Password must be at least 6 characters long.</p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <input 
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="text-emerald-600 focus:ring-emerald-500 w-4 h-4 rounded dark:bg-gray-700"
            />
            <label htmlFor="showPassword" className="text-sm text-gray-600 dark:text-gray-400">Show Password</label>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full px-4 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing Up...
              </div>
            ) : 'Sign Up'}
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 text-gray-700 dark:text-gray-200 font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
        <FcGoogle className='text-xl mr-2'/>Sign up with Google
        </button>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account? <Link to="/Login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
