import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    id: 0,
    productName: '',
    description: '',
    price: '',
    rating: null,
    stockAvailable: '',
    imagePath: '',
    category: '',
    image: null,
    sizes: ''
  });
  const [editProduct, setEditProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('backendfashionsquare-production.up.railway.app/api/products', { cache: 'no-store' });
      const fixedProducts = response.data.map(p => ({
        ...p,
        category:
          p.category.toLowerCase() === 'eletronics' ? 'Electronics' :
          p.category.toLowerCase() === 'fansy' ? 'Fancy' :
          p.category.toLowerCase() === 'birthdayspary' ? 'Birthday Spray' :
          p.category.charAt(0).toUpperCase() + p.category.slice(1).toLowerCase(),
        rating: p.rating !== undefined && p.rating !== null ? Number(p.rating) : null,
      }));
      setProducts(fixedProducts);
      setError(null);
    } catch (err) {
      setError('Network error fetching products: ' + err.message);
      console.error('Fetch error:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('backendfashionsquare-production.up.railway.app/api/orders');
      console.log('Raw orders from API:', response.data);
      setAllOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Network error fetching orders: ' + err.message);
      console.error('Fetch error:', err);
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    console.log('Adding product with sizes:', newProduct.sizes); // Debug log
    const formData = new FormData();
    formData.append('productName', newProduct.productName);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('rating', newProduct.rating || 0);
    formData.append('stockAvailable', newProduct.stockAvailable);
    formData.append('category', newProduct.category);
    formData.append('sizes', newProduct.sizes || ''); // Ensure sizes is sent even if empty
    if (newProduct.image) formData.append('image', newProduct.image);

    // Log FormData entries for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry - ${key}: ${value}`);
    }

    try {
      const response = await axios.post('backendfashionsquare-production.up.railway.app/api/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Product created with sizes:', response.data);
      setNewProduct({
        id: 0,
        productName: '',
        description: '',
        price: '',
        rating: null,
        stockAvailable: '',
        imagePath: '',
        category: '',
        image: null,
        sizes: ''
      });
      fetchProducts();
      setShowAddForm(false);
      setError(null);
    } catch (err) {
      setError('Error adding product: ' + err.message);
      console.error('Add error:', err.response ? err.response.data : err);
    }
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    if (!editProduct || !editProduct._id) return;

    console.log('Updating product with sizes:', editProduct.sizes); // Debug log
    const formData = new FormData();
    formData.append('productName', editProduct.productName);
    formData.append('description', editProduct.description);
    formData.append('price', editProduct.price);
    formData.append('rating', editProduct.rating || 0);
    formData.append('stockAvailable', editProduct.stockAvailable);
    formData.append('category', editProduct.category);
    formData.append('sizes', editProduct.sizes || ''); // Ensure sizes is sent even if empty
    if (editProduct.image) formData.append('image', editProduct.image);
    else formData.append('imagePath', editProduct.imagePath);

    // Log FormData entries for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`FormData entry - ${key}: ${value}`);
    }

    try {
      const response = await axios.put(`backendfashionsquare-production.up.railway.app/api/products/${editProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Product updated with sizes:', response.data);
      setEditProduct(null);
      fetchProducts();
      setError(null);
    } catch (err) {
      console.error('Update error details:', err.response ? err.response.data : err.message);
      setError('Error updating product: ' + (err.response ? err.response.data.message : err.message));
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`backendfashionsquare-production.up.railway.app/api/products/${id}`);
      fetchProducts();
      setError(null);
    } catch (err) {
      setError('Error deleting product: ' + err.message);
      console.error('Delete error:', err);
    }
  };

  const startUpdate = (product) => {
    setEditProduct({
      ...product,
      rating: product.rating || null,
      sizes: product.sizes ? product.sizes.join(', ') : ''
    });
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      setError('Error logging out: ' + err.message);
      console.error('Logout error:', err);
    }
  };

  return (
    <>
      <div className="admin-dashboard">
        <div className="header">
          <h1>
            <span className="crown">👑</span>FashionSquare<span className="crown">👑</span>
          </h1>
          <h2>Admin Dashboard</h2>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
        <div style={{ textAlign: 'center', marginBottom: '2vw' }}>
          <Link to="/charts" className="analytics-link">
            View Analytics
          </Link>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="content">
          <section className="section">
            <div className="products-header">
              <h2>Products</h2>
              <div className="button-group">
                <button onClick={() => setShowAddForm(!showAddForm)}>
                  {showAddForm ? 'Hide Form' : '+ Add Product'}
                </button>
                <button onClick={fetchProducts}>Refresh Stock</button>
              </div>
            </div>
            {showAddForm && (
              <form onSubmit={addProduct} className="form">
                <div className="form-grid">
                  <div>
                    <label>Product Name</label>
                    <input
                      value={newProduct.productName}
                      onChange={e => setNewProduct({ ...newProduct, productName: e.target.value })}
                      placeholder="Product Name"
                      required
                    />
                  </div>
                  <div>
                    <label>Price</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="Price"
                      required
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label>Category</label>
                    <input
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      placeholder="Category"
                      required
                    />
                  </div>
                  <div>
                    <label>Rating</label>
                    <input
                      type="number"
                      value={newProduct.rating === null ? '' : newProduct.rating}
                      onChange={e => {
                        const value = e.target.value === '' ? null : Number(e.target.value);
                        if (value === null || (value >= 0 && value <= 5)) {
                          setNewProduct({ ...newProduct, rating: value });
                        }
                      }}
                      placeholder="Rating (0-5)"
                      required
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>
                  <div>
                    <label>Stock Available</label>
                    <input
                      type="number"
                      value={newProduct.stockAvailable}
                      onChange={e => setNewProduct({ ...newProduct, stockAvailable: e.target.value })}
                      placeholder="Stock"
                      required
                    />
                  </div>
                  <div>
                    <label>Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setNewProduct({ ...newProduct, image: e.target.files[0] })}
                    />
                  </div>
                  <div>
                    <label>Sizes (comma-separated, e.g., 7,8.5,S,M)</label>
                    <input
                      value={newProduct.sizes}
                      onChange={e => setNewProduct({ ...newProduct, sizes: e.target.value })}
                      placeholder="Sizes (e.g., 7,8.5,S,M)"
                      
                    />
                  </div>
                </div>
                <div>
                  <label>Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Description"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2vw' }}>
                  <button type="submit" className="submit-button">Add Product</button>
                </div>
              </form>
            )}
            <div className="product-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="overlay"></div>
                  <div className="content">
                    <div style={{ flex: '0 0 auto' }}>
                      <img
                        src={`backendfashionsquare-production.up.railway.app${product.imagePath}`}
                        alt={product.productName}
                        loading="lazy"
                      />
                    </div>
                    <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                      <h3>{product.productName}</h3>
                      <div className="price">₹{product.price}</div>
                      <div className="tags">
                        <span>{product.category}</span>
                        <span>⭐ {product.rating !== null && product.rating !== undefined ? product.rating.toFixed(1) : 'N/A'}</span>
                        <span>Stock: {product.stockAvailable}</span>
                        {product.sizes && product.sizes.length > 0 && (
                          <span>Sizes: {product.sizes.join(', ')}</span>
                        )}
                      </div>
                      <p>{product.description}</p>
                      <div className="buttons">
                        <button onClick={() => startUpdate(product)}>Edit</button>
                        <button onClick={() => deleteProduct(product._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="section orders">
            <h2>All Orders</h2>
            <div className="button-group">
              <button onClick={fetchOrders}>Refresh Orders</button>
            </div>
            {allOrders.length === 0 ? (
              <p className="no-orders">No orders yet.</p>
            ) : (
              <div className="order-list">
                {allOrders.map((order, index) => (
                  <div key={index} className="order-card">
                    <h4>Order ID: {order.paymentId || order._id}</h4>
                    <p>User ID: {order.userId}</p>
                    <p>Date: {new Date(order.timestamp).toLocaleDateString()}</p>
                    <p>Method: {order.paymentMethod}</p>
                    <p>Status: {order.status}</p>
                    <p>Total: ₹{(order.amount / 100).toFixed(2)}</p>
                    <p>Advance Paid: ₹{(order.advanceAmount / 100).toFixed(2)}</p>
                    <h5>Items:</h5>
                    <ul>
                      {order.items.map((item, itemIndex) => (
                        <li key={itemIndex}>
                          {item.productName} (x{item.quantity}) - ₹{(item.price * item.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                    {order.customer ? (
                      <div className="customer-info">
                        <p><strong>Customer Name:</strong> {order.customer.name || 'N/A'}</p>
                        <p><strong>Contact:</strong> {order.customer.contact || order.customer.phone || 'N/A'}</p>
                        <p><strong>Email:</strong> {order.customer.email || 'N/A'}</p>
                        <p><strong>Address:</strong> {order.customer.address || 'N/A'}</p>
                      </div>
                    ) : (
                      <p className="no-customer-info">No customer information available for this order.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        {editProduct && (
          <div className="edit-modal">
            <form onSubmit={updateProduct} className="edit-form">
              <h3>Edit Product</h3>
              <div className="form-grid">
                <div>
                  <label>Product Name</label>
                  <input
                    value={editProduct.productName}
                    onChange={e => setEditProduct({ ...editProduct, productName: e.target.value })}
                    placeholder="Product Name"
                    required
                  />
                </div>
                <div>
                  <label>Price</label>
                  <input
                    type="number"
                    value={editProduct.price}
                    onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                    placeholder="Price"
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <label>Category</label>
                  <input
                    value={editProduct.category}
                    onChange={e => setEditProduct({ ...editProduct, category: e.target.value })}
                    placeholder="Category"
                    required
                  />
                </div>
                <div>
                  <label>Rating</label>
                  <input
                    type="number"
                    value={editProduct.rating === null ? '' : editProduct.rating}
                    onChange={e => {
                      const value = e.target.value === '' ? null : Number(e.target.value);
                      if (value === null || (value >= 0 && value <= 5)) {
                        setEditProduct({ ...editProduct, rating: value });
                      }
                    }}
                    placeholder="Rating (0-5)"
                    required
                    step="0.1"
                    min="0"
                    max="5"
                  />
                </div>
                <div>
                  <label>Stock Available</label>
                  <input
                    type="number"
                    value={editProduct.stockAvailable}
                    onChange={e => setEditProduct({ ...editProduct, stockAvailable: e.target.value })}
                    placeholder="Stock"
                    required
                  />
                </div>
                <div>
                  <label>Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditProduct({ ...editProduct, image: e.target.files[0] })}
                  />
                </div>
                <div>
                  <label>Sizes (comma-separated, e.g., 7,8.5,S,M)</label>
                  <input
                    value={editProduct.sizes}
                    onChange={e => setEditProduct({ ...editProduct, sizes: e.target.value })}
                    placeholder="Sizes (e.g., 7,8.5,S,M)"
                    required
                  />
                </div>
              </div>
              <div>
                <label>Description</label>
                <textarea
                  value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                  placeholder="Description"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="submit-button">Save Changes</button>
                <button type="button" onClick={() => setEditProduct(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;