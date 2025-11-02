"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaBell, FaCheckCircle, FaTimesCircle, FaBox, FaEnvelope, FaShoppingCart } from "react-icons/fa";

export default function BuyerNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Fetch real notifications from API
      const notificationsData = await apiService.getNotifications();
      setNotifications(notificationsData);
    } catch (error) {
      console.error("Error loading notifications:", error);
      // If API fails, show empty notifications
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      // Mark notification as read using API
      await apiService.markNotificationAsRead(id);
      // Update local state
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'read' } : n));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      alert("Failed to mark notification as read. Please try again.");
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read using API
      await apiService.markAllNotificationsAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      alert("Failed to mark all notifications as read. Please try again.");
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      // Delete notification using API
      await apiService.deleteNotification(id);
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification. Please try again.");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <FaBox style={{ color: "#3b82f6" }} />;
      case "message":
        return <FaEnvelope style={{ color: "#10b981" }} />;
      case "cart":
        return <FaShoppingCart style={{ color: "#f59e0b" }} />;
      default:
        return <FaBell style={{ color: "#6b7280" }} />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Notifications
            {notifications.filter(n => n.status !== 'read').length > 0 && (
              <span style={{ 
                background: "#ef4444", 
                color: "#fff", 
                fontSize: "0.875rem", 
                padding: "0.25rem 0.5rem", 
                borderRadius: "12px", 
                marginLeft: "0.5rem",
                fontWeight: "500"
              }}>
                {notifications.filter(n => n.status !== 'read').length}
              </span>
            )}
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Stay up to date with your orders, messages, and account activity
          </p>
        </div>
        <button
          onClick={markAllAsRead}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontWeight: 500,
            cursor: "pointer"
          }}
        >
          Mark All as Read
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id} style={{ 
              padding: "1.5rem", 
              borderBottom: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: notification.status === 'read' ? "#fff" : "#f0f9ff"
            }}>
              <div style={{ fontSize: "1.5rem" }}>
                {getIcon(notification.type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: "#1f2937", marginBottom: "0.25rem" }}>
                  {notification.title}
                </div>
                <div style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                  {notification.message}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  {new Date(notification.created_at).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {notification.status !== 'read' && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      cursor: "pointer"
                    }}
                  >
                    Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
            <FaBell style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
              No notifications
            </div>
            <div style={{ fontSize: "1rem" }}>
              You're all caught up!
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 