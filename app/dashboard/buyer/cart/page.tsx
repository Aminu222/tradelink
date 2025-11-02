"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaCreditCard, FaSearch, FaUser, FaHeart, FaSignInAlt, FaUserPlus, FaClipboardList, FaEnvelope, FaCaretDown } from "react-icons/fa";
import Link from "next/link";

export default function BuyerCartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

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

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCart();
      console.log('Cart data:', data);
      setCartItems(data);
    } catch (error) {
      console.error("Error loading cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await apiService.updateCartItem(itemId, newQuantity);
      // Reload cart to get updated data
      await loadCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await apiService.removeFromCart(itemId);
      // Reload cart to get updated data
      await loadCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getShipping = () => {
    return cartItems.length > 0 ? 5.99 : 0;
  };

  const getTax = () => {
    return getSubtotal() * 0.08; // 8% tax
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax();
  };

  const proceedToCheckout = () => {
    // Redirect to checkout page with cart items
    const cartData = encodeURIComponent(JSON.stringify(cartItems));
    window.location.href = `/dashboard/buyer/checkout?fromCart=true&cartData=${cartData}`;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: '4px solid #f3f4f6', 
          borderTop: '4px solid #0070f3', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading cart...</p>
      </div>
    );
  }

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
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Shopping Cart
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Review your items and proceed to checkout
          </p>
          
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
                  background: 'rgba(255,255,255,0.2)',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
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

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          <Link href="/dashboard/buyer/products" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            color: "#6b7280",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}>
            <FaArrowLeft style={{ fontSize: "0.75rem" }} />
            Continue Shopping
          </Link>
        </div>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your cart
        </p>
      </div>

        {cartItems.length === 0 ? (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem 2rem", 
            background: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <FaShoppingCart style={{ fontSize: "4rem", color: "#d1d5db", marginBottom: "1.5rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
              Your cart is empty
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "2rem" }}>
              Start shopping to add items to your cart
            </p>
            <Link href="/dashboard/buyer/products" style={{ 
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "#fff",
              textDecoration: "none",
              borderRadius: 6,
              fontWeight: 500
            }}>
              Browse Products
            </Link>
            </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
            {/* Cart Items */}
            <div>
              {cartItems.map((item) => (
                <div key={item.id} style={{ 
                  display: "flex",
                  gap: "1rem",
                  padding: "1.5rem",
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  marginBottom: "1rem",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                }}>
                  {/* Product Image */}
                  <div style={{ 
                    width: "100px", 
                    height: "100px", 
                    background: "#f3f4f6", 
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <FaShoppingCart style={{ color: "#d1d5db", fontSize: "2rem" }} />
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
                      {item.product_name || item.name}
                    </h3>
                    <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "1rem" }}>
                      {item.product_description || item.description}
                    </p>

                  {/* Quantity Controls */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: "32px",
                        height: "32px",
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer"
                      }}
                    >
                      <FaMinus style={{ fontSize: "0.75rem", color: "#6b7280" }} />
                    </button>
                      <span style={{ fontSize: "1rem", fontWeight: 500, minWidth: "40px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: "32px",
                        height: "32px",
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer"
                      }}
                    >
                      <FaPlus style={{ fontSize: "0.75rem", color: "#6b7280" }} />
                    </button>
                  </div>

                    {/* Price and Remove */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>
                        ₦{(item.price * item.quantity).toFixed(2)}
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                          padding: "0.5rem 1rem",
                      background: "#fee2e2",
                      color: "#ef4444",
                      border: "none",
                          borderRadius: 4,
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem"
                        }}
                      >
                        <FaTrash style={{ fontSize: "0.75rem" }} />
                        Remove
                  </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Order Summary */}
          <div style={{ 
            background: "#fff", 
              padding: "1.5rem",
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            height: "fit-content"
          }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "1.5rem" }}>
                Order Summary
              </h2>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ color: "#6b7280" }}>Subtotal:</span>
                  <span style={{ fontWeight: 500 }}>₦{getSubtotal().toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ color: "#6b7280" }}>Shipping:</span>
                  <span style={{ fontWeight: 500 }}>₦{getShipping().toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span style={{ color: "#6b7280" }}>Tax:</span>
                  <span style={{ fontWeight: 500 }}>₦{getTax().toFixed(2)}</span>
                </div>
                <hr style={{ margin: "1rem 0", border: "none", borderTop: "1px solid #e5e7eb" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.125rem", fontWeight: 700, color: "#1f2937" }}>
                  <span>Total:</span>
                  <span>₦{getTotal().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={proceedToCheckout}
                disabled={checkoutLoading}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                <FaCreditCard style={{ fontSize: "0.875rem" }} />
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </button>
            </div>
        </div>
      )}
      </div>
    </div>
  );
} 