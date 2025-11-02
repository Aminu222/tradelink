"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaHeart, FaShoppingCart, FaTrash, FaSearch, FaFilter, FaEye, FaUser, FaSignInAlt, FaUserPlus, FaClipboardList, FaEnvelope, FaCaretDown } from "react-icons/fa";
import Link from "next/link";

export default function BuyerWishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    loadWishlist();
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

  const loadWishlist = async () => {
    try {
      setLoading(true);
      // Fetch real wishlist data from API
      const wishlistData = await apiService.getWishlist();
      setWishlistItems(wishlistData);
    } catch (error) {
      console.error("Error loading wishlist:", error);
      // If API fails, show empty wishlist
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number) => {
    try {
      // Add to cart using real API
      await apiService.addToCart({
        product_id: productId,
        quantity: 1
      });
      alert("Product added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add product to cart. Please try again.");
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    try {
      // Remove from wishlist using real API
      await apiService.removeFromWishlist(itemId);
      // Update local state
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      alert("Failed to remove item from wishlist. Please try again.");
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.product.description && item.product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (item.product.producer && item.product.producer.name && item.product.producer.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || (item.product.category && item.product.category.toLowerCase() === categoryFilter.toLowerCase());
    
    return matchesSearch && matchesCategory;
  });

  const getCategories = () => {
    const categories = new Set(wishlistItems.map(item => item.product.category).filter(Boolean));
    return Array.from(categories);
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
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading wishlist...</p>
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
            My Wishlist
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Save products you love and add them to cart when ready
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
                  background: 'rgba(255,255,255,0.2)',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
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
        {/* Stats */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "1rem", 
          marginBottom: "2rem" 
        }}>
          <div style={{ 
            background: "#fff", 
            padding: "1.5rem", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaHeart style={{ fontSize: "1.5rem", color: "#ef4444" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  {wishlistItems.length}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Wishlist Items</div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: "#fff", 
            padding: "1.5rem", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaShoppingCart style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  ₦{wishlistItems.reduce((sum, item) => sum + item.product.price, 0).toFixed(2)}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Value</div>
              </div>
            </div>
          </div>

          <div style={{ 
            background: "#fff", 
            padding: "1.5rem", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaFilter style={{ fontSize: "1.5rem", color: "#10b981" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  {getCategories().length}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Categories</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={{ 
          background: "#fff", 
          padding: "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: "250px" }}>
              <FaSearch style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                color: "#9ca3af" 
              }} />
              <input
                type="text"
                placeholder="Search wishlist items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem"
                }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: "0.875rem",
                background: "#fff"
              }}
            >
              <option value="all">All Categories</option>
              {getCategories().map(category => (
                <option key={category} value={category.toLowerCase()}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Wishlist Items */}
        {filteredItems.length > 0 ? (
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {filteredItems.map((item) => (
              <div key={item.id} style={{ 
                background: "#fff", 
                borderRadius: 8, 
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}>
                {/* Product Image */}
                <div style={{ 
                  height: "200px", 
                  background: "#f3f4f6", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <FaHeart style={{ color: "#d1d5db", fontSize: "3rem" }} />
                </div>

                {/* Product Info */}
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ 
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      background: "#dbeafe",
                      color: "#1e40af",
                      borderRadius: 20,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      marginBottom: "0.5rem"
                    }}>
                      {item.product.category}
                    </div>
                    <h3 style={{ 
                      fontSize: "1.125rem", 
                      fontWeight: 600, 
                      color: "#1f2937", 
                      marginBottom: "0.5rem",
                      lineHeight: 1.4
                    }}>
                      {item.product.name}
                    </h3>
                    <p style={{ 
                      fontSize: "0.875rem", 
                      color: "#6b7280", 
                      marginBottom: "0.5rem",
                      lineHeight: 1.5
                    }}>
                      {item.product.description}
                    </p>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      by {item.product.producer.name}
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    marginBottom: "1rem"
                  }}>
                    <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "#10b981" }}>
                      ₦{item.product.price}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      Added {new Date(item.added_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      onClick={() => addToCart(item.product.id)}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "#3b82f6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem"
                      }}
                    >
                      <FaShoppingCart style={{ fontSize: "0.75rem" }} />
                      Add to Cart
                    </button>
                    <Link href={`/dashboard/buyer/products/${item.product.id}`} style={{
                      padding: "0.75rem",
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none"
                    }}>
                      <FaEye style={{ fontSize: "0.75rem" }} />
                    </Link>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      style={{
                        padding: "0.75rem",
                        background: "#fee2e2",
                        color: "#ef4444",
                        border: "none",
                        borderRadius: 6,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FaTrash style={{ fontSize: "0.75rem" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "4rem 2rem", 
            background: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb"
          }}>
            <FaHeart style={{ fontSize: "4rem", color: "#d1d5db", marginBottom: "1.5rem" }} />
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
              {searchTerm || categoryFilter !== "all" ? "No items found" : "Your wishlist is empty"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "2rem" }}>
              {searchTerm || categoryFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start adding products you love to your wishlist"
              }
            </p>
            {!searchTerm && categoryFilter === "all" && (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
} 