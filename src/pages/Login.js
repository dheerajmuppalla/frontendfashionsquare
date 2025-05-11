import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithGoogle, loginWithEmail, logout } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      console.log('User logged in:', user.email);
      if (user.email === 'fashionsquare0101@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const userEmail = result.user.email;
      console.log('Google login result:', userEmail);
      if (userEmail === 'fashionsquare0101@gmail.com') navigate('/admin');
      else navigate('/user');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await loginWithEmail(email, password);
      const userEmail = result.user.email;
      console.log('Email login result:', userEmail);
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
      <div className="login-container">
        <div className="login-divider-top"></div>
        <h2 className="login-logged-in">Logged in as {user.email}</h2>
        <button onClick={handleLogout} className="login-logout-button">
          Logout
        </button>
        <div className="login-divider-bottom"></div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-divider-top"></div>
      <div className="login-content">
        <div className="login-title-container">
          <h2 className="login-title">
            <span className="login-crown-left">👑</span>
            Welcome to FashionSquare
            <span className="login-crown-right">👑</span>
          </h2>
          <div className="login-title-underline"></div>
        </div>
        {error && <p className="login-error">{error}</p>}
        <button onClick={handleGoogleLogin} className="login-google-button">
          Sign in with Google
        </button>
        <form onSubmit={handleEmailLogin} className="login-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="login-input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="login-input"
          />
          <button type="submit" className="login-email-button">
            Login with Email
          </button>
        </form>
        <p className="login-link">
          Forgot your password?{' '}
          <Link to="/forgot-password" className="login-link-anchor">
            Reset it here
          </Link>
        </p>
        <p className="login-link">
          Don't have an account?{' '}
          <Link to="/signup" className="login-link-anchor">
            Sign up
          </Link>
        </p>
      </div>
      <div className="login-divider-bottom"></div>
    </div>
  );
};

export default Login;