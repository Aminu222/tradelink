"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FaArrowLeft, FaCreditCard, FaMapMarkerAlt, FaTruck, FaCheck, FaTimes, FaUniversity, FaShoppingCart, FaSearch, FaUser, FaHeart, FaSignInAlt, FaUserPlus, FaClipboardList, FaEnvelope, FaCaretDown } from "react-icons/fa";
import Link from "next/link";
import PaymentGateway from "@/components/PaymentGateway";
import BankTransferPayment from "@/components/BankTransferPayment";

const API_BASE = "http://localhost:5000";

function Spinner() {
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
      <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading checkout...</p>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const fromCart = searchParams.get('fromCart') === 'true';
  
  const [product, setProduct] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  // Form states
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Nigeria");
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [specialInstructions, setSpecialInstructions] = useState("");

  useEffect(() => {
    if (fromCart) {
      // Handle cart checkout - fetch fresh data from API
      fetchCartData();
    } else if (productId) {
      // Handle single product checkout
      fetchProduct();
    } else {
      setError('No product or cart data provided');
      setLoading(false);
    }
    loadUserProfile();
  }, [productId, fromCart]);

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

  const fetchCartData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch cart data');
      setCartItems(data);
      console.log('Fetched cart data:', data); // Debug log
    } catch (err: any) {
      setError(err.message || 'Failed to load cart data');
    } finally {
      setLoading(false);
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
    } catch (err: any) {
      setError(err.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        // Pre-fill shipping address with user's address if available
        if (data.address) setShippingAddress(data.address);
        if (data.city) setShippingCity(data.city);
        if (data.country) setShippingCountry(data.country);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateShippingCost = () => {
    switch (shippingMethod) {
      case "express":
        return 5000; // ₦5,000 for express
      case "standard":
        return 2500; // ₦2,500 for standard
      default:
        return 2500;
    }
  };

  const calculateSubtotal = () => {
    if (fromCart) {
      return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    } else if (product) {
      return product.price * quantity;
    }
    return 0;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShippingCost();
    return subtotal + shipping;
  };

  const handlePaymentSuccess = (paymentResult: any) => {
    setPaymentData(paymentResult);
    setShowPaymentGateway(false);
    // Proceed with order placement
    placeOrder(paymentResult);
  };

  const handlePaymentError = (error: string) => {
    alert(error);
  };

  const handlePaymentCancel = () => {
    setShowPaymentGateway(false);
  };

  const placeOrder = async (paymentResult?: any) => {
    if (!shippingAddress || !shippingCity) {
      alert('Please fill in all required shipping information');
      return;
    }

    try {
      setOrderLoading(true);
      const token = localStorage.getItem('token');
      const fullAddress = `${shippingAddress}, ${shippingCity}, ${shippingState} ${shippingPostalCode}, ${shippingCountry}`;
      
      if (fromCart) {
        // Place multiple orders for cart items
        const orderPromises = cartItems.map(async (item) => {
          const orderData: any = {
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.price,
            total_amount: (item.price * item.quantity) + calculateShippingCost(),
            shipping_address: fullAddress,
            shipping_method: shippingMethod,
            payment_method: paymentMethod,
            special_instructions: specialInstructions,
            status: 'pending',
            payment_status: paymentResult ? 'completed' : 'pending'
          };

          if (paymentResult) {
            orderData.payment_transaction_id = paymentResult.transactionId;
            orderData.payment_timestamp = paymentResult.timestamp;
          }

          const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to place order');
          }

          return res.json();
        });

        await Promise.all(orderPromises);
      } else if (product) {
        // Place single order
        const orderData: any = {
          product_id: product.id,
          quantity: quantity,
          unit_price: product.price,
          total_amount: calculateTotal(),
          shipping_address: fullAddress,
          shipping_method: shippingMethod,
          payment_method: paymentMethod,
          special_instructions: specialInstructions,
          status: 'pending',
          payment_status: paymentResult ? 'completed' : 'pending'
        };

        if (paymentResult) {
          orderData.payment_transaction_id = paymentResult.transactionId;
          orderData.payment_timestamp = paymentResult.timestamp;
        }

        const res = await fetch(`${API_BASE}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderData)
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to place order');
        }
      }

      // For bank transfer, show bank transfer details instead of redirecting
      if (paymentMethod === 'bank_transfer') {
        setOrderPlaced(true);
        setOrderDetails({
          total: calculateTotal(),
          items: fromCart ? cartItems : [{ name: product?.name, quantity, price: product?.price }]
        });
        setShowBankTransfer(true);
      } else {
        // Success - redirect to orders page
        window.location.href = '/dashboard/buyer/orders';
      }
    } catch (error: any) {
      setError(error.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'credit_card') {
      setShowPaymentGateway(true);
    } else {
      placeOrder();
    }
  };

  const handleBankTransferSuccess = (paymentResult: any) => {
    setPaymentData(paymentResult);
    setShowBankTransfer(false);
    // Order is already placed, just update payment status
    updateOrderPaymentStatus(paymentResult);
  };

  const handleBankTransferError = (error: string) => {
    alert(error);
  };

  const handleBankTransferCancel = () => {
    setShowBankTransfer(false);
  };

  const updateOrderPaymentStatus = async (paymentResult: any) => {
    try {
      const token = localStorage.getItem('token');
      // Update the order with payment information
      const updateData = {
        payment_status: 'completed',
        payment_transaction_id: paymentResult.transactionId,
        payment_timestamp: paymentResult.timestamp
      };

      // For now, we'll just show success message
      // In a real implementation, you'd update the order in the database
      alert('Payment confirmed! Your order has been placed successfully.');
      window.location.href = '/dashboard/buyer/orders';
    } catch (error: any) {
      console.error('Error updating payment status:', error);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  // Show bank transfer component if order is placed and bank transfer is selected
  if (orderPlaced && showBankTransfer) {
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
              Payment Details
            </h1>
            <p style={{ 
              fontSize: '18px', 
              opacity: 0.9, 
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Complete your payment to confirm your order
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
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 20px 40px" }}>
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => {
              setShowBankTransfer(false);
              setOrderPlaced(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            <FaArrowLeft />
            Back to Checkout
          </button>
        </div>

        <div style={{ 
          background: '#f0f9ff', 
          padding: 24, 
          borderRadius: 12, 
          border: '1px solid #bae6fd',
          marginBottom: 24
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
            ✅ Order Placed Successfully!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>
            Your order has been placed. Please complete the bank transfer to confirm your payment.
          </p>
          <div style={{ 
            background: '#fff', 
            padding: 16, 
            borderRadius: 8, 
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#6b7280' }}>Order Total:</span>
              <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>₦{orderDetails?.total?.toLocaleString()}</span>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {orderDetails?.items?.length} item(s) in your order
            </div>
          </div>
        </div>

        <BankTransferPayment
          amount={orderDetails?.total || 0}
          currency="₦"
          producerId={fromCart ? cartItems[0]?.producer_id : product?.producer_id}
          onPaymentSuccess={handleBankTransferSuccess}
          onPaymentError={handleBankTransferError}
          onCancel={handleBankTransferCancel}
        />
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
            Checkout
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Complete your purchase and secure your order
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
                <Link href="/dashboard/buyer/account" style={{ 
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

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 40px" }}>
      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'none',
          border: 'none',
          color: '#6b7280',
          cursor: 'pointer',
          marginBottom: 24,
          fontSize: '1rem'
        }}
      >
        <FaArrowLeft />
        Back to {fromCart ? 'Cart' : 'Product'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 48 }}>
        {/* Checkout Form */}
        <div>

          {/* Shipping Information */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              <FaMapMarkerAlt style={{ marginRight: 8, color: '#3b82f6' }} />
              Shipping Information
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                  Address *
                </label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Street address"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                  City *
                </label>
                <input
                  type="text"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  placeholder="City"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                  State/Province
                </label>
                <input
                  type="text"
                  value={shippingState}
                  onChange={(e) => setShippingState(e.target.value)}
                  placeholder="State or province"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                  Postal Code
                </label>
                <input
                  type="text"
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  placeholder="Postal code"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: 4, fontWeight: 500, color: '#374151' }}>
                  Country
                </label>
                <input
                  type="text"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  placeholder="Country"
                  style={{
                    width: '100%',
                    padding: 12,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              <FaTruck style={{ marginRight: 8, color: '#3b82f6' }} />
              Shipping Method
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shipping"
                  value="standard"
                  checked={shippingMethod === 'standard'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: '#374151' }}>Standard Shipping</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>5-7 business days • ₦2,500</div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="shipping"
                  value="express"
                  checked={shippingMethod === 'express'}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: '#374151' }}>Express Shipping</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>2-3 business days • ₦5,000</div>
                </div>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              <FaCreditCard style={{ marginRight: 8, color: '#3b82f6' }} />
              Payment Method
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="payment"
                  value="bank_transfer"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: '#374151' }}>Bank Transfer</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pay directly to supplier's bank account</div>
                </div>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="payment"
                  value="credit_card"
                  checked={paymentMethod === 'credit_card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{ margin: 0 }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: '#374151' }}>Credit Card</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Secure payment via Stripe</div>
                </div>
              </label>
            </div>
          </div>

          {/* Special Instructions */}
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, marginBottom: 24, border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              Special Instructions
            </h2>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special instructions for your order..."
              style={{
                width: '100%',
                minHeight: 80,
                padding: 12,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16, color: '#374151' }}>
              Order Summary
            </h2>
            
            {/* Items */}
            <div style={{ marginBottom: 16 }}>
              {fromCart ? (
                cartItems.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, color: '#374151' }}>{item.name}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: '#374151' }}>
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, color: '#374151' }}>{product?.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Qty: {quantity}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: '#374151' }}>
                    ₦{(product?.price * quantity).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            
            {/* Totals */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontWeight: 500 }}>₦{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#6b7280' }}>Shipping</span>
                <span style={{ fontWeight: 500 }}>₦{calculateShippingCost().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
                <span>Total</span>
                <span>₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
            
            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={orderLoading || !shippingAddress || !shippingCity}
              style={{
                width: '100%',
                padding: 16,
                background: orderLoading || !shippingAddress || !shippingCity ? '#9ca3af' : '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 600,
                cursor: orderLoading || !shippingAddress || !shippingCity ? 'not-allowed' : 'pointer',
                marginTop: 16
              }}
            >
              {orderLoading ? 'Processing...' : `Place Order - ₦${calculateTotal().toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <PaymentGateway
          amount={calculateTotal()}
          currency="₦"
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CheckoutContent />
    </Suspense>
  );
} 