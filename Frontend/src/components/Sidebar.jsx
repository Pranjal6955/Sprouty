import React from 'react';
import { Menu, LogOut, Settings, User, Home, Book, Bell } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const NavItem = ({ icon, label, isActive, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center space-x-4 p-2.5 rounded-lg cursor-pointer transition-colors ${
      isActive 
        ? 'bg-green-50 text-green-600' 
        : 'hover:bg-gray-100 text-gray-600'
    }`}
  >
    <div className={isActive ? 'text-green-600' : 'text-gray-500'}>{icon}</div>
    <span className={`${isActive ? 'font-medium' : ''} transition-all`}>{label}</span>
  </div>
);

const Sidebar = ({ isMenuOpen, setIsMenuOpen, activeNavItem, setActiveNavItem }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className={`bg-white h-full shadow-lg transition-all duration-300 ease-in-out ${
      isMenuOpen ? 'w-64' : 'w-16'
    } flex flex-col border-r border-gray-100`}>
      {/* Hamburger Menu */}
      <div className="p-4 flex justify-center">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={22} className="text-gray-600" />
        </button>
      </div>

      {/* Navigation Items - Only show when menu is open */}
      <div className="flex-1 px-2">
        {isMenuOpen && (
          <div className="space-y-4 mt-4">
            <NavItem 
              icon={<Home size={20} />} 
              label="Home" 
              isActive={activeNavItem === 'Home'} 
              onClick={() => setActiveNavItem('Home')}
            />
            <NavItem 
              icon={<Book size={20} />} 
              label="Garden Log" 
              isActive={activeNavItem === 'Garden Log'} 
              onClick={() => setActiveNavItem('Garden Log')}
            />
            <NavItem 
              icon={<Bell size={20} />} 
              label="Reminders" 
              isActive={activeNavItem === 'Reminders'} 
              onClick={() => setActiveNavItem('Reminders')}
            />
            <NavItem 
              icon={<User size={20} />} 
              label="Profile" 
              isActive={activeNavItem === 'Profile'} 
              onClick={() => setActiveNavItem('Profile')}
            />
            <NavItem 
              icon={<Settings size={20} />} 
              label="Settings" 
              isActive={activeNavItem === 'Settings'} 
              onClick={() => setActiveNavItem('Settings')}
            />
          </div>
        )}
      </div>

      {/* Logout Button - Always visible */}
      <div className="p-2 border-t border-gray-100">
        <button 
          onClick={handleLogout} 
          className={`flex items-center justify-center w-full p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors ${
            isMenuOpen ? 'justify-start px-4' : 'justify-center'
          }`}
        >
          <LogOut size={20} />
          {isMenuOpen && <span className="ml-3 font-medium">Log Out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
