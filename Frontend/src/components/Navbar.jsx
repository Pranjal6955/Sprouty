import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/login" className="logo">
          Sprouty
        </Link>
        <div className="flex space-x-4">
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/signup" className="nav-link">
            Sign Up
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;