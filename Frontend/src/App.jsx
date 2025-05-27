import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Signup from './pages/Signup';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import Reminder from './pages/Reminder';
import Profile from './pages/Profile';
import GardenLog from './pages/GardenLog';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reminder" element={<Reminder />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/gardenLog" element={<GardenLog />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;