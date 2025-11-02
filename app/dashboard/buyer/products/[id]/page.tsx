"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiService } from "@/services/api";
import { FaHeart, FaShoppingCart, FaStar, FaMapMarkerAlt, FaIndustry, FaPhone, FaEnvelope, FaWhatsapp, FaArrowLeft, FaShare, FaSearch, FaUser, FaSignInAlt, FaClipboardList, FaCaretDown } from "react-icons/fa";
import Link from "next/link";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id;
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    loadUserData();
  }, [productId]);

  const loadUserData = async () => {
    try {
      // Load wishlist from API
      const wishlistData = await apiService.getWishlist();
      const wishlistIds = wishlistData.map((item: any) => item.product.id.toString());
      setWishlist(wishlistIds);
      
      // Load cart from localStorage for now (cart API is already implemented)
      const storedCart = JSON.parse(localStorage.getItem("buyerCart") || "{}");
      setCart(storedCart);
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fallback to localStorage
      const storedWishlist = JSON.parse(localStorage.getItem("buyerWishlist") || "[]");
      const storedCart = JSON.parse(localStorage.getItem("buyerCart") || "{}");
      setWishlist(storedWishlist);
      setCart(storedCart);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch product');
      setProduct(data);
      // Store product name in localStorage for inquiry message context
      localStorage.setItem(`product_${productId}`, JSON.stringify({ name: data.name }));
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async () => {
    try {
      if (wishlist.includes(productId as string)) {
        // Remove from wishlist - we need to get the wishlist item ID first
        const wishlistData = await apiService.getWishlist();
        const wishlistItem = wishlistData.find((item: any) => item.product.id === parseInt(productId as string));
        if (wishlistItem) {
          await apiService.removeFromWishlist(wishlistItem.id);
          const newWishlist = wishlist.filter(id => id !== productId);
          setWishlist(newWishlist);
          console.log('Removed from wishlist:', productId);
        } else {
          console.error('Wishlist item not found for product:', productId);
          // If we can't find the wishlist item, just remove it from local state
          const newWishlist = wishlist.filter(id => id !== productId);
          setWishlist(newWishlist);
        }
      } else {
        // Add to wishlist
        await apiService.addToWishlist({
          product_id: parseInt(productId as string)
        });
        const newWishlist = [...wishlist, productId as string];
        setWishlist(newWishlist);
        console.log('Added to wishlist:', productId);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // If there's an error, refresh the wishlist data
      try {
        const wishlistData = await apiService.getWishlist();
        const wishlistIds = wishlistData.map((item: any) => item.product.id.toString());
        setWishlist(wishlistIds);
      } catch (refreshError) {
        console.error('Error refreshing wishlist:', refreshError);
      }
    }
  };

  const addToCart = () => {
    const newCart = { ...cart };
    newCart[productId as string] = (newCart[productId as string] || 0) + quantity;
    setCart(newCart);
    localStorage.setItem("buyerCart", JSON.stringify(newCart));
  };

  const placeOrder = () => {
    if (!product || quantity <= 0) return;
    
    // Navigate to checkout page with product and quantity parameters
    window.location.href = `/dashboard/buyer/checkout?productId=${product.id}&quantity=${quantity}`;
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-profile-dropdown]')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;
  if (!product) return <div style={{ padding: 32 }}>Product not found</div>;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Enhanced Search Bar with Cart & Wishlist */}
          <div style={{ 
            maxWidth: '1000px', 
            margin: '0 auto',
            position: 'relative'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Bis-Connect Logo */}
              <Link href="/dashboard/buyer/products" style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                textDecoration: 'none'
              }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 800, 
                  color: 'white', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Bis-Connect
                </h1>
              </Link>

              {/* Search Bar */}
              <div style={{ 
                display: 'flex', 
                background: 'white', 
                borderRadius: '50px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                flex: 1,
                maxWidth: '600px'
              }}>
                <div style={{ 
                  position: 'relative', 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <FaSearch style={{ 
                    position: 'absolute', 
                    left: '20px', 
                    color: '#9ca3af',
                    fontSize: '18px'
                  }} />
                  <input
                    type="text"
                    placeholder="Search for products, sellers, or categories..."
                    style={{
                      width: '100%',
                      padding: '16px 20px 16px 50px',
                      border: 'none',
                      fontSize: '16px',
                      outline: 'none',
                      background: 'transparent',
                      color: '#374151'
                    }}
                  />
                </div>
                <button
                  onClick={() => {}}
                  style={{
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0070f3'}
                >
                  Search
                </button>
              </div>

              {/* Profile, Cart & Wishlist Icons */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }} data-profile-dropdown>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(10px)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    <FaUser style={{ fontSize: '20px' }} />
                    <FaCaretDown style={{ fontSize: '12px', marginLeft: '4px' }} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid #e5e7eb',
                      minWidth: '200px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <Link href="/dashboard/buyer/account" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaUser style={{ fontSize: '16px', color: '#3b82f6' }} />
                        My Account
                      </Link>
                      
                      <Link href="/dashboard/buyer/orders" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaClipboardList style={{ fontSize: '16px', color: '#f59e0b' }} />
                        Orders
                      </Link>
                      
                      <Link href="/dashboard/buyer/messages" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaEnvelope style={{ fontSize: '16px', color: '#8b5cf6' }} />
                        Message Center
                      </Link>
                      
                      <Link href="/dashboard/buyer/wishlist" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaHeart style={{ fontSize: '16px', color: '#ef4444' }} />
                        Wishlist
                      </Link>
                      
                      <div style={{
                        height: '1px',
                        background: '#e5e7eb',
                        margin: '4px 0'
                      }} />
                      
                      <Link href="/auth/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaSignInAlt style={{ fontSize: '16px', color: '#10b981' }} />
                        Switch Account
                      </Link>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link href="/dashboard/buyer/cart" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaShoppingCart style={{ fontSize: '20px' }} />
                </Link>

                {/* Wishlist */}
                <Link href="/dashboard/buyer/wishlist" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaHeart style={{ fontSize: '20px' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            marginBottom: 16,
            fontSize: '14px',
            padding: '8px 0'
          }}
        >
          <FaArrowLeft />
          Back to Products
        </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        {/* Product Images */}
        <div>
          <div style={{ 
            height: 300, 
            background: '#f3f4f6', 
            borderRadius: 8, 
            overflow: 'hidden',
            marginBottom: 12,
            position: 'relative'
          }}>
            {(product.images && product.images[selectedImage]) || (selectedImage === 0 && product.main_image_url) ? (
              <img
                src={`http://localhost:5000${product.images?.[selectedImage] || product.main_image_url}`}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  // Fallback to main_image_url if images[selectedImage] fails
                  if (product.images?.[selectedImage] && product.main_image_url && product.images[selectedImage] !== product.main_image_url) {
                    e.currentTarget.src = `http://localhost:5000${product.main_image_url}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div style={{ 
              display: (product.images && product.images[selectedImage]) || (selectedImage === 0 && product.main_image_url) ? 'none' : 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              color: '#9ca3af' 
            }}>
              <FaIndustry style={{ fontSize: 48 }} />
            </div>
          </div>

          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8 }}>
              {product.images.map((image: string, idx: number) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 6,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: selectedImage === idx ? '2px solid #2563eb' : '1px solid #e5e7eb'
                  }}
                >
                  <img
                    src={`http://localhost:5000${image}`}
                    alt={`${product.name} ${idx + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', flex: 1 }}>
                {product.name}
              </h1>
              <button
                onClick={toggleWishlist}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: wishlist.includes(productId as string) ? '#ec4899' : '#6b7280',
                  fontSize: 20
                }}
              >
                <FaHeart />
              </button>
              <button
                onClick={shareProduct}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  fontSize: 16
                }}
              >
                <FaShare />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FaStar style={{ color: '#fbbf24', fontSize: 14 }} />
                <span style={{ fontWeight: 600, color: '#374151', fontSize: 14 }}>
                  {product.rating || '4.5'}
                </span>
                <span style={{ color: '#6b7280', fontSize: 12 }}>({product.reviews_count || 12} reviews)</span>
              </div>
              <span style={{ 
                background: '#dbeafe', 
                color: '#2563eb', 
                padding: '3px 8px', 
                borderRadius: 12, 
                fontSize: 12, 
                fontWeight: 500 
              }}>
                {product.category}
              </span>
            </div>

            <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 12 }}>
              ₦{product.price?.toLocaleString()}
              <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 400 }}>
                / {product.price_unit || 'unit'}
              </span>
            </div>
          </div>

          {/* Producer Info */}
          <div style={{ 
            background: '#f9fafb', 
            borderRadius: 8, 
            padding: 16, 
            marginBottom: 20,
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1f2937' }}>
              Producer Information
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                background: '#dbeafe', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <FaIndustry style={{ fontSize: 14 }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
                  {product.producer_company || product.producer_username}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaMapMarkerAlt style={{ fontSize: 10 }} />
                  {product.producer_location || 'Nigeria'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  if (product.producer_phone) {
                    const whatsappUrl = `https://wa.me/${product.producer_phone}?text=Hello, I'm interested in your product: ${encodeURIComponent(product.name)}`;
                    window.open(whatsappUrl, '_blank');
                  } else {
                    alert('Producer phone number not available');
                  }
                }}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: product.producer_phone ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                disabled={!product.producer_phone}
              >
                <FaWhatsapp style={{ fontSize: 12 }} />
                WhatsApp
              </button>
              <button
                onClick={() => {
                  // Redirect to messages page with product and producer info
                  window.location.href = `/dashboard/buyer/messages?productId=${product.id}&producerId=${product.producer_id}`;
                }}
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <FaEnvelope style={{ fontSize: 12 }} />
                Message
              </button>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1f2937' }}>
              Description
            </h3>
            <p style={{ color: '#6b7280', lineHeight: 1.5, fontSize: 14 }}>
              {product.description || 'No description available for this product.'}
            </p>
          </div>

          {/* Product Details */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: '#1f2937' }}>
              Product Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Available Quantity:</span>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
                  {product.quantity || 'N/A'} {product.price_unit || 'units'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Minimum Order:</span>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
                  {product.min_order_quantity || '1'} {product.price_unit || 'units'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Origin:</span>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
                  {product.origin || 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Lead Time:</span>
                <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
                  {product.lead_time || 'N/A'}
                </div>
              </div>
              {product.specifications && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Specifications:</span>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginTop: 4, fontSize: 14 }}>
                    {product.specifications}
                  </div>
                </div>
              )}
              {product.packaging && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: 12, color: '#6b7280' }}>Packaging:</span>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginTop: 4, fontSize: 14 }}>
                    {product.packaging}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Section */}
          <div style={{ 
            background: '#f9fafb', 
            borderRadius: 8, 
            padding: 16,
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#1f2937' }}>
              Place Order
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ fontWeight: 500, color: '#374151', fontSize: 14 }}>Quantity:</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 6 }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  min={1}
                  max={product.quantity || 1}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.quantity || 1, parseInt(e.target.value) || 1)))}
                  style={{
                    width: 50,
                    textAlign: 'center',
                    border: 'none',
                    padding: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.quantity || 1, quantity + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ color: '#6b7280', fontSize: 14 }}>{product.price_unit || 'units'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>Total:</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>
                ₦{(product.price * quantity).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={addToCart}
                style={{
                  flex: 1,
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  padding: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 14
                }}
              >
                <FaShoppingCart style={{ fontSize: 14 }} />
                Add to Cart
              </button>
              <button
                onClick={placeOrder}
                style={{
                  flex: 1,
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 14
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
} 