import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle, signupWithEmail, logout } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle();
      const userEmail = result.user.email;
      console.log('Google signup result:', userEmail); // Debug log
      if (userEmail === 'fashionsquare0101@gmail.com') navigate('/admin');
      else navigate('/user');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    try {
      const result = await signupWithEmail(email, password);
      const userEmail = result.user.email;
      console.log('Email signup result:', userEmail); // Debug log
      if (userEmail === 'fashionsquare0101@gmail.com') navigate('/admin');
      else navigate('/user');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message);
    }
  };

  if (user) {
    return (
      <div className="signup-container">
        <div className="signup-divider-top"></div>
        <h2 className="signup-logged-in">Logged in as {user.email}</h2>
        <button onClick={handleLogout} className="signup-logout-button">
          Logout
        </button>
        <div className="signup-divider-bottom"></div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <div className="signup-divider-top"></div>
      <div className="signup-content">
        <div className="signup-title-container">
          <h2 className="signup-title">
            <span className="signup-crown-left">👑</span>
            Join FashionSquare
            <span className="signup-crown-right">👑</span>
          </h2>
          <div className="signup-title-underline"></div>
        </div>
        {error && <p className="signup-error">{error}</p>}
        <button onClick={handleGoogleSignup} className="signup-google-button">
          Sign up with Google
        </button>
        <form onSubmit={handleEmailSignup} className="signup-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="signup-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="signup-input"
          />
          <button type="submit" className="signup-email-button">
            Signup with Email
          </button>
        </form>
        <p className="signup-link">
          Already have an account?{' '}
          <Link to="/login" className="signup-link-anchor">
            Login
          </Link>
        </p>
        <p className="signup-link">
          Proceed to{' '}
          <Link to="/details" className="signup-link-anchor">
            Details
          </Link>
        </p>
      </div>
      <div className="signup-divider-bottom"></div>
    </div>
  );
};

export default Signup;