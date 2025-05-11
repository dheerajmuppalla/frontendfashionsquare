import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CartProvider, useCart } from '../context/CartContext';

const CartContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, setCart } = useCart();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (location.state?.cart) {
      setCart(location.state.cart);
      localStorage.setItem('cart', JSON.stringify(location.state.cart));
    } else if (savedCart.length !== cart.length) {
      setCart(savedCart);
    }
  }, [location.state, cart.length, setCart]);
  

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (productId, change) => {
    const updatedCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const handleProceedToPayment = () => {
    if (cart.length > 0) {
      navigate('/payment', { state: { cart } });
    }
  };

  return (
    <>
      <div className="cart">
        <div className="divider"></div>
        <div className="content">
          <h1>Cart</h1>
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <Link to="/user" className="dashboard-link">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <div>
              <div className="cart-grid">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="remove-button"
                    >
                      Remove
                    </button>
                    <img
                      src={`backendfashionsquare-production.up.railway.app${item.imagePath}`}
                      alt={item.productName}
                      loading="lazy"
                    />
                    <h3>{item.productName}</h3>
                    <p className="price">
                      Price: ₹{item.price} x {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="rating">Rating: {item.rating} ★</p>
                    <div className="quantity-controls">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="quantity-button"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="quantity-button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="total">
                Total: ₹{cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
              <div className="action-buttons">
                <Link to="/user" className="dashboard-link">
                  Back to Dashboard
                </Link>
                <button
                  onClick={handleProceedToPayment}
                  className="payment-button"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="divider"></div>
      </div>
    </>
  );
};

const Cart = () => (
  <CartProvider>
    <CartContent />
  </CartProvider>
);

export default Cart;