import React, { useState, useEffect } from 'react';

const Home = () => {
  const [showOffers, setShowOffers] = useState(false);
  const [dynamicTitle, setDynamicTitle] = useState('FashionSquare');

  useEffect(() => {
    const updateTitle = () => {
      const width = window.innerWidth;
      if (width > 768) {
        setDynamicTitle('FashionSquare');
      } else if (width <= 768 && width > 480) {
        setDynamicTitle('FashionHub');
      } else {
        setDynamicTitle('FashNest');
      }
    };

    updateTitle(); // Set initial title
    window.addEventListener('resize', updateTitle);

    return () => window.removeEventListener('resize', updateTitle);
  }, []);

  // Update browser tab title
  useEffect(() => {
    document.title = dynamicTitle;
  }, [dynamicTitle]);

  const discountAds = [
    {
      title: "Men's Fashion Sale",
      description: "Up to 10% off on premium men's clothing and accessories!",
      image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&w=800&q=80',
      cta: "Shop Men's Collection",
    },
    {
      title: "Women's Fashion Sale",
      description: "Get 10% off on stylish women's apparel and jewelry!",
      image: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=800&q=80',
      cta: "Shop Women's Collection",
    },
    {
      title: "Accessories Sale",
      description: "Up to 10% off on luxury watches, bags, and sunglasses!",
      image: 'https://images.unsplash.com/photo-1506169894395-36397e4aaee4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YWNjZXNvcmllc3xlbnwwfHwwfHx8MA%3D%3D',
      cta: "Shop Accessories",
    },
    {
      title: "Electronics Sale",
      description: "Save 10% on high-end gadgets and tech accessories!",
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlY3Ryb25pY3N8ZW58MHx8MHx8fDA%3D',
      cta: "Shop Electronics",
    },
    {
      title: "Footwear Sale",
      description: "Up to 10% off on stylish and comfortable women's shoes!",
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
      cta: "Shop Footwear",
    },
    {
      title: "Toys Sale",
      description: "Save 10% on premium toys and collectibles!",
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bHV4dXJ5JTIwdG95c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60',
      cta: "Shop Toys",
    },
  ];

  return (
    <div className="home-container">
      <div className="home-divider-top"></div>

      {!showOffers ? (
        <div className="home-welcome">
          <div className="home-title-container">
            <h1 className="home-title">
              <span className="home-crown-left">👑</span>
              FASHION SQUARE
              <span className="home-crown-right">👑</span>
            </h1>
            <div className="home-title-underline"></div>
          </div>
          <p className="home-subtitle">Elegance & Excellence</p>
          <button onClick={() => setShowOffers(true)} className="home-enter-button">
            Enter Collection
          </button>
        </div>
      ) : (
        <div className="home-offers">
          <div className="home-offers-header">
            <div className="home-offers-line"></div>
            <h2 className="home-offers-title">Exclusive Offers</h2>
            <div className="home-offers-line"></div>
          </div>
          <div className="home-offers-grid">
            {discountAds.map((ad, index) => (
              <div key={index} className="home-offer-item">
                <div className="home-offer-image-container">
                  <img src={ad.image} alt={ad.title} className="home-offer-image" />
                  <div className="home-offer-overlay"></div>
                </div>
                <h3 className="home-offer-title">{ad.title}</h3>
                <p className="home-offer-description">{ad.description}</p>
                <button className="home-offer-cta">
                  {ad.cta} <span className="home-offer-arrow">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="home-divider-bottom"></div>
    </div>
  );
};

export default Home;
