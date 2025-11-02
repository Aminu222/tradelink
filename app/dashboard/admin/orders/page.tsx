"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaSearch, FaFilter, FaEye, FaCalendar, FaDollarSign, FaTruck, FaDownload, FaUser, FaBox } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(order => {
      const buyerName = order.buyer_username || order.buyer_email || '';
      const matchesSearch = buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.id.toString().includes(searchTerm);
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesPaymentStatus = paymentStatusFilter === "all" || (order.payment_status || 'pending') === paymentStatusFilter;
      
      return matchesSearch && matchesStatus && matchesPaymentStatus;
    });
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
      setOrders(data);
      setFilteredOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Buyer,Product,Quantity,Total Amount,Status,Payment Status,Created At\n" +
      filteredOrders.map(o => `${o.id},${o.buyer_username} (${o.buyer_email}),${o.product_name},${o.quantity},${o.total_amount},${o.status},${o.payment_status},${o.created_at}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'completed':
        return { background: '#d1fae5', color: '#065f46' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'processing':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'failed':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  return (
    <div style={{ 
      padding: isMobile ? "1rem" : "2rem", 
      maxWidth: 1200, 
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: isMobile ? "1.5rem" : "2rem", 
        display: "flex", 
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? "1rem" : "0",
        justifyContent: isMobile ? "flex-start" : "space-between",
        alignItems: isMobile ? "stretch" : "center"
      }}>
        <div>
          <h1 style={{ 
            fontSize: isMobile ? "1.5rem" : "2rem", 
            fontWeight: 700, 
            color: "#1f2937", 
            marginBottom: "0.5rem"
          }}>
            Order Management
          </h1>
          <p style={{ 
            color: "#6b7280", 
            fontSize: isMobile ? "0.875rem" : "1rem"
          }}>
            Monitor and manage all orders across the platform
          </p>
        </div>
        <button
          onClick={handleOrderExport}
          style={{
            padding: isMobile ? "0.75rem 1rem" : "0.75rem 1.5rem",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: isMobile ? "0.875rem" : "1rem",
            minHeight: "44px"
          }}
        >
          <FaDownload style={{ fontSize: "0.875rem" }} />
          {isMobile ? "Export" : "Export CSV"}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: isMobile ? "0.75rem" : "1rem", 
        marginBottom: isMobile ? "1.5rem" : "2rem" 
      }}>
        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaCalendar style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {orders.length}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Total Orders</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaDollarSign style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#10b981", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: isMobile ? "1rem" : "1.25rem", 
                fontWeight: 700, 
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                ₦{Number(getTotalRevenue()).toLocaleString()}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Total Revenue</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaDollarSign style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#059669", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: isMobile ? "1rem" : "1.25rem", 
                fontWeight: 700, 
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                ₦{orders.filter(o => o.payment_status === 'completed').reduce((sum, order) => sum + Number(order.total_amount || 0), 0).toLocaleString()}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Paid Orders</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: "#fff", 
          padding: isMobile ? "1rem" : "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem" }}>
            <FaTruck style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", color: "#f59e0b" }} />
            <div>
              <div style={{ fontSize: isMobile ? "1.25rem" : "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {orders.filter(o => o.status === 'pending').length}
              </div>
              <div style={{ color: "#6b7280", fontSize: isMobile ? "0.75rem" : "0.875rem" }}>Pending Orders</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ 
        background: "#fff", 
        padding: isMobile ? "1rem" : "1.5rem", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        marginBottom: isMobile ? "1.5rem" : "2rem",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "0.75rem" : "1rem", 
          flexWrap: "wrap", 
          alignItems: isMobile ? "stretch" : "center" 
        }}>
          {/* Search */}
          <div style={{ 
            position: "relative", 
            flex: isMobile ? "none" : 1, 
            minWidth: isMobile ? "auto" : "250px" 
          }}>
            <FaSearch style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)", 
              color: "#9ca3af",
              fontSize: isMobile ? "0.875rem" : "1rem"
            }} />
            <input
              type="text"
              placeholder="Search orders by buyer, product, or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: isMobile ? "0.875rem 0.875rem 0.875rem 2.25rem" : "0.75rem 0.75rem 0.75rem 2.5rem",
                border: "1px solid #d1d5db",
                borderRadius: 6,
                fontSize: isMobile ? "1rem" : "0.875rem",
                minHeight: isMobile ? "44px" : "auto"
              }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: isMobile ? "0.875rem" : "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: isMobile ? "1rem" : "0.875rem",
              background: "#fff",
              minHeight: isMobile ? "44px" : "auto"
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            style={{
              padding: isMobile ? "0.875rem" : "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: isMobile ? "1rem" : "0.875rem",
              background: "#fff",
              minHeight: isMobile ? "44px" : "auto"
            }}
          >
            <option value="all">All Payment Status</option>
            <option value="pending">Payment Pending</option>
            <option value="completed">Payment Completed</option>
            <option value="failed">Payment Failed</option>
            <option value="processing">Payment Processing</option>
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
                padding: isMobile ? "1rem" : "1.5rem", 
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: isMobile ? "flex-start" : "space-between",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? "1rem" : "1rem"
              }}>
                <div style={{ flex: 1, minWidth: isMobile ? "auto" : "300px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.75rem" : "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ 
                      width: isMobile ? "40px" : "50px", 
                      height: isMobile ? "40px" : "50px", 
                      background: "#f3f4f6", 
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <FaCalendar style={{ color: "#6b7280", fontSize: isMobile ? "1rem" : "1.25rem" }} />
                    </div>
                    <div>
                      <div style={{ 
                        fontWeight: 600, 
                        color: "#1f2937", 
                        marginBottom: "0.25rem",
                        fontSize: isMobile ? "0.875rem" : "1rem"
                      }}>
                        Order #{order.id} • {order.buyer_username || order.buyer_email}
                      </div>
                      <div style={{ 
                        fontSize: isMobile ? "0.75rem" : "0.875rem", 
                        color: "#6b7280" 
                      }}>
                        {order.product_name} • {order.quantity} units • {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      {order.producer_company && (
                        <div style={{ 
                          fontSize: isMobile ? "0.75rem" : "0.875rem", 
                          color: "#6b7280", 
                          fontStyle: "italic" 
                        }}>
                          Seller: {order.producer_company}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  textAlign: isMobile ? "left" : "center", 
                  minWidth: isMobile ? "auto" : "120px" 
                }}>
                  <div style={{ 
                    fontWeight: 600, 
                    color: "#1f2937", 
                    marginBottom: "0.25rem",
                    fontSize: isMobile ? "0.875rem" : "1rem"
                  }}>
                    ₦{Number(order.total_amount).toLocaleString()}
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? "0.75rem" : "0.875rem", 
                    color: "#6b7280" 
                  }}>
                    {order.quantity} units
                  </div>
                </div>

                <div style={{ 
                  textAlign: isMobile ? "left" : "center", 
                  minWidth: isMobile ? "auto" : "120px" 
                }}>
                  <div style={{ 
                    padding: "0.25rem 0.75rem", 
                    borderRadius: 20, 
                    fontSize: isMobile ? "0.7rem" : "0.75rem",
                    fontWeight: 500,
                    display: "inline-block",
                    marginBottom: "0.5rem",
                    ...getStatusColor(order.status)
                  }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div style={{ 
                    padding: "0.25rem 0.75rem", 
                    borderRadius: 20, 
                    fontSize: isMobile ? "0.7rem" : "0.75rem",
                    fontWeight: 500,
                    display: "inline-block",
                    ...getPaymentStatusColor(order.payment_status || 'pending')
                  }}>
                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Pending'}
                  </div>
                  {order.payment_method && (
                    <div style={{ 
                      fontSize: isMobile ? "0.7rem" : "0.75rem", 
                      color: "#6b7280", 
                      marginTop: "0.25rem" 
                    }}>
                      {order.payment_method === 'credit_card' ? 'Credit Card' : 'Bank Transfer'}
                    </div>
                  )}
                </div>

                <div style={{ 
                  display: "flex", 
                  gap: "0.5rem", 
                  flexDirection: isMobile ? "row" : "column",
                  flexWrap: isMobile ? "wrap" : "nowrap"
                }}>
                  <button
                    onClick={() => router.push(`/dashboard/admin/orders/${order.id}`)}
                    style={{ 
                      padding: isMobile ? "0.5rem 0.75rem" : "0.5rem", 
                      background: "#6b7280", 
                      color: "#fff", 
                      borderRadius: 6,
                      border: "none",
                      fontSize: isMobile ? "0.75rem" : "0.875rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      minHeight: isMobile ? "36px" : "auto"
                    }}
                  >
                    <FaEye style={{ fontSize: isMobile ? "0.75rem" : "0.75rem" }} />
                    {isMobile && "View"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: "center", 
            padding: isMobile ? "2rem 1rem" : "4rem 2rem"
          }}>
            <FaBox style={{ fontSize: "3rem", color: "#9ca3af", marginBottom: "1rem" }} />
            <h3 style={{ 
              fontSize: isMobile ? "1.125rem" : "1.25rem", 
              fontWeight: 600, 
              color: "#374151", 
              marginBottom: "0.5rem" 
            }}>
              No orders found
            </h3>
            <p style={{ 
              color: "#6b7280", 
              fontSize: isMobile ? "0.875rem" : "1rem" 
            }}>
              {searchTerm || statusFilter !== "all" || paymentStatusFilter !== "all"
                ? "Try adjusting your search or filter criteria" 
                : "No orders have been placed yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 