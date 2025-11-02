"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaTruck, FaCheckCircle, FaClock, FaExclamationTriangle, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaPaperPlane, FaIndustry } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id;
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchMessages();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/buyer/orders/${orderId}`, {
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

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/buyer/orders/${orderId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch messages');
      setMessages(data);
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/buyer/orders/${orderId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: newMessage })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      // Add message to local state
      const sentMessage = {
        id: Date.now(),
        message: newMessage,
        sender_id: 'buyer',
        created_at: new Date().toISOString(),
        is_sent: true,
        is_delivered: false,
        is_read: false
      };

      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");

    } catch (err: any) {
      console.error('Failed to send message:', err);
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
                      <div style={{
                        flex: 1,
                        height: 2,
                        background: step.completed ? '#2563eb' : '#f3f4f6',
                        margin: '0 8px'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div style={{ 
              background: '#f9fafb', 
              borderRadius: 8, 
              padding: 16,
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <div style={{ 
                  width: 80, 
                  height: 80, 
                  background: '#f3f4f6', 
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af'
                }}>
                  <FaIndustry style={{ fontSize: 24 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: '#1f2937' }}>
                    {order.product_name}
                  </h4>
                  <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>
                    {order.product_category}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: '#6b7280' }}>
                      Quantity: {order.quantity} {order.quantity_unit || 'units'}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1f2937' }}>
                      ₦{order.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
            border: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            height: 500
          }}>
            <div style={{ padding: 20, borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>
                Messages with Producer
              </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.sender_id === 'buyer' ? 'flex-end' : 'flex-start',
                    marginBottom: 16
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: 16,
                    background: message.sender_id === 'buyer' ? '#2563eb' : '#f3f4f6',
                    color: message.sender_id === 'buyer' ? '#fff' : '#1f2937'
                  }}>
                    <div style={{ marginBottom: 4 }}>
                      {message.message}
                    </div>
                    <div style={{ 
                      fontSize: 12,
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 20, borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: 24,
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    background: newMessage.trim() ? '#2563eb' : '#e5e7eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Producer Info */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 24, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
            border: '1px solid #e5e7eb',
            marginBottom: 24
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>
              Producer Information
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%', 
                background: '#dbeafe', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: '#2563eb'
              }}>
                <FaIndustry />
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>
                  {order.producer_company || order.producer_username}
                </div>
                <div style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <FaMapMarkerAlt />
                  {order.producer_location || 'Nigeria'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <FaWhatsapp />
                WhatsApp Producer
              </button>
              <button style={{
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '12px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}>
                <FaPhone />
                Call Producer
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 24, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: '#1f2937' }}>
              Order Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Subtotal:</span>
                <span style={{ fontWeight: 500, color: '#1f2937' }}>
                  ₦{order.total_amount?.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Shipping:</span>
                <span style={{ fontWeight: 500, color: '#1f2937' }}>
                  ₦{order.shipping_cost || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6b7280' }}>Tax:</span>
                <span style={{ fontWeight: 500, color: '#1f2937' }}>
                  ₦{order.tax_amount || 0}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                paddingTop: 12,
                borderTop: '1px solid #f3f4f6',
                fontSize: 16,
                fontWeight: 600,
                color: '#1f2937'
              }}>
                <span>Total:</span>
                <span>₦{order.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 