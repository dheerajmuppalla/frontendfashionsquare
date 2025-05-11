import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Payment from './pages/Payment';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import DetailsPage from './pages/DetailsPage';
import ForgotPassword from './pages/ForgotPassword';
// import ResetPassword from './pages/ResetPassword';
import './process-shim.js';
import { CartProvider } from './context/CartContext';
import CodConfirmation from './pages/CodConfirmation';
import HelpSupport from './pages/HelpSupport';
import MyOrders from './pages/MyOrders';
import Charts from './pages/Charts';

function App() {
  const [user] = useAuthState(auth);

  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={!user ? <Login /> : <Navigate to={user?.email === 'fashionsquare0101@gmail.com' ? '/admin' : '/user'} />}
          />
          <Route
            path="/signup"
            element={!user ? <Signup /> : <Navigate to={user?.email === 'fashionsquare0101@gmail.com' ? '/admin' : '/user'} />}
          />
          <Route
            path="/forgot-password"
            element={!user ? <ForgotPassword /> : <Navigate to={user?.email === 'fashionsquare0101@gmail.com' ? '/admin' : '/user'} />}
          />
          {/* <Route
            path="/reset-password"
            element={!user ? <ResetPassword /> : <Navigate to={user?.email === 'fashionsquare0101@gmail.com' ? '/admin' : '/user'} />}
          /> */}
          <Route
            path="/user"
            element={user && user.email !== 'fashionsquare0101@gmail.com' ? <UserDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={user && user.email === 'fashionsquare0101@gmail.com' ? <AdminDashboard /> : <Navigate to="/login" />}
          />
          <Route
            path="/charts"
            element={user && user.email === 'fashionsquare0101@gmail.com' ? <Charts /> : <Navigate to="/login" />}
          />
          <Route
            path="/details"
            element={user ? <DetailsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/wishlist"
            element={user && user.email !== 'fashionsquare0101@gmail.com' ? <Wishlist /> : <Navigate to={user ? '/admin' : '/login'} />}
          />
          <Route
            path="/cart"
            element={user && user.email !== 'fashionsquare0101@gmail.com' ? <Cart /> : <Navigate to={user ? '/admin' : '/login'} />}
          />
          <Route path="/help-support" element={<HelpSupport />} />
          <Route
            path="/payment"
            element={user && user.email !== 'fashionsquare0101@gmail.com' ? <Payment /> : <Navigate to={user ? '/admin' : '/login'} />}
          />
          <Route
            path="/cod-confirmation"
            element={user && user.email !== 'fashionsquare0101@gmail.com' ? <CodConfirmation /> : <Navigate to={user ? '/admin' : '/login'} />}
          />
          <Route
            path="/my-orders"
            element={user && user.email !== 'fashionsquare0101@gmail.com' ? <MyOrders /> : <Navigate to={user ? '/admin' : '/login'} />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;