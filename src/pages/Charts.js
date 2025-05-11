import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebase';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Charts = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user || user.email !== 'fashionsquare0101@gmail.com') navigate('/login');
    fetchOrders();
  }, [user, loading, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('backendfashionsquare-production.up.railway.app/api/orders');
      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Error fetching orders: ' + err.message);
    }
  };

  // Prepare data for Sales Over Time (Line Chart)
  const salesData = {
    labels: [],
    datasets: [
      {
        label: 'Total Sales (INR)',
        data: [],
        borderColor: '#D4AF37',
        backgroundColor: 'rgba(212, 175, 55, 0.2)',
        fill: true,
      },
    ],
  };

  const salesByDate = {};
  orders.forEach(order => {
    const date = new Date(order.timestamp).toLocaleDateString();
    if (!salesByDate[date]) salesByDate[date] = 0;
    salesByDate[date] += order.amount / 100; // Convert from paise to INR
  });

  salesData.labels = Object.keys(salesByDate).sort((a, b) => new Date(a) - new Date(b));
  salesData.datasets[0].data = salesData.labels.map(date => salesByDate[date]);

  // Prepare data for Orders by Payment Method (Bar Chart)
  const paymentMethodData = {
    labels: ['Razorpay', 'Cash on Delivery'],
    datasets: [
      {
        label: 'Number of Orders',
        data: [0, 0], // [Razorpay, COD]
        backgroundColor: ['#D4AF37', '#1a1a1a'],
        borderColor: ['#D4AF37', '#D4AF37'],
        borderWidth: 1,
      },
    ],
  };

  orders.forEach(order => {
    if (order.paymentMethod === 'razorpay') paymentMethodData.datasets[0].data[0]++;
    else if (order.paymentMethod === 'cash_on_delivery') paymentMethodData.datasets[0].data[1]++;
  });

  return (
    <>
      <div className="charts">
        <div className="header">
          <h1>
            FashionSquare Analytics
          </h1>
        </div>
        {error && (
          <div className="error">{error}</div>
        )}
        <div className="content">
          <section className="section">
            <h2>Sales Over Time</h2>
            <div className="chart-container">
              <Line
                data={salesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#D4AF37' } },
                    title: { display: true, text: 'Sales Trend', color: '#D4AF37', font: { size: 18 } },
                  },
                  scales: {
                    x: { ticks: { color: '#D4AF37' }, grid: { color: 'rgba(212, 175, 55, 0.1)' } },
                    y: { ticks: { color: '#D4AF37' }, grid: { color: 'rgba(212, 175, 55, 0.1)' } },
                  },
                }}
              />
            </div>
          </section>
          <section className="section">
            <h2>Orders by Payment Method</h2>
            <div className="chart-container">
              <Bar
                data={paymentMethodData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { labels: { color: '#D4AF37' } },
                    title: { display: true, text: 'Order Distribution', color: '#D4AF37', font: { size: 18 } },
                  },
                  scales: {
                    x: { ticks: { color: '#D4AF37' }, grid: { color: 'rgba(212, 175, 55, 0.1)' } },
                    y: { ticks: { color: '#D4AF37' }, grid: { color: 'rgba(212, 175, 55, 0.1)' } },
                  },
                }}
              />
            </div>
          </section>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link to="/admin" className="dashboard-link">
            Back to Dashboard
          </Link>
        </div>
        <div className="divider"></div>
      </div>
    </>
  );
};

export default Charts;