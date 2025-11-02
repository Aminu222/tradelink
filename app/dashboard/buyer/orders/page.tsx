"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaSearch, FaFilter, FaEye, FaDownload, FaCalendar, FaBox, FaDollarSign, FaUser, FaHeart, FaShoppingCart, FaSignInAlt, FaUserPlus, FaClipboardList, FaEnvelope, FaCaretDown } from "react-icons/fa";
import Link from "next/link";

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    loadOrders();
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

  const loadOrders = async () => {
    try {
      const response = await apiService.getOrders();
      setOrders(response || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { background: '#d1fae5', color: '#065f46' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'processing':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'shipped':
        return { background: '#e0e7ff', color: '#3730a3' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status?.toLowerCase() === statusFilter;
    const matchesDate = dateFilter === "all" || true; // TODO: Implement date filtering
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getTotalSpent = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
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
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading orders...</p>
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
            My Orders
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Track and manage your purchase orders
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
              <Link href="/" style={{
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
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 40px" }}>

      {/* Stats Cards */}
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
            <FaBox style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {orders.length}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Orders</div>
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
            <FaDollarSign style={{ fontSize: "1.5rem", color: "#10b981", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: "1.25rem", 
                fontWeight: 700, 
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                ₦{Number(getTotalSpent()).toLocaleString()}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Spent</div>
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
            <FaCalendar style={{ fontSize: "1.5rem", color: "#f59e0b" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Pending Orders</div>
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
              placeholder="Search orders by product name or order ID..."
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

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "0.875rem",
              background: "#fff"
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "0.875rem",
              background: "#fff"
            }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        overflow: "hidden"
      }}>
        {filteredOrders.length > 0 ? (
          <div>
            {filteredOrders.map((order) => (
              <div key={order.id} style={{ 
                padding: "1.5rem", 
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem"
              }}>
                <div style={{ flex: 1, minWidth: "300px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ 
                      width: "50px", 
                      height: "50px", 
                      background: "#f3f4f6", 
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaBox style={{ color: "#6b7280" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                        {order.product_name || "Product"}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Order #{order.id} • {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                    {order.quantity} units
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    ₦{Number(order.total_amount || order.unit_price || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ 
                    padding: "0.25rem 0.75rem", 
                    borderRadius: 20, 
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    display: "inline-block",
                    ...getStatusColor(order.status)
                  }}>
                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Unknown"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Link href={`/dashboard/buyer/orders/${order.id}`} style={{ 
                    padding: "0.5rem", 
                    background: "#3b82f6", 
                    color: "#fff", 
                    borderRadius: 6,
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}>
                    <FaEye style={{ fontSize: "0.75rem" }} />
                    View
                  </Link>
                  <button style={{ 
                    padding: "0.5rem", 
                    background: "#6b7280", 
                    color: "#fff", 
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}>
                    <FaDownload style={{ fontSize: "0.75rem" }} />
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: "3rem", 
            color: "#6b7280"
          }}>
            <FaBox style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              No orders found
            </div>
            <div style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Start shopping to see your orders here"
              }
            </div>
            {!searchTerm && statusFilter === "all" && (
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
    </div>
  );
} 