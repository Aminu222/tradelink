"use client";
import { useState, useEffect } from "react";

interface Notification {
  id: string;
  type: "message" | "order" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    type: string;
    data: any;
  };
}

interface NotificationSystemProps {
  userId: string;
  userType: "buyer" | "producer";
}

export default function NotificationSystem({ userId, userType }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Load existing notifications from localStorage
    const stored = JSON.parse(localStorage.getItem(`notifications_${userId}`) || "[]");
    setNotifications(stored.map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp)
    })));

    // Request notification permission
    if ("Notification" in window) {
      setPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(setPermission);
      }
    }

    // Set up real-time notification checking (in a real app, this would be WebSocket)
    const interval = setInterval(checkForNewNotifications, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  const checkForNewNotifications = () => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Simulate checking for new notifications
    // In a real app, this would check the server for new messages, orders, etc.
    const lastCheck = localStorage.getItem(`lastNotificationCheck_${userId}`);
    const now = new Date().toISOString();

    // Check for new messages
    if (userType === "buyer") {
      const inquiries = JSON.parse(localStorage.getItem("buyerInquiries") || "[]");
      const replies = JSON.parse(localStorage.getItem("producerReplies") || "{}");
      
      inquiries.forEach((inquiry: any, idx: number) => {
        if (replies[idx] && replies[idx].length > 0) {
          const lastReply = replies[idx][replies[idx].length - 1];
          if (lastReply.sender === "Seller" && lastReply.timestamp > (lastCheck || '')) {
            addNotification({
              type: "message",
              title: "New Message",
              message: `You have a new message from ${inquiry.producerName} about ${inquiry.productName}`,
              action: {
                type: "open_message",
                data: { inquiryId: idx }
              }
            });
          }
        }
      });
    } else {
      // Check for new inquiries for sellers
      const inquiries = JSON.parse(localStorage.getItem("buyerInquiries") || "[]");
      inquiries.forEach((inquiry: any, idx: number) => {
        if (inquiry.timestamp > (lastCheck || '')) {
          addNotification({
            type: "message",
            title: "New Inquiry",
            message: `New inquiry about ${inquiry.productName} from ${inquiry.buyerName}`,
            action: {
              type: "open_inquiry",
              data: { inquiryId: idx }
            }
          });
        }
      });
    }

    localStorage.setItem(`lastNotificationCheck_${userId}`, now);
  };

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem(`notifications_${userId}`) || "[]");
      stored.unshift(newNotification);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(stored.slice(0, 50))); // Keep last 50
    }

    // Show browser notification if permission granted
    if (permission === "granted") {
      new Notification(newNotification.title, {
        body: newNotification.message,
        icon: "/favicon.ico",
        tag: newNotification.id
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );

    // Update localStorage
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem(`notifications_${userId}`) || "[]");
      const updated = stored.map((n: any) => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Update localStorage
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem(`notifications_${userId}`) || "[]");
      const updated = stored.map((n: any) => ({ ...n, read: true }));
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));

    // Update localStorage
    if (typeof window !== 'undefined') {
      const stored = JSON.parse(localStorage.getItem(`notifications_${userId}`) || "[]");
      const updated = stored.filter((n: any) => n.id !== id);
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
    }
  };

  const handleNotificationAction = (notification: Notification) => {
    if (notification.action) {
      switch (notification.action.type) {
        case "open_message":
          // Navigate to message or open message modal
          console.log("Opening message:", notification.action.data);
          break;
        case "open_inquiry":
          // Navigate to inquiry or open inquiry modal
          console.log("Opening inquiry:", notification.action.data);
          break;
        default:
          break;
      }
    }
    markAsRead(notification.id);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          background: "none",
          border: "none",
          fontSize: "1.5rem",
          cursor: "pointer",
          position: "relative",
          padding: "8px"
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "#ff4d4f",
            color: "white",
            borderRadius: "50%",
            width: "20px",
            height: "20px",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          width: "350px",
          maxHeight: "400px",
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          overflow: "hidden"
        }}>
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 600 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0070f3",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationAction(notification)}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: "pointer",
                    background: notification.read ? "white" : "#f8f9fa",
                    position: "relative"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.95rem", marginBottom: "4px" }}>
                        {notification.title}
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#666", marginBottom: "4px" }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#999" }}>
                        {notification.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#0070f3",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                          }}
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ff4d4f",
                          cursor: "pointer",
                          fontSize: "0.8rem"
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  {!notification.read && (
                    <div style={{
                      position: "absolute",
                      left: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "4px",
                      height: "4px",
                      background: "#0070f3",
                      borderRadius: "50%"
                    }} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 