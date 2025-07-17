import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to Your Task Manager</h1>
      <p className="intro-text">
        Stay organized, boost your productivity, and manage your projects with ease. Our Task Manager is designed to help you keep track of everything in one place.
      </p>
      
      <h2>Key Features:</h2>
      <ul className="features-list">
        <li>✓ User registration and secure authentication (including Google login).</li>
        <li>✓ Create, Read, Update, and Delete tasks and projects.</li>
        <li>✓ Set deadlines, priorities, and track task status.</li>
        <li>✓ Organize tasks with intuitive drag-and-drop functionality.</li>
        <li>✓ Experience real-time updates for seamless collaboration.</li>
      </ul>

      <div className="home-buttons">
        <Link to="/login" className="btn btn-primary">Log In</Link>
        <Link to="/register" className="btn btn-secondary">Sign Up</Link>
      </div>
    </div>
  );
};

export default Home;