import React, { useState } from 'react';
import plantPhoto from '../assets/plantPhoto.jpg'; // Import the plant image

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-green-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-green-600 font-bold text-2xl">Sprouty</span>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <a href="#home" className="text-green-900 hover:text-green-700 px-3 py-2 font-medium">Home</a>
                <a href="#features" className="text-green-900 hover:text-green-700 px-3 py-2 font-medium">Features</a>
                <a href="#about" className="text-green-900 hover:text-green-700 px-3 py-2 font-medium">About Us</a>
              </div>
            </div>
            <div className="hidden md:flex items-center">
              <button className="bg-white hover:bg-gray-100 text-green-700 font-semibold py-2 px-4 border border-green-500 rounded mr-2">
                Login
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 border border-green-600 rounded">
                Sign Up
              </button>
            </div>
            <div className="flex items-center md:hidden">
              <button onClick={toggleMenu} className="text-gray-700">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#home" className="block px-3 py-2 text-green-900 font-medium hover:bg-green-100">Home</a>
              <a href="#features" className="block px-3 py-2 text-green-900 font-medium hover:bg-green-100">Features</a>
              <a href="#about" className="block px-3 py-2 text-green-900 font-medium hover:bg-green-100">About Us</a>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4 space-x-2">
                <button className="bg-white hover:bg-gray-100 text-green-700 font-semibold py-2 px-4 border border-green-500 rounded">
                  Login
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 border border-green-600 rounded">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="bg-green-50 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
                Your Personal Plant Caretaker
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Never forget to water your plants again. Sprouty helps you track, manage, and care for all your plants in one simple app.
              </p>
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                Get Started
              </button>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <img 
                src={plantPhoto} 
                alt="Plant care illustration" 
                className="w-full h-auto rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Features</h2>
            <p className="mt-4 text-xl text-gray-600">Everything you need to keep your plants thriving</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-4">
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Plants Easily</h3>
              <p className="text-gray-600">Add new plants manually or identify them instantly through image upload.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-4">
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Reminders</h3>
              <p className="text-gray-600">Get timely notifications for watering, feeding, and pruning your plants.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-4">
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Growth Tracking</h3>
              <p className="text-gray-600">Monitor your plants' growth and health progress with visual statistics.</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-4">
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Suggestions</h3>
              <p className="text-gray-600">Receive personalized plant care tips based on plant type and local weather data.</p>
            </div>
            {/* Feature 5 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-4">
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dark Mode</h3>
              <p className="text-gray-600">Switch between light and dark themes for a comfortable viewing experience.</p>
            </div>
            {/* Feature 6 */}
            <div className="bg-green-50 p-6 rounded-lg shadow-md">
              <div className="text-green-600 mb-4">
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Data Export</h3>
              <p className="text-gray-600">Download your plant care logs and history in PDF or CSV formats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">About Us</h2>
            <p className="mt-4 text-xl text-gray-600">The story behind Sprouty</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <p className="text-gray-700 mb-6">
              Sprouty was born out of a simple problem: we kept forgetting to water our plants. After killing one too many innocent ferns and succulents, we realized there had to be a better way to keep track of plant care routines.
            </p>
            <p className="text-gray-700 mb-6">
              Our mission is to help people build deeper connections with their plants through technology that simplifies care routines and provides valuable knowledge. We believe that thriving plants contribute to happier, healthier living spaces.
            </p>
            <p className="text-gray-700">
              Whether you're a beginner plant parent or an experienced green thumb, Sprouty is designed to adapt to your needs and help you create your own personal urban jungle with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold">Sprouty</h3>
              <p className="mt-2 text-green-200">Your personal plant care assistant</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-semibold mb-3">Quick Links</h4>
                <ul className="space-y-2">
                  <li><a href="#home" className="text-green-200 hover:text-white">Home</a></li>
                  <li><a href="#features" className="text-green-200 hover:text-white">Features</a></li>
                  <li><a href="#about" className="text-green-200 hover:text-white">About Us</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Resources</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-green-200 hover:text-white">Blog</a></li>
                  <li><a href="#" className="text-green-200 hover:text-white">Help Center</a></li>
                  <li><a href="#" className="text-green-200 hover:text-white">Contact</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-green-200 hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="text-green-200 hover:text-white">Terms of Service</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-green-700 text-center md:text-left">
            <p className="text-green-200">&copy; {new Date().getFullYear()} Sprouty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;