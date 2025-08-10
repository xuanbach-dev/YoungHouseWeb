import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import SystemHome from './pages/SystemHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';
import RoomDetail from './pages/RoomDetail';
import Users from './pages/Users';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
              <Route path="/" element={<Home />} />

              <Route path="/system-home" element={<SystemHome />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/rooms/:id" element={<RoomDetail />} />
              <Route path="/posts/:id" element={<PostDetail />} />
              
              {/* Public Routes */}
              <Route path="/contact" element={<Profile />} />
              <Route path="/users" element={<Users />} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
  );
}

export default App;
