import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {FcGoogle} from 'react-icons/fc';
import { authAPI } from '../services/api';

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
        
        // Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Update Firebase profile with name
        await updateProfile(firebaseUser, {
          displayName: name
        });
        
        // Backend Registration
        try {
          const backendAuth = await authAPI.register({
            name,
            email,
            password,
            firebaseUid: firebaseUser.uid
          });
          
          // Store the backend token
          localStorage.setItem('authToken', backendAuth.token);
          
          // Store user information
          localStorage.setItem('user', JSON.stringify({
            id: backendAuth.user.id,
            name: backendAuth.user.name,
            email: backendAuth.user.email,
            firebaseUid: firebaseUser.uid
          }));
          
          setLoading(false);
          navigate('/dashboard'); // Redirect to dashboard after successful signup
        } catch (backendError) {
          console.error('Backend registration failed:', backendError);
          
          // If backend registration fails, delete the Firebase user
          try {
            await firebaseUser.delete();
          } catch (deleteError) {
            console.error('Failed to delete Firebase user after backend registration failure:', deleteError);
          }
          
          setLoading(false);
          
          if (backendError.response && backendError.response.data) {
            setError(backendError.response.data.error || 'Failed to register on server');
          } else {
            setError('Failed to register account on server');
          }
        }
        
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
      // Firebase Google Auth
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      // After Firebase auth succeeds, register with the backend
      try {
        const backendAuth = await authAPI.register({
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email,
          password: crypto.randomUUID(), // Generate random password for OAuth users
          oAuthProvider: 'google',
          oAuthToken: await firebaseUser.getIdToken(),
          firebaseUid: firebaseUser.uid
        });
        
        // Store the backend token
        localStorage.setItem('authToken', backendAuth.token);
        
        // Store user information
        localStorage.setItem('user', JSON.stringify({
          id: backendAuth.user.id,
          name: backendAuth.user.name || firebaseUser.displayName,
          email: backendAuth.user.email || firebaseUser.email,
          firebaseUid: firebaseUser.uid
        }));
        
        setLoading(false);
        navigate('/dashboard');
      } catch (backendError) {
        console.error('Backend registration failed after Google sign-up:', backendError);
        
        // If backend registration fails, log the user out of firebase
        await auth.signOut();
        
        setLoading(false);
        setError('Google sign-up failed on server. Please try again.');
      }
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
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 mb-2 text-gray-700 font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm transform hover:-translate-y-0.5 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
        <FcGoogle className='text-xl mr-2'/>Sign up with Google
        </button>
        <p className="text-center text-sm text-gray-600">
          Already have an account? <Link to="/Login" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-200">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
