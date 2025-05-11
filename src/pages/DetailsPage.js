import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const DetailsPage = () => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Log the details
    console.log({ name, address, contact, user: auth.currentUser?.email });
    
    // Save customer details to localStorage
    const customerDetails = { name, address, contact, email: auth.currentUser?.email };
    localStorage.setItem('customerDetails', JSON.stringify(customerDetails));
    
    // Navigate based on user email
    navigate(auth.currentUser?.email === 'admin@examples.com' ? '/admin' : '/user');
  };

  return (
    <div className="details-page">
      <div className="gradient-divider top"></div>
      <div className="form-container">
        <h2 className="form-title">Additional Details</h2>
        <form onSubmit={handleSubmit} className="details-form">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            required
            className="form-input"
          />
          <input
            type="tel"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact Number"
            required
            className="form-input"
          />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            required
            className="form-input"
          />
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
      <div className="gradient-divider bottom"></div>
    </div>
  );
};

export default DetailsPage;