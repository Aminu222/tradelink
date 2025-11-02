"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaBell, FaCheck, FaTimes, FaSearch, FaFilter, FaEnvelope, FaShoppingCart, FaDollarSign, FaExclamationTriangle } from "react-icons/fa";

export default function ProducerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const notificationsData = await apiService.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading notifications:", error);
      // Fallback to empty array if API fails
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, status: 'read' }
          : notification
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notification => ({ ...notification, status: 'read' })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      await apiService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FaShoppingCart style={{ fontSize: "1.25rem", color: "#3b82f6" }} />;
      case 'message':
        return <FaEnvelope style={{ fontSize: "1.25rem", color: "#8b5cf6" }} />;
      case 'payment':
        return <FaDollarSign style={{ fontSize: "1.25rem", color: "#10b981" }} />;
      case 'stock':
        return <FaExclamationTriangle style={{ fontSize: "1.25rem", color: "#f59e0b" }} />;
      default:
        return <FaBell style={{ fontSize: "1.25rem", color: "#6b7280" }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order':
        return { background: '#dbeafe', color: '#1e40af' };
      case 'message':
        return { background: '#e0e7ff', color: '#3730a3' };
      case 'payment':
        return { background: '#d1fae5', color: '#065f46' };
      case 'stock':
        return { background: '#fef3c7', color: '#92400e' };
      default:
        return { background: '#f3f4f6', color: '#374151' };
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Notifications
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Stay updated with your business activities
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
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
            <FaCheck style={{ fontSize: "0.875rem" }} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Stats */}
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
            <FaBell style={{ fontSize: "1.5rem", color: "#3b82f6" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {notifications.length}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Notifications</div>
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
            <FaBell style={{ fontSize: "1.5rem", color: "#ef4444" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {unreadCount}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Unread</div>
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
            <FaShoppingCart style={{ fontSize: "1.5rem", color: "#10b981" }} />
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1f2937" }}>
                {notifications.filter(n => n.type === 'order').length}
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Order Notifications</div>
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
              placeholder="Search notifications..."
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

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "0.75rem",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              fontSize: "0.875rem",
              background: "#fff"
            }}
          >
            <option value="all">All Types</option>
            <option value="order">Orders</option>
            <option value="message">Messages</option>
            <option value="payment">Payments</option>
            <option value="stock">Stock Alerts</option>
          </select>

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
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 8, 
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e5e7eb",
        overflow: "hidden"
      }}>
        {filteredNotifications.length > 0 ? (
          <div>
            {filteredNotifications.map((notification) => (
              <div key={notification.id} style={{ 
                padding: "1.5rem", 
                borderBottom: "1px solid #f3f4f6",
                background: notification.status === 'unread' ? "#fef7ff" : "#fff",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem"
              }}>
                {/* Notification Icon */}
                <div style={{ 
                  width: "50px", 
                  height: "50px", 
                  background: "#f3f4f6", 
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}>
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Notification Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start",
                    marginBottom: "0.5rem"
                  }}>
                    <div>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.75rem",
                        marginBottom: "0.25rem"
                      }}>
                        <h3 style={{ 
                          fontSize: "1rem", 
                          fontWeight: 600, 
                          color: "#1f2937",
                          margin: 0
                        }}>
                          {notification.title}
                        </h3>
                        <div style={{ 
                          padding: "0.25rem 0.75rem", 
                          borderRadius: 20, 
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          display: "inline-block",
                          ...getNotificationColor(notification.type)
                        }}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </div>
                        {notification.status === 'unread' && (
                          <div style={{ 
                            width: "8px", 
                            height: "8px", 
                            background: "#ef4444", 
                            borderRadius: "50%" 
                          }} />
                        )}
                      </div>
                      <p style={{ 
                        fontSize: "0.875rem", 
                        color: "#6b7280", 
                        lineHeight: 1.5,
                        margin: 0
                      }}>
                        {notification.message}
                      </p>
                    </div>
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "0.5rem",
                      flexShrink: 0
                    }}>
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {formatTime(notification.timestamp)}
                      </div>
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            padding: "0.5rem",
                            background: "#3b82f6",
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
                          <FaCheck style={{ fontSize: "0.625rem" }} />
                          Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        style={{
                          padding: "0.5rem",
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "none",
                          borderRadius: 6,
                          fontSize: "0.75rem",
                          cursor: "pointer"
                        }}
                      >
                        <FaTimes style={{ fontSize: "0.625rem" }} />
                      </button>
                    </div>
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
            <FaBell style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              No notifications found
            </div>
            <div style={{ fontSize: "1rem" }}>
              {searchTerm || typeFilter !== "all" || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Notifications will appear here when you have updates"
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 