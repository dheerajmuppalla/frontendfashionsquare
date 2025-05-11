import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';
import { useCart } from '../context/CartContext';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [totalSpent, setTotalSpent] = useState(0);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.uid) {
        navigate('/login');
        return;
      }
      try {
        console.log('Fetching orders for user:', user.uid);
        const response = await axios.get(`backendfashionsquare-production.up.railway.app/api/orders/user/${user.uid}`);
        console.log('Orders fetched:', response.data);
        const fetchedOrders = response.data;
        setOrders((prevOrders) => {
          console.log('Previous orders:', prevOrders);
          console.log('New orders:', fetchedOrders);
          return fetchedOrders;
        });
        const total = fetchedOrders.reduce((sum, order) => sum + (order.amount / 100), 0);
        setTotalSpent(total);

        if (fetchedOrders.length > 0) {
          clearCart();
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchUserOrders();
  }, [user, navigate, clearCart]);

  // Prepare data for Spending Over Time (Line Chart)
  const spendingData = {
    labels: [],
    datasets: [
      {
        label: 'Spending (INR)',
        data: [],
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        fill: true,
      },
    ],
  };

  const spendingByDate = {};
  orders.forEach(order => {
    const date = new Date(order.timestamp).toLocaleDateString();
    if (!spendingByDate[date]) spendingByDate[date] = 0;
    spendingByDate[date] += order.amount / 100;
  });

  spendingData.labels = Object.keys(spendingByDate).sort((a, b) => new Date(a) - new Date(b));
  spendingData.datasets[0].data = spendingData.labels.map(date => spendingByDate[date]);

  console.log('Current orders state on render:', orders);

  return (
    <div className="my-orders">
      <div className="gradient-divider top"></div>
      <div className="orders-container">
        <h1 className="orders-title">My Orders</h1>
        <div className="summary-section">
          <h2 className="summary-title">
            Total Spent: ₹{totalSpent.toFixed(2)} | Number of Orders: {orders.length}
          </h2>
          {orders.length > 0 && (
            <>
              <h3 className="chart-title">Spending Over Time</h3>
              <div className="chart-wrapper">
                <Line
                  data={spendingData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#D4AF37' } },
                      title: { display: true, text: 'Your Spending Trend', color: '#D4AF37', font: { size: 16 } },
                    },
                    scales: {
                      x: { ticks: { color: '#D4AF37' }, grid: { color: 'rgba(212, 175, 55, 0.1)' } },
                      y: { ticks: { color: '#D4AF37' }, grid: { color: 'rgba(212, 175, 55, 0.1)' } },
                    },
                  }}
                />
              </div>
            </>
          )}
        </div>
        {orders.length === 0 ? (
          <p className="no-orders">You have no orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div key={index} className="order-card">
                <h3 className="order-id">Order ID: {order.paymentId || order._id}</h3>
                <p className="order-info">Date: {new Date(order.timestamp).toLocaleDateString()}</p>
                <p className="order-info">Payment Method: {order.paymentMethod}</p>
                <p className="order-info">Status: {order.status}</p>
                <h4 className="items-title">Items:</h4>
                <ul className="items-list">
                  {order.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="item">
                      {item.productName} (x{item.quantity}) - ₹{(item.price * item.quantity).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p className="order-total">Total: ₹{(order.amount / 100).toFixed(2)}</p>
                {order.customer && (
                  <div className="customer-info">
                    {console.log('Customer data for order:', order.customer)}
                    <p><strong>Customer Name:</strong> {order.customer.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {order.customer.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {order.customer.contact || order.customer.phone || 'N/A'}</p> {/* Added fallback for phone */}
                    <p><strong>Address:</strong> {order.customer.address || 'N/A'}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <Link to="/user" className="dashboard-button">
          Back to Dashboard
        </Link>
      </div>
      <div className="gradient-divider bottom"></div>
    </div>
  );
};

export default MyOrders;