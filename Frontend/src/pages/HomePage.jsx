import { useState } from 'react';
import plantPhoto from '../assets/plantPhoto.jpg';

export default function SproutyHomepage() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState('');

  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Feature data boxes
  const features = [
    {
      id: 1,
      title: "AI-Powered Plant Analysis",
      description: "Leverage AI to detect care issues, analyze growth patterns, and provide data-driven insights for better plant health",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-500 to-green-700"
    },
    {
      id: 2,
      title: "Remote Plant Monitoring",
      description: "Track your plants from anywhere and get notifications without geographical limitations",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-600 to-green-800"
    },
    {
      id: 3,
      title: "Growth Tracking",
      description: "Visualize plant growth with images and track behavior to identify care needs and progress",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-500 to-green-700"
    },
    {
      id: 4,
      title: "Automated Care Reports",
      description: "Get detailed, AI-generated reports with actionable insights to enhance plant health and growth",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-600 to-green-800"
    },
    {
      id: 5,
      title: "Plant Community",
      description: "Work with fellow plant lovers, share insights, and contribute to the growing green-thumb community",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-500 to-green-700"
    },
    {
      id: 6,
      title: "Customizable Care Plans",
      description: "Create tailored plant care plans using various methodologies to match your specific plant needs",
      icon: (
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      bgColor: "bg-gradient-to-br from-green-600 to-green-800"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation Bar */}
      <nav className={`${darkMode ? 'bg-gray-800 shadow-gray-900' : 'bg-white'} shadow px-6 py-4`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-2xl mr-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </span>
            <h1 className="text-2xl font-semibold text-green-600">Sprouty</h1>
          </div>
          <div className="flex space-x-8 items-center">
            <a href="#home" className={`${darkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'} font-medium`}>Home</a>
            <a href="#about" className={`${darkMode ? 'text-gray-300 hover:text-green-400' : 'text-gray-600 hover:text-green-600'} font-medium`}>About Us</a>
            {/* Dark Mode Toggle */}
            <button 
              onClick={toggleDarkMode}
              className={`flex items-center justify-center w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <a href="/login" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Login/Sign Up</a>
          </div>
        </div>
      </nav>

      {/* Main Section */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-16`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="flex items-center mb-6">
                <span className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-3xl mr-3">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
                  </svg>
                </span>
                <h2 className="text-5xl font-bold text-green-600">Sprouty</h2>
              </div>
              <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Track Plant Care Remotely with Ease!
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Sprouty provides a powerful toolkit for plant owners to monitor 
                and maintain their plants with real-time feedback-anytime, anywhere.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Join our plant-loving community to create your own plant care schedule, 
                track remotely, and collaborate with fellow gardeners. 
                Plant care has never been this simple!
              </p>
              <div className="mt-8">
                <a href="/signup" className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 inline-block font-medium">
                  Get Started
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="{plantPhoto}" 
                  alt="Young plant seedling sprouting from soil" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="py-16 bg-green-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-8">EXPLORE OUR FEATURES</h2>
          
          <h3 className="text-xl font-medium text-green-200 mb-4 pl-4">Popular Features</h3>
          
          <div className="relative">
            <div className="flex overflow-x-auto pb-8 space-x-4 scrollbar-hide">
              {features.map((feature) => (
                <div 
                  key={feature.id}
                  className="flex-shrink-0 w-64 relative"
                  onMouseEnter={() => setHoveredCard(feature.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div 
                    className={`h-96 rounded-md overflow-hidden shadow-lg transition-all duration-300 ${
                      hoveredCard === feature.id ? 'transform scale-105 shadow-xl' : ''
                    }`}
                  >
                    <div className={`h-full w-full ${feature.bgColor} relative`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        {feature.icon}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-transparent opacity-90"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                        <div 
                          className={`transition-all duration-300 overflow-hidden ${
                            hoveredCard === feature.id ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0'
                          }`}
                        >
                          <p className="text-green-100 text-sm">{feature.description}</p>
                          <div className="mt-3">
                            <a href="#" className="text-green-300 hover:text-green-200 text-sm font-medium inline-flex items-center">
                              Learn more
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Category Row */}
          <h3 className="text-xl font-medium text-green-200 mb-4 mt-12 pl-4">Most Popular for Gardens</h3>
          <div className="flex overflow-x-auto pb-8 space-x-4 scrollbar-hide">
            {features.slice().reverse().map((feature) => (
              <div 
                key={`second-${feature.id}`}
                className="flex-shrink-0 w-64 relative"
                onMouseEnter={() => setHoveredCard(`second-${feature.id}`)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div 
                  className={`h-96 rounded-md overflow-hidden shadow-lg transition-all duration-300 ${
                    hoveredCard === `second-${feature.id}` ? 'transform scale-105 shadow-xl' : ''
                  }`}
                >
                  <div className={`h-full w-full ${feature.bgColor} relative`}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-green-900 via-transparent opacity-90"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                      <div 
                        className={`transition-all duration-300 overflow-hidden ${
                          hoveredCard === `second-${feature.id}` ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0'
                        }`}
                      >
                        <p className="text-green-100 text-sm">{feature.description}</p>
                        <div className="mt-3">
                          <a href="#" className="text-green-300 hover:text-green-200 text-sm font-medium inline-flex items-center">
                            Learn more
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} py-12`}>
        <div className="container mx-auto px-4 max-w-xl">
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-lg shadow-md p-8`}>
            <h3 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Subscribe to our newsletter
            </h3>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6`}>
              Stay updated with the latest plant care tips, features, and community news.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Thank you for subscribing, ${email}!`);
                setEmail('');
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-grow px-4 py-3 rounded-md border focus:outline-none focus:ring-2 ${
                  darkMode ? 'bg-gray-800 border-gray-600 text-white focus:ring-green-400' : 'bg-white border-green-300 focus:ring-green-600'
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-700'} py-12`}>
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Sprouty</h4>
            <p>Helping you nurture your plants with care and technology.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Plant Identification</a></li>
              <li><a href="#" className="hover:underline">Smart Reminders</a></li>
              <li><a href="#" className="hover:underline">Growth Tracking</a></li>
              <li><a href="#" className="hover:underline">Care Reports</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">About Us</a></li>
              <li><a href="#" className="hover:underline">Blog</a></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="hover:underline">Terms of Service</a></li>
              <li><a href="#" className="hover:underline">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-300 mt-8 pt-6 text-center text-sm">
          &copy; 2025 Sprouty. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
