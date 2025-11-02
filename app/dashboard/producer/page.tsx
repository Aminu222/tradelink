"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaBox, FaDollarSign, FaClipboardList, FaComments, FaPlus, FaEye, FaChartLine } from "react-icons/fa";
import Link from "next/link";

export default function ProducerDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardData = await apiService.getProducerDashboard();
      setStats(dashboardData.stats);
      setRecentOrders(dashboardData.recentOrders);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
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
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '0'
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "1rem" }}>
          My Store Dashboard
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem", marginBottom: "2rem" }}>
          Manage your products, track orders, and grow your business
        </p>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaBox style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  {stats.totalProducts}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Active Products</div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaClipboardList style={{ fontSize: "1.5rem", color: "#10b981" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  {stats.totalOrders}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Orders</div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaDollarSign style={{ fontSize: "1.5rem", color: "#f59e0b" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  ₦{Number(stats.totalEarnings || 0).toLocaleString()}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Earnings</div>
              </div>
            </div>
          </div>

          <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <FaComments style={{ fontSize: "1.5rem", color: "#8b5cf6" }} />
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                  {stats.pendingOrders}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Pending Orders</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
                Recent Orders
              </h2>
            </div>
            <div>
              {recentOrders.map((order) => (
                <div key={order.id} style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                      {order.buyer_company || `${order.buyer_first_name} ${order.buyer_last_name}` || order.buyer_username}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {order.product_name} • {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 600, color: "#10b981", fontSize: "1.125rem" }}>
                      ₦{Number(order.total_amount).toLocaleString()}
                    </div>
                    <div style={{ 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: 20, 
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      display: "inline-block",
                      ...getStatusColor(order.status)
                    }}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid #e5e7eb" }}>
              <Link href="/dashboard/producer/orders" style={{ 
                color: "#3b82f6", 
                textDecoration: "none", 
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                View All Orders
                <FaEye style={{ fontSize: "0.75rem" }} />
              </Link>
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb", height: "fit-content" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
                Quick Actions
              </h2>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <Link href="/dashboard/producer/products" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  background: "#f3f4f6",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#374151",
                  fontWeight: 500,
                  transition: "background 0.2s"
                }}>
                  <FaPlus style={{ color: "#3b82f6" }} />
                  Add New Product
                </Link>

                <Link href="/dashboard/producer/orders" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  background: "#f3f4f6",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#374151",
                  fontWeight: 500,
                  transition: "background 0.2s"
                }}>
                  <FaClipboardList style={{ color: "#10b981" }} />
                  View Orders
                </Link>

                <Link href="/dashboard/producer/messages" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  background: "#f3f4f6",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#374151",
                  fontWeight: 500,
                  transition: "background 0.2s"
                }}>
                  <FaComments style={{ color: "#8b5cf6" }} />
                  Check Messages
                </Link>

                <Link href="/dashboard/producer/financials" style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "1rem",
                  background: "#f3f4f6",
                  borderRadius: 8,
                  textDecoration: "none",
                  color: "#374151",
                  fontWeight: 500,
                  transition: "background 0.2s"
                }}>
                  <FaChartLine style={{ color: "#f59e0b" }} />
                  View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
