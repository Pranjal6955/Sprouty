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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-100">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Sprouty</h1>
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
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors duration-200">Forgot Password?</Link>
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
            className="w-full px-4 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Login
          </button>
        </form>
        <p className="text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-emerald-600 font-medium hover:text-emerald-700 transition-colors duration-200">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
