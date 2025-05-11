import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
// import './App.css';

const Navbar = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setIsMenuOpen(false);
    } catch (err) {
      console.error(err.message);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1 className="logo-text">
            <span className="crown-left">👑</span>
            FashionSquare
            <span className="crown-right">👑</span>
          </h1>
          <div className="logo-underline"></div>
        </div>

        <div className="navbar-desktop-menu">
          {!user ? (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/signup" className="nav-link">
                Signup
              </Link>
            </>
          ) : (
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
          )}
        </div>

        <button
          onClick={toggleMenu}
          className="navbar-mobile-toggle"
          aria-label="Toggle menu"
        >
          <svg className="hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      <div className={`navbar-mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        {user ? (
          <button
            onClick={() => {
              handleLogout();
              toggleMenu();
            }}
            className="nav-button mobile"
          >
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="nav-link mobile" onClick={toggleMenu}>
              Login
            </Link>
            <Link to="/signup" className="nav-link mobile" onClick={toggleMenu}>
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;