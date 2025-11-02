"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import { apiService } from "@/services/api";
import { guestCartService } from "@/services/guestCart";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInquiry, setShowInquiry] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [showAddToCartSuccess, setShowAddToCartSuccess] = useState(false);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [showInquirySuccess, setShowInquirySuccess] = useState(false);

  useEffect(() => {
    loadProduct();
    updateCartCount();
  }, [params.id]);

  const updateCartCount = () => {
    setCartCount(guestCartService.getCartCount());
  };

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productData = await apiService.getProduct(Number(params.id));
      setProduct(productData);
    } catch (error) {
      console.error("Error loading product:", error);
      setError("Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
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
    setTimeout(() => setShowAddToCartSuccess(false), 3000);
  };

  const handleSendInquiry = async () => {
    if (!inquiryMessage.trim()) return;
    
    setIsSubmittingInquiry(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowInquirySuccess(true);
      setShowInquiry(false);
      setInquiryMessage("");
    } catch (error) {
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  const handleCloseInquiry = () => {
    setShowInquiry(false);
    setInquiryMessage("");
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
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: 48, color: '#ef4444' }}>❌</div>
        <h3 style={{ color: '#ef4444', fontSize: '18px', margin: 0 }}>Product Not Found</h3>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>{error || 'The product you are looking for does not exist.'}</p>
        <button
          onClick={() => router.push('/')}
          style={{
            background: '#0070f3',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Back to Home
        </button>
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
            Product Details
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Explore product information and connect with trusted Nigerian sellers
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
              <div style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 800, 
                  color: 'white', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  Bis-Connect
                </h1>
              </div>

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
                {/* Profile */}
                <Link href="/auth/login" style={{ 
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
                  <FaUser style={{ fontSize: '20px' }} />
                </Link>

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
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px 40px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
        {/* Images Gallery */}
        <div style={{ flex: '1 1 340px', minWidth: 320, maxWidth: 420 }}>
          <div style={{ background: '#f3f4f6', borderRadius: 14, overflow: 'hidden', marginBottom: 18 }}>
              <img 
                src={(() => {
                  const imageUrl = product.images?.[0] || product.main_image_url;
                  if (imageUrl?.startsWith('http://') || imageUrl?.startsWith('https://')) {
                    return imageUrl;
                  }
                  if (imageUrl?.startsWith('/')) {
                    return `http://localhost:5000${imageUrl}`;
                  }
                  return imageUrl ? `http://localhost:5000/uploads/${imageUrl}` : '/placeholder-product.jpg';
                })()} 
                alt={product.name} 
                style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 14 }}
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
          </div>
            {product.images && product.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.images.slice(1, 5).map((img: string, idx: number) => (
                  <img 
                    key={idx} 
                    src={img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`} 
                    alt='' 
                    style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 8, background: '#e5e7eb' }}
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
              ))}
            </div>
          )}
        </div>
        {/* Product Info */}
        <div style={{ flex: '2 1 400px', minWidth: 320 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8, color: '#1f2937' }}>{product.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0070f3' }}>
                {product.currency || 'NGN'} {product.price?.toLocaleString()}
              </span>
            <span style={{ fontSize: '1.1rem', color: '#374151', fontWeight: 500 }}>/ {product.price_unit || 'unit'}</span>
              <span style={{ fontSize: '1rem', color: '#6b7280' }}>Qty: {product.quantity || 'Available'}</span>
              {product.producer_country && (
                <span style={{ background: '#2563eb', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600 }}>{product.producer_country}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
              {product.category && (
                <span style={{ background: '#10b981', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600 }}>{product.category}</span>
              )}
              {product.certifications && product.certifications.map((cert: string) => (
              <span key={cert} style={{ background: '#10b981', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 600 }}>{cert}</span>
            ))}
              {product.tags && product.tags.map((tag: string) => (
              <span key={tag} style={{ background: '#f3f4f6', color: '#374151', padding: '0.25rem 0.75rem', borderRadius: 12, fontSize: '0.95rem', fontWeight: 500 }}>{tag}</span>
            ))}
          </div>
          <p style={{ color: '#374151', fontSize: '1.1rem', marginBottom: 18 }}>{product.description}</p>
          {/* Specifications & Compliance */}
          <div style={{ marginBottom: 18 }}>
              {product.specifications && typeof product.specifications === 'object' && (
              <div style={{ marginBottom: 10 }}>
                <strong>Specifications:</strong>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                      <li key={key} style={{ color: '#4b5563', fontSize: '1rem' }}>{key}: {String(value)}</li>
                  ))}
                </ul>
              </div>
            )}
            {product.export_compliance && (
              <div>
                <strong>Compliance:</strong> <span style={{ color: '#4b5563', fontSize: '1rem' }}>{product.export_compliance}</span>
              </div>
            )}
          </div>
          {/* Producer Info */}
            {(product.producer_company || product.producer_username || product.producer_first_name) && (
            <div style={{ marginBottom: 18, background: '#f9fafb', borderRadius: 10, padding: '1rem 1.5rem' }}>
                <strong>Seller:</strong> {product.producer_company || product.producer_username || `${product.producer_first_name || ''} ${product.producer_last_name || ''}`.trim() || 'Unknown Seller'}<br />
                <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>{product.producer_country || 'Nigeria'}</span>
            </div>
          )}
          {/* Inquiry & Cart */}
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <button onClick={() => setShowInquiry(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>Send Inquiry</button>
              <button onClick={handleAddToCart} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 2rem', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(16,185,129,0.08)' }}>Add to Cart</button>
            </div>
          </div>
        </div>
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
          fontWeight: 600,
          animation: 'slideIn 0.3s ease-out'
        }}>
          ✅ Item added to cart successfully!
        </div>
      )}

      {/* Inquiry Modal */}
      {showInquiry && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '2rem', 
            minWidth: 400, 
            maxWidth: 500, 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', margin: '0 0 1.5rem 0', color: '#1f2937' }}>
              Send Inquiry
            </h2>
            <textarea 
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Tell the seller about your requirements..."
              style={{ 
                width: '100%', 
                minHeight: '120px', 
                borderRadius: '8px', 
                border: '1px solid #d1d5db', 
                padding: '0.75rem', 
                fontSize: '0.9rem',
                marginBottom: '1rem'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={handleCloseInquiry} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={handleSendInquiry} disabled={!inquiryMessage.trim() || isSubmittingInquiry} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600 }}>
                {isSubmittingInquiry ? 'Sending...' : 'Send Inquiry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry Success Modal */}
      {showInquirySuccess && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          background: 'rgba(0,0,0,0.5)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{ 
            background: '#fff', 
            borderRadius: '16px', 
            padding: '2rem', 
            minWidth: 400, 
            maxWidth: 500, 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            animation: 'modalSlideIn 0.3s ease-out',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '3rem', color: '#10b981', marginBottom: '1rem' }}>✓</div>
            <h2 style={{ fontWeight: 700, fontSize: '1.5rem', margin: '0 0 1rem 0', color: '#1f2937' }}>
              Inquiry Sent Successfully!
            </h2>
            <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 1.5rem 0' }}>
              Your inquiry has been sent to the seller. They will contact you soon.
            </p>
            <button onClick={() => setShowInquirySuccess(false)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', fontWeight: 600 }}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { transform: scale(0.9) translateY(-20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 
