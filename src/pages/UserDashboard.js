import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [categories, setCategories] = useState(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('backendfashionsquare-production.up.railway.app/api/products');
      console.log('Fetched products:', response.data); // Debug log
      const fixedProducts = response.data.map(p => {
        let sizes = p.sizes || [];
        const productNameLower = p.productName.toLowerCase().trim();

        // Fallback sizes only if none provided, no predefined values
        if (sizes.length === 0) {
          if (productNameLower.includes('night') && productNameLower.includes('pants') || productNameLower.includes('jeans')) {
            sizes = [];
          } else if (productNameLower.includes('shirts') || productNameLower.includes('hoddies') || productNameLower.includes('t-shirts') || productNameLower.includes('shorts') || productNameLower.includes('boxers') || productNameLower.includes('blouses') || productNameLower.includes('kurthas')) {
            sizes = [];
          } else if (productNameLower.includes('saree')) {
            sizes = [];
          } else if (productNameLower.includes('shoe') || productNameLower.includes('slipper')) {
            sizes = [];
          } else if (productNameLower.includes('bangle')) {
            sizes = [];
          }
        }

        return {
          ...p,
          category:
            p.category.toLowerCase() === 'eletronics' ? 'Electronics' :
            p.category.toLowerCase() === 'fansy' ? 'Fancy' :
            p.category.toLowerCase() === 'birthdayspary' ? 'Birthday Spray' :
            p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase(),
          rating: p.rating !== undefined && p.rating !== null ? Number(p.rating) : null,
          sizes: sizes
        };
      });
      setProducts(fixedProducts);
      console.log('Processed products:', fixedProducts); // Debug log
      const uniqueCategories = ['all', ...new Set(fixedProducts.map(product => product.category.toLowerCase()))]
        .map(category => category === 'all' ? 'all' : category.charAt(0).toUpperCase() + category.slice(1).toLowerCase());
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const addToWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist.find(item => item.id === product.id)) {
      const updatedWishlist = [...wishlist, product];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      navigate('/wishlist', { state: { wishlist: updatedWishlist } });
    } else {
      navigate('/wishlist', { state: { wishlist } });
    }
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    navigate('/cart', { state: { cart: updatedCart } });
    console.log(updatedCart);
  };

  const sortedProducts = () => {
    let result = [...products];
    if (sort === 'low-to-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'high-to-low') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'top-rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    if (filter !== 'all') {
      result = result.filter(product => product.category.toLowerCase() === filter.toLowerCase());
    }
    if (searchQuery.trim() !== '') {
      result = result.filter(product =>
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  };

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-divider-top"></div>
      <div className="user-dashboard-content">
        <h1 className="user-dashboard-title">The Velvet Throne</h1>
        <div className="user-dashboard-navigation">
          <Link to="/wishlist" state={{ wishlist: JSON.parse(localStorage.getItem('wishlist') || '[]') }} className="user-dashboard-nav-link wishlist-link">
            View Wishlist ({JSON.parse(localStorage.getItem('wishlist') || '[]').length})
          </Link>
          <Link to="/cart" state={{ cart: JSON.parse(localStorage.getItem('cart') || '[]') }} className="user-dashboard-nav-link cart-link">
            View Cart ({JSON.parse(localStorage.getItem('cart') || '[]').length})
          </Link>
          <Link to="/help-support" className="user-dashboard-nav-link help-link">
            Help & Support
          </Link>
          <Link to="/my-orders" state={{ orders: JSON.parse(localStorage.getItem('orders') || '[]') }} className="user-dashboard-nav-link orders-link">
            My Orders ({JSON.parse(localStorage.getItem('orders') || '[]').length})
          </Link>
        </div>
        <div className="user-dashboard-filters">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name..."
            className="user-dashboard-search-input"
          />
          <select
            onChange={(e) => setFilter(e.target.value)}
            className="user-dashboard-filter-select"
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => setSort(e.target.value)}
            className="user-dashboard-sort-select"
          >
            <option value="default">Sort By</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="top-rating">Top Rating</option>
          </select>
        </div>
        <div className="user-dashboard-products-grid">
          {sortedProducts().map((product) => (
            <div key={product.id} className="user-dashboard-product-item">
              <img
                src={`backendfashionsquare-production.up.railway.app${product.imagePath}`}
                alt={product.productName}
                className="user-dashboard-product-image"
              />
              <h3 className="user-dashboard-product-name">{product.productName}</h3>
              <p className="user-dashboard-product-price">₹{product.price}</p>
              <p className="user-dashboard-product-rating">Rating: {product.rating || 'N/A'} ★</p>
              {product.sizes && product.sizes.length > 0 && (
                <p className="user-dashboard-product-sizes">Sizes: {product.sizes.join(', ')}</p>
              )}
              <div className="user-dashboard-product-buttons">
                <button
                  onClick={() => addToWishlist(product)}
                  className="user-dashboard-wishlist-button"
                >
                  <span role="img" aria-label="wishlist">❤️</span> Add to Wishlist
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="user-dashboard-cart-button"
                >
                  <span role="img" aria-label="cart">🛒</span> Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="user-dashboard-payment-link">
        <Link to="/payment">Proceed to Payment</Link>
      </div>
      <div className="user-dashboard-divider-bottom"></div>
    </div>
  );
};

export default UserDashboard;