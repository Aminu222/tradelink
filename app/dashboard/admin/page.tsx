"use client";
import { useState, useEffect } from "react";
import { FaUsers, FaBox, FaShoppingCart, FaMoneyBillWave, FaUserTie, FaIndustry, FaUserShield, FaCalendar, FaEye } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingPayments: 0,
    activeUsers: 0,
    recentOrders: [],
    userStats: {
      total: 0,
      buyers: 0,
      producers: 0,
      admins: 0,
      active: 0
    }
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all data in parallel
      const [usersRes, productsRes, ordersRes, financialsRes] = await Promise.all([
        fetch(`${API_BASE}/admin/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/admin/financials`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [users, products, orders, financials] = await Promise.all([
        usersRes.json(),
        productsRes.json(),
        ordersRes.json(),
        financialsRes.json()
      ]);

      if (!usersRes.ok || !productsRes.ok || !ordersRes.ok || !financialsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const activeUsers = users.filter((user: any) => user.is_active).length;
      const recentOrders = orders.slice(0, 5); // Get last 5 orders

      // Calculate user type statistics
      const userStats = {
        total: users.length,
        buyers: users.filter((user: any) => user.user_type === 'buyer').length,
        producers: users.filter((user: any) => user.user_type === 'producer').length,
        admins: users.filter((user: any) => user.user_type === 'admin').length,
        active: activeUsers
      };

      setSummary({
        totalUsers: users.length,
        totalProducts: products.length,
        totalOrders: orders.length,
        totalSales: financials.total_sales || 0,
        pendingPayments: financials.pending_payments || 0,
        activeUsers,
        recentOrders,
        userStats
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
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
      case 'shipped':
        return { background: '#e0e7ff', color: '#3730a3' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, color: '#1f2937' }}>Admin Dashboard</h1>
      
      {/* User Statistics Cards */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#374151' }}>User Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Total Users */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#dbeafe', borderRadius: 8, padding: 12 }}>
                <FaUsers style={{ fontSize: 24, color: '#2563eb' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{summary.userStats.total}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Users</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#059669' }}>
              {summary.userStats.active} active users
            </div>
          </div>

          {/* Total Buyers */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#d1fae5', borderRadius: 8, padding: 12 }}>
                <FaUserTie style={{ fontSize: 24, color: '#059669' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{summary.userStats.buyers}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Buyers</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#059669' }}>
               buyers
            </div>
          </div>

          {/* Total Producers */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12 }}>
                <FaIndustry style={{ fontSize: 24, color: '#d97706' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{summary.userStats.producers}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Producers</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#059669' }}>
               sellers
            </div>
          </div>

          {/* Total Admins */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#fce7f3', borderRadius: 8, padding: 12 }}>
                <FaUserShield style={{ fontSize: 24, color: '#be185d' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{summary.userStats.admins}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Admins</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#059669' }}>
              System administrators
            </div>
          </div>
        </div>
      </div>

      {/* Business Overview Cards */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#374151' }}>Business Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
          {/* Products Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12 }}>
                <FaBox style={{ fontSize: 24, color: '#d97706' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{summary.totalProducts}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Products</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#059669' }}>
              Available for purchase
            </div>
          </div>

          {/* Orders Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#d1fae5', borderRadius: 8, padding: 12 }}>
                <FaShoppingCart style={{ fontSize: 24, color: '#059669' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{summary.totalOrders}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Orders</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#059669' }}>
              Orders processed
            </div>
          </div>

          {/* Financials Card */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ background: '#fce7f3', borderRadius: 8, padding: 12 }}>
                <FaMoneyBillWave style={{ fontSize: 24, color: '#be185d' }} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>₦{summary.totalSales.toLocaleString()}</div>
                <div style={{ fontSize: 14, color: '#6b7280' }}>Total Sales</div>
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#dc2626' }}>
              ₦{summary.pendingPayments.toLocaleString()} pending
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1f2937' }}>Recent Orders</h2>
          <a href="/dashboard/admin/orders" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>View All</a>
        </div>
        {summary.recentOrders.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {summary.recentOrders.map((order: any) => (
              <div key={order.id} style={{ 
                padding: '1rem', 
                border: '1px solid #e5e7eb', 
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9fafb'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    background: '#dbeafe', 
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FaCalendar style={{ color: '#2563eb', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                      Order #{order.id} • {order.buyer_username}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {order.product_name} • {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                    ₦{Number(order.total_amount).toLocaleString()}
                  </div>
                  <div style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: 20, 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    display: 'inline-block',
                    ...getStatusColor(order.status)
                  }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 32, color: '#6b7280' }}>
            No recent orders
          </div>
        )}
      </div>
    </div>
  );
} 