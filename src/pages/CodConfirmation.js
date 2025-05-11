import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CodConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const cart = location.state?.cart || [];
  const [paymentStatus, setPaymentStatus] = useState('Please fill in your details and confirm your COD order');
  const [userDetails, setUserDetails] = useState({
    name: '',
    contact: '',
    email: '',
    address: ''
  });

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleConfirmPayment = async () => {
    if (!cart.length) {
      setPaymentStatus('Cart is empty!');
      return;
    }
    if (!userDetails.name || !userDetails.contact || !userDetails.email || !userDetails.address) {
      setPaymentStatus('Please fill in all user details!');
      return;
    }

    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      setPaymentStatus('Invalid total amount!');
      return;
    }

    try {
      // Update stock for all items
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
        }).then(res => console.log(`Stock updated for ${item._id}:`, res.data))
          .catch(err => console.error(`Stock update failed for ${item._id}:`, err.response?.data));
      }

      const fullOrderId = `ORDER_${Date.now()}`;
      const orderData = {
        paymentId: fullOrderId,
        amount: totalAmount * 100, // Full amount in paise
        items: cart.map(item => ({
          _id: item._id,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        timestamp: new Date(),
        paymentMethod: 'cash_on_delivery',
        status: 'Pending',
        customer: {
          name: userDetails.name,
          contact: userDetails.contact,
          email: userDetails.email,
          address: userDetails.address
        }
      };

      console.log('Order data:', orderData);
      await axios.post('backendfashionsquare-production.up.railway.app/api/orders', orderData, {
        headers: { 'Content-Type': 'application/json' }
      }).then(res => console.log('Order saved:', res.data))
        .catch(err => console.error('Order save failed:', err.response?.data));
      setPaymentStatus(`Order placed successfully! Order ID: ${fullOrderId}. Payable on delivery: ₹${totalAmount.toFixed(2)}`);
      localStorage.removeItem('cart');
    } catch (error) {
      setPaymentStatus(`Error processing order: ${error.message}`);
      console.error('Order error:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="cod-confirmation">
      <div className="gradient-divider top"></div>
      <div className="confirmation-container">
        <h1 className="confirmation-title">COD Confirmation</h1>
        <div className="order-summary">
          <h2 className="section-title">Order Summary</h2>
          {cart.length === 0 ? (
            <p className="no-items">No items in cart.</p>
          ) : (
            <div>
              {cart.map((item, index) => (
                <div key={index} className="cart-item">
                  <span>{item.productName} (x{item.quantity})</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="total">Total: ₹{calculateTotal().toFixed(2)}</div>
            </div>
          )}
        </div>
        <div className="user-details">
          <h2 className="section-title">User Details</h2>
          <form className="user-form">
            <input
              type="text"
              name="name"
              value={userDetails.name}
              onChange={handleInputChange}
              placeholder="Full Name"
              required
              className="form-input"
            />
            <input
              type="tel"
              name="contact"
              value={userDetails.contact}
              onChange={handleInputChange}
              placeholder="Contact Number"
              required
              className="form-input"
            />
            <input
              type="email"
              name="email"
              value={userDetails.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              className="form-input"
            />
            <textarea
              name="address"
              value={userDetails.address}
              onChange={handleInputChange}
              placeholder="Delivery Address"
              required
              className="form-textarea"
            />
          </form>
        </div>
        <button
          onClick={handleConfirmPayment}
          disabled={cart.length === 0 || !userDetails.name || !userDetails.contact || !userDetails.email || !userDetails.address}
          className="confirm-button"
        >
          Confirm COD Order
        </button>
        <p className="payment-status">{paymentStatus}</p>
        <button
          onClick={() => navigate('/cart')}
          className="back-button"
        >
          Back to Cart
        </button>
      </div>
      <div className="gradient-divider bottom"></div>
    </div>
  );
};

export default CodConfirmation;