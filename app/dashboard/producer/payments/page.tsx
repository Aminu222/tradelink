"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaDollarSign, FaSearch, FaFilter, FaDownload, FaEye, FaCheck, FaClock, FaTimes, FaCreditCard, FaUniversity } from "react-icons/fa";

export default function ProducerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const paymentsData = await apiService.getProducerPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
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
      case 'failed':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <FaCreditCard style={{ fontSize: "1rem", color: "#3b82f6" }} />;
      case 'bank_transfer':
        return <FaUniversity style={{ fontSize: "1rem", color: "#10b981" }} />;
      default:
        return <FaDollarSign style={{ fontSize: "1rem", color: "#6b7280" }} />;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'bank_transfer':
        return 'Bank Transfer';
      default:
        return 'Other';
    }
  };

  const filteredPayments = payments.filter(payment => {
    const buyerName = payment.buyer_company || `${payment.buyer_first_name} ${payment.buyer_last_name}` || payment.buyer_username;
    const matchesSearch = payment.id.toString().includes(searchTerm) ||
                         buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || payment.payment_status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const getTotalStats = () => {
    const completed = payments.filter(p => p.payment_status === 'completed');
    const pending = payments.filter(p => p.payment_status === 'pending');
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    const pendingAmount = pending.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
    
    return {
      totalRevenue,
      pendingAmount,
      totalPayments: payments.length,
      completedPayments: completed.length
    };
  };

  const exportPayments = () => {
    // TODO: Implement export functionality
    alert("Export functionality will be implemented here");
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading payments...</div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Payment History
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Track all your payment transactions and revenue
          </p>
        </div>
        <button
          onClick={exportPayments}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#10b981",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <FaDownload style={{ fontSize: "0.875rem" }} />
          Export Payments
        </button>
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
            <FaDollarSign style={{ fontSize: "1.5rem", color: "#10b981" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                ₦{Number(stats.totalRevenue).toFixed(2)}
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
            <FaClock style={{ fontSize: "1.5rem", color: "#f59e0b" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                ₦{Number(stats.pendingAmount).toFixed(2)}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Pending Payments</div>
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
            <FaCheck style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {stats.completedPayments}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Completed</div>
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
            <FaDollarSign style={{ fontSize: "1.5rem", color: "#8b5cf6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {stats.totalPayments}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Transactions</div>
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
              placeholder="Search by order ID, buyer, or transaction ID..."
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
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "0.875rem",
              background: "#fff"
            }}
          >
            <option value="all">All Methods</option>
            <option value="credit_card">Credit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        overflow: "hidden"
      }}>
        <div style={{ 
          padding: "1.5rem", 
          borderBottom: "1px solid #e5e7eb",
          background: "#f9fafb"
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
            Payment Transactions
          </h2>
        </div>

        {filteredPayments.length > 0 ? (
          <div>
            {filteredPayments.map((payment) => (
              <div key={payment.id} style={{ 
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
                      {getMethodIcon(payment.payment_method)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                        {payment.id} • {payment.buyer_company || `${payment.buyer_first_name} ${payment.buyer_last_name}` || payment.buyer_username}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        {payment.product_name} • {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                        Order ID: {payment.id}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 500 }}>
                        Commission: ₦{payment.commission_amount || 0} • Net: ₦{payment.producer_amount || payment.total_amount}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                    ₦{payment.total_amount}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    Net: ₦{payment.total_amount}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    Fee: ₦0.00
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
                    ...getStatusColor(payment.payment_status)
                  }}>
                    {payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1)}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {getMethodLabel(payment.payment_method)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    style={{
                      padding: "0.5rem",
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    <FaEye style={{ fontSize: "0.75rem" }} />
                    Details
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
            <FaDollarSign style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              No payments found
            </div>
            <div style={{ fontSize: "1rem" }}>
              {searchTerm || statusFilter !== "all" || methodFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Payment transactions will appear here"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 