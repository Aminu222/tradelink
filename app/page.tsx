"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaSearch, FaFilter, FaHeart, FaShoppingCart, FaStar, FaMapMarkerAlt, 
  FaIndustry, FaTh, FaList, FaSort, FaEye, FaEyeSlash, FaTruck,
  FaShieldAlt, FaClock, FaCheckCircle, FaTimes, FaBars, FaUser, FaTimes as FaClose,
  FaSignInAlt, FaUserPlus, FaClipboardList, FaEnvelope, FaCaretDown
} from "react-icons/fa";
import { apiService } from "@/services/api";
import { guestCartService } from "@/services/guestCart";

export default function HomePage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [cartCount, setCartCount] = useState(0);
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);
  
  // Advanced E-commerce Features
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    loadProducts();
    updateCartCount();
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

  const updateCartCount = () => {
    setCartCount(guestCartService.getCartCount());
  };

  const handleAddToCart = (product: any) => {
    guestCartService.addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency || 'NGN',
      price_unit: product.price_unit || 'unit',
      quantity: 1,
      image: product.images?.[0] || product.main_image_url,
      category: product.category,
      min_order_quantity: product.min_order_quantity
    });
    
    updateCartCount();
    setShowAddToCartSuccess(true);
    setTimeout(() => setShowAddToCartSuccess(false), 2000);
  };

  const loadProducts = async () => {
    try {
      const productsData = await apiService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || (product.category && product.category.toLowerCase() === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const getCategories = () => {
    const categories = new Set(products.map(product => product.category).filter(Boolean));
    return Array.from(categories);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
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
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading amazing products...</p>
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
            Discover Amazing Products
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Connect with trusted Nigerian sellers and find unique products from around the world
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
                   cursor: 'pointer',
                   transition: 'transform 0.2s ease-in-out'
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <FaSignInAlt style={{ fontSize: '16px', color: '#3b82f6' }} />
                        Login
                      </Link>
                      
                      <Link href="/auth/register" style={{
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
                        <FaUserPlus style={{ fontSize: '16px', color: '#10b981' }} />
                        Register
                      </Link>
                      
                      <div style={{
                        height: '1px',
                        background: '#e5e7eb',
                        margin: '4px 0'
                      }} />
                      
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
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link href="/cart" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  position: 'relative',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaShoppingCart style={{ fontSize: '20px' }} />
                  {cartCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: '#ef4444',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      border: '2px solid white'
                    }}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>

        {/* Results Count */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ color: '#6b7280' }}>
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filteredProducts.map((product) => (
            <div key={product.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
              {/* Product Image */}
              <div style={{ height: 120, background: '#f6f3f3', position: 'relative' }}>
                {(product.images && product.images[0]) || product.main_image_url ? (
                  <img
                    src={(() => {
                      const imageUrl = product.images?.[0] || product.main_image_url;
                      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                        return imageUrl;
                      }
                      if (imageUrl.startsWith('/')) {
                        return `http://localhost:5000${imageUrl}`;
                      }
                      return `http://localhost:5000/uploads/${imageUrl}`;
                    })()}
                    alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      // Fallback to main_image_url if images[0] fails
                      if (product.images?.[0] && product.main_image_url && product.images[0] !== product.main_image_url) {
                        e.currentTarget.src = `http://localhost:5000${product.main_image_url}`;
                      } else {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const nextElement = target.nextElementSibling as HTMLElement;
                        if (nextElement) {
                          nextElement.style.display = 'flex';
                        }
                      }
                    }}
                  />
                ) : null}
                <div style={{ 
                  display: (product.images && product.images[0]) || product.main_image_url ? 'none' : 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%', 
                  color: '#9ca3af' 
                }}>
                  <div style={{ fontSize: 48, color: '#9ca3af' }}>📦</div>
                </div>
              </div>

              {/* Product Info */}
              <div style={{ padding: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: '#1f2937' }}>
                  {product.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span style={{ color: '#6b7280', fontSize: 10 }}>📍</span>
                  <span style={{ fontSize: 10, color: '#6b7280' }}>
                    {product.producer_company || product.producer_username || `${product.producer_first_name || ''} ${product.producer_last_name || ''}`.trim() || 'Unknown Producer'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                  <span style={{ 
                    background: '#dbeafe', 
                    color: '#2563eb', 
                    padding: '2px 4px', 
                    borderRadius: 3, 
                    fontSize: 10, 
                    fontWeight: 500 
                  }}>
                    {product.category}
                  </span>
                </div>

                <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 8, lineHeight: 1.3 }}>
                  {product.description?.substring(0, 60)}...
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#1f2937' }}>
                      {product.currency || 'NGN'} {product.price?.toLocaleString()}
                    </span>
                    <span style={{ fontSize: 10, color: '#6b7280', marginLeft: 4 }}>
                      / {product.price_unit || 'unit'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 10, color: '#fbbf24' }}>⭐</span>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>
                      {product.rating || '4.5'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    style={{
                      flex: 1,
                      background: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 4,
                      padding: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontSize: 11
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/products/${product.id}`);
                    }}
                    style={{
                      background: '#f3f4f6',
                      color: '#513738ff',
                      border: '1px solid #d1d5db',
                      borderRadius: 4,
                      padding: '8px 10px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: 11
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: 64, color: '#6b7280' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No products found</h3>
            <p>Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {showAddToCartSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: '#fff',
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '1rem',
          fontWeight: 600
        }}>
          ✅ Item added to cart!
        </div>
      )}
    </div>
  );
}
