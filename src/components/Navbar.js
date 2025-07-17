import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const { isLoggedIn } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/" className="nav-link">Home</Link>
            {isLoggedIn ? (
                <>
                    <Link to="/tasks" className="nav-link">Tasks</Link>
                </>
            ) : (
                <>
                    <Link to="/login" className="nav-link">Login</Link>
                    <Link to="/register" className="nav-link">Register</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;