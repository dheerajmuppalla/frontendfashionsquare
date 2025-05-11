import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../services/firebase';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const actionCodeSettings = {
        url: 'http://localhost:3000/reset-password',
        handleCodeInApp: true,
      };
      await resetPassword(email, actionCodeSettings);
      setMessage('Password reset email sent! Check your inbox (and spam/junk folder).');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error('Error sending password reset email:', err);
      if (err.code === 'auth/invalid-email') {
        setError('Invalid email address. Please check and try again.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No user found with this email. Please sign up first.');
      } else {
        setError('Failed to send password reset email. Please try again later.');
      }
    }
  };

  return (
    <div className="forgot-password">
      <h1 className="forgot-password-title">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <label htmlFor="email" className="form-label">Enter your email address:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="example@email.com"
          className="form-input"
        />
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button">Send Reset Email</button>
      </form>
      <p className="login-link">
        Remember your password? <Link to="/login" className="link">Log In</Link>
      </p>
    </div>
  );
};

export default ForgotPassword;