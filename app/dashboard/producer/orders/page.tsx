"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaSearch, FaFilter, FaEye, FaCheck, FaTimes, FaTruck, FaCalendar, FaDollarSign } from "react-icons/fa";
import Link from "next/link";

export default function ProducerOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await apiService.getProducerOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiService.updateProducerOrderStatus(orderId, newStatus);
      // Refresh orders after update
      loadOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const updatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    try {
      await apiService.updateProducerPaymentStatus(orderId, newPaymentStatus);
      // Refresh orders after update
      loadOrders();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
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

  const filteredOrders = orders.filter(order => {
    const buyerName = order.buyer_company || `${order.buyer_first_name} ${order.buyer_last_name}` || order.buyer_username;
    const matchesSearch = buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPaymentStatus = paymentStatusFilter === "all" || (order.payment_status || 'pending') === paymentStatusFilter;
    
    return matchesSearch && matchesStatus && matchesPaymentStatus;
  });

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading orders...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
          Orders Received
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Manage and fulfill orders from your buyers
        </p>
      </div>

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
            <FaCalendar style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
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
                ₦{Number(getTotalRevenue()).toLocaleString()}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Revenue</div>
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
            <FaDollarSign style={{ fontSize: "1.5rem", color: "#059669", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: "1.25rem", 
                fontWeight: 700, 
                color: "#1f2937",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}>
                ₦{orders.filter(o => o.payment_status === 'completed').reduce((sum, order) => sum + Number(order.total_amount || 0), 0).toLocaleString()}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Paid Orders</div>
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
            <FaTruck style={{ fontSize: "1.5rem", color: "#f59e0b" }} />
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
              placeholder="Search orders by buyer, product, or order ID..."
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

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "0.875rem",
              background: "#fff"
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
                      <FaCalendar style={{ color: "#6b7280" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                        Order #{order.id} • {order.buyer_company || `${order.buyer_first_name} ${order.buyer_last_name}` || order.buyer_username}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {order.product_name} • {order.quantity} units • {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      {order.shipping_address && (
                        <div style={{ fontSize: "0.875rem", color: "#6b7280", fontStyle: "italic" }}>
                          Ship to: {order.shipping_address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                    ₦{Number(order.total_amount).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {order.quantity} units
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ 
                    padding: "0.25rem 0.75rem", 
                    borderRadius: 20, 
                    fontSize: "0.75rem",
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
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    display: "inline-block",
                    ...getPaymentStatusColor(order.payment_status || 'pending')
                  }}>
                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : 'Pending'}
                  </div>
                  {order.payment_method && (
                    <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      {order.payment_method === 'credit_card' ? 'Credit Card' : 'Bank Transfer'}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          style={{ 
                            padding: "0.5rem", 
                            background: "#3b82f6", 
                            color: "#fff", 
                            border: "none",
                            borderRadius: 6,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          <FaCheck style={{ fontSize: "0.75rem" }} />
                          Accept
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          style={{ 
                            padding: "0.5rem", 
                            background: "#ef4444", 
                            color: "#fff", 
                            border: "none",
                            borderRadius: 6,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          <FaTimes style={{ fontSize: "0.75rem" }} />
                          Decline
                        </button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        style={{ 
                          padding: "0.5rem", 
                          background: "#10b981", 
                          color: "#fff", 
                          border: "none",
                          borderRadius: 6,
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        <FaTruck style={{ fontSize: "0.75rem" }} />
                        Ship
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        style={{ 
                          padding: "0.5rem", 
                          background: "#10b981", 
                          color: "#fff", 
                          border: "none",
                          borderRadius: 6,
                          fontSize: "0.875rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem"
                        }}
                      >
                        <FaCheck style={{ fontSize: "0.75rem" }} />
                        Complete
                      </button>
                    )}
                    <Link href={`/dashboard/producer/orders/${order.id}`} style={{ 
                      padding: "0.5rem", 
                      background: "#6b7280", 
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
                  </div>
                  
                  {/* Payment Management */}
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {order.payment_status === 'pending' && (
                      <>
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'completed')}
                          style={{ 
                            padding: "0.5rem", 
                            background: "#10b981", 
                            color: "#fff", 
                            border: "none",
                            borderRadius: 6,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          <FaDollarSign style={{ fontSize: "0.75rem" }} />
                          Mark Paid
                        </button>
                        <button
                          onClick={() => updatePaymentStatus(order.id, 'failed')}
                          style={{ 
                            padding: "0.5rem", 
                            background: "#ef4444", 
                            color: "#fff", 
                            border: "none",
                            borderRadius: 6,
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                        >
                          <FaTimes style={{ fontSize: "0.75rem" }} />
                          Mark Failed
                        </button>
                      </>
                    )}
                    {order.payment_status === 'completed' && (
                      <div style={{ 
                        padding: "0.5rem", 
                        background: "#d1fae5", 
                        color: "#065f46", 
                        borderRadius: 6,
                        fontSize: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem"
                      }}>
                        <FaDollarSign style={{ fontSize: "0.75rem" }} />
                        Payment Received
                      </div>
                    )}
                    {order.payment_transaction_id && (
                      <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                        TXN: {order.payment_transaction_id.slice(-8)}
                      </div>
                    )}
                  </div>
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
            <FaCalendar style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              No orders found
            </div>
            <div style={{ fontSize: "1rem", marginBottom: "1.5rem" }}>
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filters" 
                : "Orders from buyers will appear here"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 