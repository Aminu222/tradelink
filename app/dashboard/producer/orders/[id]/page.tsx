"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function ProducerOrderDetailPage() {
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/producer/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch order');
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { background: '#fef3c7', color: '#d97706' };
      case 'processing':
        return { background: '#dbeafe', color: '#2563eb' };
      case 'shipped':
        return { background: '#d1fae5', color: '#059669' };
      case 'delivered':
        return { background: '#d1fae5', color: '#059669' };
      case 'cancelled':
        return { background: '#fee2e2', color: '#dc2626' };
      default:
        return { background: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock />;
      case 'processing':
        return <FaExclamationTriangle />;
      case 'shipped':
        return <FaTruck />;
      case 'delivered':
        return <FaCheckCircle />;
      case 'cancelled':
        return <FaExclamationTriangle />;
      default:
        return <FaClock />;
    }
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'pending', label: 'Order Placed', icon: <FaClock /> },
      { key: 'processing', label: 'Processing', icon: <FaExclamationTriangle /> },
      { key: 'shipped', label: 'Shipped', icon: <FaTruck /> },
      { key: 'delivered', label: 'Delivered', icon: <FaCheckCircle /> }
    ];

    const currentIndex = steps.findIndex(step => step.key === order?.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;
  if (!order) return <div style={{ padding: 32 }}>Order not found</div>;

  return (
    <div style={{ padding: 32 }}>
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
        Back to Orders
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 32 }}>
        {/* Main Content */}
        <div>
          {/* Order Header */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 24, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
            border: '1px solid #e5e7eb',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>
                  Order #{order.id}
                </h1>
                <p style={{ color: '#6b7280' }}>
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                ...getStatusColor(order.status)
              }}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            {/* Order Progress */}
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>
                Order Progress
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {getStatusSteps().map((step, index) => (
                  <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: step.completed ? '#2563eb' : '#f3f4f6',
                      color: step.completed ? '#fff' : '#9ca3af',
                      fontSize: 14
                    }}>
                      {step.icon}
                    </div>
                    <div style={{ flex: 1, marginLeft: 8 }}>
                      <div style={{ 
                        fontSize: 12, 
                        fontWeight: 500, 
                        color: step.completed ? '#1f2937' : '#9ca3af' 
                      }}>
                        {step.label}
                      </div>
                    </div>
                    {index < getStatusSteps().length - 1 && (
                      <div style={{ flex: 1, height: 2, background: step.completed ? '#2563eb' : '#e5e7eb' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Details */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>
                Order Details
              </h3>
              <div style={{ color: '#374151', fontSize: 15 }}>
                <div><strong>Product:</strong> {order.product_name}</div>
                <div><strong>Quantity:</strong> {order.quantity}</div>
                <div><strong>Total Amount:</strong> ${order.total_amount}</div>
                <div><strong>Status:</strong> {order.status}</div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar or additional info can go here */}
      </div>
    </div>
  );
} 