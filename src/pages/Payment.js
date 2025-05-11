import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';

const handlePaymentSuccess = async (response, cart, user, customerDetails, paymentMethod, clearCart, navigate, setPaymentStatus) => {
  setPaymentStatus('Processing payment...');
  try {
    const orderId = `${paymentMethod === 'razorpay' ? 'ONLINE' : 'COD'}_${Date.now()}${paymentMethod === 'razorpay' ? `_${response.razorpay_payment_id}` : ''}`;
    const userId = user?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Update stock
    for (const item of cart) {
      const productResponse = await axios.get(`backendfashionsquare-production.up.railway.app/api/products/${item._id}`);
      const product = productResponse.data;
      if (!product) throw new Error(`Product not found for _id: ${item._id}`);
      if (product.stockAvailable < item.quantity) {
        throw new Error(`Insufficient stock for ${item.productName}`);
      }
      const newStock = product.stockAvailable - item.quantity;
      await axios.put(`backendfashionsquare-production.up.railway.app/api/products/${item._id}`, {
        stockAvailable: newStock,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save order based on payment method
    const totalAmount = calculateTotal(cart) * 100;
    let orderData;
    if (paymentMethod === 'cash_on_delivery') {
      orderData = {
        paymentId: orderId,
        amount: totalAmount,
        items: cart.map(item => ({
          _id: item._id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        userId,
        timestamp: new Date(),
        paymentMethod: 'cash_on_delivery',
        status: 'Pending',
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone, // Renamed to match backend schema
          address: customerDetails.address
        }
      };
    } else {
      // Razorpay (Online Payment)
      orderData = {
        paymentId: orderId,
        amount: totalAmount,
        advanceAmount: 0,
        items: cart.map(item => ({
          _id: item._id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        userId,
        timestamp: new Date(),
        paymentMethod: 'razorpay',
        status: 'Completed (Fully Paid)',
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone, // Renamed to match backend schema
          address: customerDetails.address
        }
      };
    }

    console.log('Sending order data to server:', orderData); // Debug log
    await axios.post('backendfashionsquare-production.up.railway.app/api/orders', orderData);
    clearCart();
    setPaymentStatus(`Order placed successfully! Order ID: ${orderId}. ${paymentMethod === 'cash_on_delivery' ? `Payable on delivery: ₹${totalAmount / 100}` : 'Payment completed.'}`);

    console.log('Cart after clear:', cart);
    if (localStorage.getItem('cart')) {
      console.warn('Cart still in localStorage after clear!');
    } else {
      console.log('localStorage cart removed successfully');
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    navigate('/my-orders');
  } catch (error) {
    console.error('Error response from server:', error.response?.data); // Log server error details
    setPaymentStatus(`Error processing payment: ${error.message}`);
    console.error('Payment error:', error);
  }
};

const calculateTotal = (cart) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

const handleRazorpayPayment = (cart, customerDetails, user, paymentMethod, clearCart, navigate, setPaymentStatus) => {
  if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
    setPaymentStatus('Please fill all customer details!');
    return;
  }
  const options = {
    key: process.env.REACT_APP_RAZORPAY_KEY_ID,
    amount: (calculateTotal(cart) * 100).toFixed(0),
    currency: 'INR',
    name: 'FashionSquare',
    description: 'Purchase from FashionSquare',
    handler: (response) => handlePaymentSuccess(response, cart, user, customerDetails, paymentMethod, clearCart, navigate, setPaymentStatus),
    prefill: { name: customerDetails.name, contact: customerDetails.phone, email: customerDetails.email },
    notes: { address: customerDetails.address },
    theme: { color: '#D4AF37' },
  };
  const rzp = new window.Razorpay(options);
  rzp.on('payment.failed', (error) => setPaymentStatus(`Payment Failed: ${error.description || error.message}`));
  rzp.open();
};

const startPayment = (cart, user, customerDetails, paymentMethod, razorpayLoaded, clearCart, navigate, setPaymentStatus, setShowForm) => {
  if (!cart.length) {
    setPaymentStatus('Cart is empty!');
    return;
  }

  if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
    setShowForm(true);
    setPaymentStatus('Please fill all customer details!');
    return;
  }

  if (paymentMethod === 'razorpay') {
    if (!razorpayLoaded) {
      setPaymentStatus('Razorpay is not loaded yet. Please try again.');
      return;
    }
    if (!process.env.REACT_APP_RAZORPAY_KEY_ID) {
      setPaymentStatus('Razorpay Key ID is missing. Check .env configuration.');
      return;
    }
    handleRazorpayPayment(cart, customerDetails, user, paymentMethod, clearCart, navigate, setPaymentStatus);
  } else if (paymentMethod === 'cash_on_delivery') {
    // Direct COD confirmation without Razorpay
    handlePaymentSuccess({}, cart, user, customerDetails, paymentMethod, clearCart, navigate, setPaymentStatus);
  }
};

const Payment = () => {
  const { cart: contextCart, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [paymentStatus, setPaymentStatus] = useState('Please select a payment method');
  const [cart, setCart] = useState(contextCart);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [showForm, setShowForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (location.state?.cart && location.state.cart.length > 0) {
      setCart(location.state.cart);
      localStorage.setItem('cart', JSON.stringify(location.state.cart));
    } else if (savedCart.length > 0 && contextCart.length === 0) {
      setCart(savedCart);
    }
  }, [location.state, contextCart]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => setPaymentStatus('Failed to load Razorpay script');
    document.body.appendChild(script);

    return () => document.body.removeChild(script);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="payment">
      <div className="gradient-divider top"></div>
      <div className="payment-header">
        <h1 className="payment-title">Payment</h1>
      </div>
      <div className="payment-container">
        <div className="payment-methods">
          <label className="payment-method-label">
            <input
              type="radio"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-method-input"
            />
            Razorpay
          </label>
          <label className="payment-method-label">
            <input
              type="radio"
              value="cash_on_delivery"
              checked={paymentMethod === 'cash_on_delivery'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="payment-method-input"
            />
            Cash on Delivery
          </label>
        </div>

        {cart.length === 0 ? (
          <p className="empty-cart">
            Your cart is empty. <Link to="/cart" className="cart-link">Go back to Cart</Link>
          </p>
        ) : (
          <>
            <h2 className="section-title">Order Summary</h2>
            <div className="order-summary">
              {cart.map((item, index) => (
                <div key={index} className="order-item">
                  <p>{item.productName} x {item.quantity} - ₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <p className="order-total">
              Total: ₹{(calculateTotal(cart)).toFixed(2)}
            </p>

            {showForm && (
              <div className="customer-details">
                <h3 className="details-title">Customer Details</h3>
                <input
                  type="text"
                  name="name"
                  value={customerDetails.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="form-input"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={customerDetails.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="form-input"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={customerDetails.phone}
                  onChange={handleInputChange}
                  placeholder="Phone"
                  className="form-input"
                  required
                />
                <textarea
                  name="address"
                  value={customerDetails.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="form-textarea"
                  required
                />
              </div>
            )}

            <div className="payment-actions">
              <button
                onClick={() => startPayment(cart, user, customerDetails, paymentMethod, razorpayLoaded, clearCart, navigate, setPaymentStatus, setShowForm)}
                disabled={paymentMethod === 'razorpay' && !razorpayLoaded}
                className="pay-button"
              >
                {paymentMethod === 'razorpay' ? 'Pay Now' : 'Confirm COD Order'}
              </button>
              <Link to="/cart" className="back-button">
                Back to Cart
              </Link>
              <p>If You Want Cancel the order Place visit Help And Support</p>
            </div>
            <p className="payment-status">{paymentStatus}</p>
          </>
        )}
      </div>
      <div className="gradient-divider bottom"></div>
    </div>
  );
};

export default Payment;