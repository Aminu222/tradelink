"use client";
import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaChartLine, FaCreditCard, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function FinancialsPage() {
  const [financials, setFinancials] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/financials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch financials');
      setFinancials(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load financials');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, color: '#1f2937' }}>Financial Management</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>Financial Summary</h2>
      </div>
      
      {/* Financial Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
        {/* Total Orders */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#dbeafe', borderRadius: 8, padding: 12 }}>
              <FaChartLine style={{ fontSize: 24, color: '#2563eb' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{financials.total_orders || 0}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Orders</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
            All time orders
          </div>
        </div>

        {/* Total Sales */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#d1fae5', borderRadius: 8, padding: 12 }}>
              <FaMoneyBillWave style={{ fontSize: 24, color: '#059669' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>₦{financials.total_sales?.toLocaleString() || 0}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Sales</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
            Revenue generated
          </div>
        </div>

        {/* Pending Payments */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12 }}>
              <FaExclamationTriangle style={{ fontSize: 24, color: '#d97706' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>₦{financials.pending_payments?.toLocaleString() || 0}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Pending Payments</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#dc2626' }}>
            Awaiting payment
          </div>
        </div>

        {/* Average Order Value */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#fce7f3', borderRadius: 8, padding: 12 }}>
              <FaCreditCard style={{ fontSize: 24, color: '#be185d' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
                ₦{financials.total_orders > 0 ? (financials.total_sales / financials.total_orders).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
              </div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Avg Order Value</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
            Per transaction
          </div>
        </div>
      </div>

      {/* Additional Financial Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Revenue Breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>Revenue Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Completed Orders</span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>₦{financials.completed_sales?.toLocaleString() || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Pending Orders</span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>₦{financials.pending_sales?.toLocaleString() || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Cancelled Orders</span>
              <span style={{ fontWeight: 600, color: '#1f2937' }}>₦{financials.cancelled_sales?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>Payment Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Paid Orders</span>
              <span style={{ fontWeight: 600, color: '#059669' }}>{financials.paid_orders || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Pending Payment</span>
              <span style={{ fontWeight: 600, color: '#d97706' }}>{financials.pending_orders || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280' }}>Failed Payments</span>
              <span style={{ fontWeight: 600, color: '#dc2626' }}>{financials.failed_orders || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends (if available) */}
      {financials.monthly_data && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb', marginTop: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>Monthly Trends</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {financials.monthly_data.map((month: any, idx: number) => (
              <div key={idx} style={{ textAlign: 'center', padding: 16, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{month.month}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1f2937' }}>₦{month.sales?.toLocaleString() || 0}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{month.orders || 0} orders</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 