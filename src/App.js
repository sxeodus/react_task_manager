import React from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import './App.css';
import Login from './components/Login';
import TaskList from './components/TaskList'; // Rename your original App to TaskList
import Home from './components/Home';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Dummy component for the protected route, now using AuthContext
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const GOOGLE_CLIENT_ID = "25723478688-2gm62khjtgurnapt1oa82jels91lc7et.apps.googleusercontent.com";

// Main App component with routing
const App = () => (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/tasks"
                element={
                  <PrivateRoute>
                    <TaskList />
                  </PrivateRoute>
                } />
            </Routes>
          </Router>
        </AuthProvider>
    </GoogleOAuthProvider>
);

export default App;