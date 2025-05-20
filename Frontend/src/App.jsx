import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Reminder from './pages/Reminder';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reminder" element={<Reminder />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;