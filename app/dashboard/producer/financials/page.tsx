"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaDollarSign, FaChartLine, FaCalendar, FaDownload, FaFilter, FaSearch } from "react-icons/fa";

export default function ProducerFinancialsPage() {
  const [financialData, setFinancialData] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadFinancialData();
  }, [dateFilter]);

  const loadFinancialData = async () => {
    try {
      const financialData = await apiService.getProducerFinancials();
      
      setFinancialData(financialData.summary);
      setTransactions(financialData.transactions);
    } catch (error) {
      console.error("Error loading financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const buyerName = transaction.buyer_company || `${transaction.buyer_first_name} ${transaction.buyer_last_name}` || transaction.buyer_username;
    const matchesSearch = transaction.id.toString().includes(searchTerm) ||
                         buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return { background: '#d1fae5', color: '#065f46' };
      case 'pending':
        return { background: '#fef3c7', color: '#92400e' };
      case 'processing':
        return { background: '#dbeafe', color: '#1e40af' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const exportData = () => {
    // TODO: Implement export functionality
    alert("Export functionality will be implemented here");
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading financial data...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Financial Analytics
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Track your earnings, revenue, and financial performance
          </p>
        </div>
        <button
          onClick={exportData}
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
          Export Data
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
        gap: "1.5rem", 
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
                ₦{Number(financialData.totalRevenue || 0).toLocaleString()}
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
            <FaChartLine style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {financialData.totalOrders}
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
            <FaDollarSign style={{ fontSize: "1.5rem", color: "#f59e0b" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                ₦{Number(financialData.averageOrderValue || 0).toFixed(2)}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Avg Order Value</div>
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
            <FaChartLine style={{ fontSize: "1.5rem", color: "#8b5cf6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                ₦{Number(financialData.completedRevenue || 0).toLocaleString()}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Completed Revenue</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Revenue Chart */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          padding: "1.5rem"
        }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
              Revenue Trend
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Monthly revenue performance
            </p>
          </div>

          {/* Simple Bar Chart */}
          <div style={{ height: "200px", display: "flex", alignItems: "end", gap: "1rem", padding: "1rem 0" }}>
            {financialData.revenueByMonth?.map((item: any, index: number) => (
              <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ 
                  width: "100%", 
                  background: "#3b82f6", 
                  borderRadius: "4px 4px 0 0",
                  height: `${(item.revenue / 2200) * 150}px`,
                  marginBottom: "0.5rem"
                }} />
                <div style={{ fontSize: "0.75rem", color: "#6b7280", textAlign: "center" }}>
                  {item.month}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1f2937" }}>
                  ₦{item.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          padding: "1.5rem"
        }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
              Performance Summary
            </h2>
            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Key financial metrics
            </p>
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1rem",
              background: "#f9fafb",
              borderRadius: 6
            }}>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Completed Orders</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937" }}>
                  {transactions.filter(t => t.status === 'completed').length}
                </div>
              </div>
              <div style={{ 
                padding: "0.25rem 0.75rem", 
                background: "#d1fae5", 
                color: "#065f46", 
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 500
              }}>
                {((transactions.filter(t => t.status === 'completed').length / transactions.length) * 100).toFixed(0)}%
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1rem",
              background: "#f9fafb",
              borderRadius: 6
            }}>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Pending Revenue</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937" }}>
                  ₦{transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + Number(t.total_amount || 0), 0).toFixed(2)}
                </div>
              </div>
              <div style={{ 
                padding: "0.25rem 0.75rem", 
                background: "#fef3c7", 
                color: "#92400e", 
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 500
              }}>
                {transactions.filter(t => t.status === 'pending').length} orders
              </div>
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              padding: "1rem",
              background: "#f9fafb",
              borderRadius: 6
            }}>
              <div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>Top Product</div>
                <div style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937" }}>
                  Coffee Beans
                </div>
              </div>
              <div style={{ 
                padding: "0.25rem 0.75rem", 
                background: "#dbeafe", 
                color: "#1e40af", 
                borderRadius: 20,
                fontSize: "0.75rem",
                fontWeight: 500
              }}>
                ₦1,200
              </div>
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
              placeholder="Search transactions..."
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
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
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
            Transaction History
          </h2>
        </div>

        {filteredTransactions.length > 0 ? (
          <div>
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} style={{ 
                padding: "1rem 1.5rem", 
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem"
              }}>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                    Order #{transaction.id}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {transaction.buyer_company || `${transaction.buyer_first_name} ${transaction.buyer_last_name}` || transaction.buyer_username} • {transaction.product_name}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "100px" }}>
                  <div style={{ fontWeight: 600, color: "#10b981", fontSize: "1.125rem" }}>
                    ₦{transaction.total_amount}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ textAlign: "center", minWidth: "120px" }}>
                  <div style={{ 
                    padding: "0.25rem 0.75rem", 
                    borderRadius: 20, 
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    display: "inline-block",
                    ...getStatusColor(transaction.status)
                  }}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
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
            <FaDollarSign style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              No transactions found
            </div>
            <div style={{ fontSize: "1rem" }}>
              {searchTerm ? "Try adjusting your search" : "Transaction history will appear here"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 