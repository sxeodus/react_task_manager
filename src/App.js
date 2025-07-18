import React from 'react'; 
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Register from './components/Register';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import './App.css';
import Login from './components/Login';
import TaskList from './components/TaskList'; 
import Home from './components/Home';
import useAuth from './hooks/useAuth';
import { GoogleOAuthProvider } from '@react-oauth/google';


const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    // While checking auth, you can show a loading spinner or simply nothing.
    return <div>Loading...</div>;
  }

  return isLoggedIn ? children : <Navigate to="/login" />;
};

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;


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