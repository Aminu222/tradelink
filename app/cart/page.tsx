"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaSearch, FaUser, FaShoppingCart } from "react-icons/fa";
import { guestCartService } from "@/services/guestCart";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    setCartItems(guestCartService.getCartItems());
  }, []);

  const updateQuantity = (productId: number, quantity: number) => {
    guestCartService.updateQuantity(productId, quantity);
    setCartItems(guestCartService.getCartItems());
  };

  const removeItem = (productId: number) => {
    guestCartService.removeFromCart(productId);
    setCartItems(guestCartService.getCartItems());
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const total = guestCartService.getCartTotal();

  const handleCheckout = () => {
    setShowLoginPrompt(true);
  };

  if (cartItems.length === 0) {
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
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Your Cart</h1>
          <p style={{ color: '#666', marginBottom: '2rem' }}>Your cart is empty</p>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Continue Shopping
          </button>
        </div>
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
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Your Cart</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Cart Items */}
        <div>
          {cartItems.map((item) => (
            <div key={item.id} style={{
              display: 'flex',
              gap: '1rem',
              padding: '1rem',
              border: '1px solid #eee',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
                             <img
                 src={(() => {
                   const imageUrl = item.image;
                   if (!imageUrl) return '/placeholder.jpg';
                   if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                     return imageUrl;
                   }
                   if (imageUrl.startsWith('/')) {
                     return `http://localhost:5000${imageUrl}`;
                   }
                   return `http://localhost:5000/uploads/${imageUrl}`;
                 })()}
                 alt={item.name}
                 style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                 onError={(e) => {
                   const target = e.target as HTMLImageElement;
                   target.src = '/placeholder.jpg';
                 }}
               />
              <div style={{ flex: 1 }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{item.name}</h3>
                <p style={{ color: '#666', marginBottom: '0.5rem' }}>{formatPrice(item.price)} per {item.price_unit}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                    min="1"
                    style={{ width: '60px', padding: '0.25rem' }}
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div style={{
          background: '#f9fafb',
          padding: '1.5rem',
          borderRadius: '8px',
          height: 'fit-content'
        }}>
          <h2 style={{ marginBottom: '1rem' }}>Order Summary</h2>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            <hr style={{ margin: '1rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <span>Total:</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckout}
            style={{
              width: '100%',
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
      </div>

      {/* Compact Login Prompt Modal */}
      {showLoginPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
                     <div style={{
             background: '#fff',
             borderRadius: '12px',
             maxWidth: '280px',
             width: 'auto',
             boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
             overflow: 'hidden'
           }}>
                         {/* Header */}
             <div style={{
               background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
               padding: '1.25rem',
               textAlign: 'center',
               color: 'white'
             }}>
               <div style={{
                 width: '40px',
                 height: '40px',
                 background: 'rgba(255,255,255,0.2)',
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 margin: '0 auto 0.5rem',
                 backdropFilter: 'blur(10px)'
               }}>
                 <span style={{ fontSize: '18px' }}>🔐</span>
               </div>
               <h2 style={{ 
                 fontSize: '18px', 
                 fontWeight: '700', 
                 margin: '0 0 0.25rem'
               }}>
                 Sign In Required
               </h2>
               <p style={{ 
                 fontSize: '13px', 
                 opacity: '0.9',
                 margin: 0
               }}>
                 Please sign in to complete your purchase
               </p>
             </div>

             {/* Content */}
             <div style={{ padding: '1.25rem' }}>
                             {/* Action Buttons */}
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '0.75rem' }}>
                 <button
                   onClick={() => router.push('/auth/login')}
                   style={{
                     background: '#2563eb',
                     color: '#fff',
                     border: 'none',
                     borderRadius: '8px',
                     padding: '10px 16px',
                     fontSize: '13px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     transition: 'background-color 0.2s',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     gap: '6px'
                   }}
                   onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
                   onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
                 >
                   <span style={{ fontSize: '14px' }}>🔑</span>
                   Sign In
                 </button>
                 
                 <button
                   onClick={() => router.push('/auth/register')}
                   style={{
                     background: '#fff',
                     color: '#2563eb',
                     border: '1px solid #2563eb',
                     borderRadius: '8px',
                     padding: '10px 16px',
                     fontSize: '13px',
                     fontWeight: '600',
                     cursor: 'pointer',
                     transition: 'all 0.2s'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.background = '#2563eb';
                     e.currentTarget.style.color = '#fff';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.background = '#fff';
                     e.currentTarget.style.color = '#2563eb';
                   }}
                 >
                   Create Account
                 </button>
               </div>

              {/* Continue Shopping */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
