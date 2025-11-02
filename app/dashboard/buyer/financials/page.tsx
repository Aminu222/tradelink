"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaDollarSign, FaChartLine, FaCalendar, FaDownload, FaFilter, FaSearch } from "react-icons/fa";

export default function BuyerFinancialsPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    try {
      const response = await apiService.getOrders();
      setOrders(response || []);
    } catch (error) {
      console.error("Error loading financial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalSpent = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
  };

  const getMonthlySpending = () => {
    const monthlyData: { [key: number]: number } = {};
    const currentYear = new Date().getFullYear();
    
    orders
      .filter(order => order.status === 'completed' && new Date(order.created_at).getFullYear() === currentYear)
      .forEach(order => {
        const month = new Date(order.created_at).getMonth();
        monthlyData[month] = (monthlyData[month] || 0) + (Number(order.total_amount) || 0);
      });
    
    return monthlyData;
  };

  const getTopSuppliers = () => {
    const supplierSpending: { [key: string]: number } = {};
    orders
      .filter(order => order.status === 'completed')
      .forEach(order => {
        const supplierName = order.producer_company || `${order.first_name || ''} ${order.last_name || ''}`.trim() || 'Unknown Supplier';
        const amount = Number(order.total_amount) || 0;
        supplierSpending[supplierName] = (supplierSpending[supplierName] || 0) + amount;
      });
    
    return Object.entries(supplierSpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getTopCategories = () => {
    const categorySpending: { [key: string]: number } = {};
    orders
      .filter(order => order.status === 'completed')
      .forEach(order => {
        const category = order.product_category || 'Uncategorized';
        const amount = Number(order.total_amount) || 0;
        categorySpending[category] = (categorySpending[category] || 0) + amount;
      });
    
    return Object.entries(categorySpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const filteredTransactions = orders.filter(order => {
    const matchesSearch = order.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.producer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${order.first_name || ''} ${order.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter === "all" || true; // TODO: Implement date filtering
    
    return matchesSearch && matchesDate;
  });

  const monthlySpending = getMonthlySpending();
  const topSuppliers = getTopSuppliers();
  const topCategories = getTopCategories();

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
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
          Financial Overview
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Track your spending, analyze transactions, and monitor your purchasing patterns
        </p>
      </div>

      {/* Key Metrics */}
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
                ₦{getTotalSpent().toLocaleString()}
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
            <FaChartLine style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {orders.filter(o => o.status === 'completed').length}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Completed Orders</div>
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
                ₦{(getTotalSpent() / Math.max(orders.filter(o => o.status === 'completed').length, 1)).toFixed(2)}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Average Order Value</div>
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
                {new Set(orders.filter(o => o.status === 'completed').map(o => o.producer?.name)).size}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Unique Suppliers</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        {/* Top Suppliers */}
        <div style={{ 
          background: "#fff", 
          padding: "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
            Top Suppliers by Spending
          </h3>
          {topSuppliers.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {topSuppliers.map((supplier, index) => (
                <div key={supplier.name} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "0.75rem",
                  background: "#f9fafb",
                  borderRadius: 6
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      width: "24px", 
                      height: "24px", 
                      background: "#3b82f6", 
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ 
                      fontWeight: 500, 
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>{supplier.name}</span>
                  </div>
                  <span style={{ 
                    fontWeight: 600, 
                    color: "#10b981",
                    flexShrink: 0,
                    marginLeft: "0.5rem"
                  }}>
                    ₦{supplier.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
              No spending data available
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div style={{ 
          background: "#fff", 
          padding: "1.5rem", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
            Top Categories by Spending
          </h3>
          {topCategories.length > 0 ? (
            <div style={{ display: "grid", gap: "0.75rem" }}>
              {topCategories.map((category, index) => (
                <div key={category.name} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  alignItems: "center",
                  padding: "0.75rem",
                  background: "#f9fafb",
                  borderRadius: 6
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      width: "24px", 
                      height: "24px", 
                      background: "#f59e0b", 
                      color: "#fff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ 
                      fontWeight: 500, 
                      color: "#374151",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>{category.name}</span>
                  </div>
                  <span style={{ 
                    fontWeight: 600, 
                    color: "#10b981",
                    flexShrink: 0,
                    marginLeft: "0.5rem"
                  }}>
                    ₦{category.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#6b7280", padding: "2rem" }}>
              No category data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Spending Chart */}
      <div style={{ 
        background: "#fff", 
        padding: "1.5rem", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        marginBottom: "2rem",
        border: "1px solid #e5e7eb"
      }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
          Monthly Spending (Current Year)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "0.5rem", height: "200px", alignItems: "end" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const monthName = new Date(2024, i).toLocaleDateString('en-US', { month: 'short' });
            const amount = monthlySpending[i] || 0;
            const maxAmount = Math.max(...Object.values(monthlySpending), 1);
            const height = (amount / maxAmount) * 100;
            
            return (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ 
                  background: amount > 0 ? "#3b82f6" : "#f3f4f6",
                  height: `${height}%`,
                  borderRadius: "4px 4px 0 0",
                  marginBottom: "0.5rem",
                  minHeight: "4px"
                }} />
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {monthName}
                </div>
                {amount > 0 && (
                  <div style={{ fontSize: "0.75rem", color: "#374151", fontWeight: 500 }}>
                    ₦{amount.toLocaleString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction History */}
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
            Transaction History
          </h3>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {/* Search */}
            <div style={{ position: "relative" }}>
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
                  padding: "0.5rem 0.5rem 0.5rem 2rem",
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  width: "200px"
                }}
              />
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: "0.5rem",
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

            {/* Export Button */}
            <button style={{
              padding: "0.5rem 1rem",
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <FaDownload style={{ fontSize: "0.75rem" }} />
              Export
            </button>
          </div>
        </div>

        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <div key={transaction.id} style={{ 
                padding: "1rem 1.5rem", 
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                    {transaction.product_name || "Product"}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {transaction.producer_company || `${transaction.first_name || ''} ${transaction.last_name || ''}`.trim() || "Supplier"} • {new Date(transaction.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 600, color: "#10b981", fontSize: "1.125rem" }}>
                    ₦{Number(transaction.total_amount || transaction.unit_price || 0).toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || "Unknown"}
                  </div>
                </div>
              </div>
            ))
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
                {searchTerm || dateFilter !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "Start making purchases to see your transaction history"
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 