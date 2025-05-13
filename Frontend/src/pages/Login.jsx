import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
    } else {
      alert('Dashboard functionality will be implemented later');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-green-600">Sprouty</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {password && password.length < 8 && (
              <p className="text-sm text-red-500">Password must be at least 8 characters long.</p>
            )}
            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-green-600 hover:underline">Forgot Password?</Link>
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="text-green-600 focus:ring-green-500 w-4 h-4"
                />
                <label htmlFor="showPassword" className="text-sm text-gray-700">Show Password</label>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-green-600 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
