import React from 'react';
import { Link } from 'react-router-dom';

const HelpSupport = () => {
  return (
    <div className="help-support">
      <div className="gradient-divider top"></div>
      <div className="support-container">
        <h1 className="support-title">Help & Support</h1>
        <div className="contact-section">
          <h2 className="section-title">Contact Admin</h2>
          <p className="section-text">For any assistance, feel free to reach out to our admin:</p>
          <p className="admin-name">Name: Yehoshuva Eluri</p>
          <p className="admin-contact">Email: fashionsquare0101@gmail.com</p>
          <p className="admin-contact">Phone: 7659959051</p>
        </div>
        <div className="support-details">
          <h2 className="section-title">Support Details</h2>
          <p className="section-text">Operating Hours: 9:00 AM - 6:00 PM (EST), Monday - Friday</p>
          <p className="section-text">Support is available for product inquiries, payment issues, and more.</p>
        </div>
        <Link to="/user" className="dashboard-button">
          Back to Dashboard
        </Link>
      </div>
      <div className="gradient-divider bottom"></div>
    </div>
  );
};

export default HelpSupport;