import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const Wishlist = () => {
  const location = useLocation();
  const [wishlist, setWishlist] = useState(location.state?.wishlist || JSON.parse(localStorage.getItem('wishlist') || '[]'));

  useEffect(() => {
    // Sync with location.state if provided, otherwise ensure localStorage is up to date on mount
    if (location.state?.wishlist) {
      setWishlist(location.state.wishlist);
      localStorage.setItem('wishlist', JSON.stringify(location.state.wishlist));
    } else {
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (savedWishlist.length > 0) {
        setWishlist(savedWishlist); // Only update if localStorage has data
      }
    }
  }, [location.state]);

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  return (
    <div className="wishlist-container">
      <div className="wishlist-divider-top"></div>
      <div className="wishlist-content">
        <h1 className="wishlist-title">Wishlist</h1>
        {wishlist.length === 0 ? (
          <p className="wishlist-empty">Your wishlist is empty.</p>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-item">
                <button
                  onClick={() => removeFromWishlist(item.id)}
                  className="wishlist-remove-button"
                >
                  Remove
                </button>
                <img
                  src={`backendfashionsquare-production.up.railway.app${item.imagePath}`}
                  alt={item.productName}
                  className="wishlist-item-image"
                />
                <h3 className="wishlist-item-name">{item.productName}</h3>
                <p className="wishlist-item-price">₹{item.price}</p>
                <p className="wishlist-item-rating">Rating: {item.rating} ★</p>
              </div>
            ))}
          </div>
        )}
        <div className="wishlist-back-container">
          <Link to="/user" className="wishlist-back-button">
            Back to Dashboard
          </Link>
        </div>
      </div>
      <div className="wishlist-divider-bottom"></div>
    </div>
  );
};

export default Wishlist;