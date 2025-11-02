"use client";
import { useState, useEffect, useRef } from "react";
import { useMessaging } from "@/contexts/MessagingContext";
import { FaSearch, FaPaperPlane, FaUser, FaClock, FaCheck, FaCheckDouble, FaCircle, FaWifi, FaTimes } from "react-icons/fa";

export default function ProducerMessagesPage() {
  const {
    conversations,
    selectedConversation,
    messages,
    unreadCount,
    isConnected,
    typingUsers,
    loading,
    error,
    selectConversation,
    sendMessage,
    loadConversations,
    setTyping
  } = useMessaging();

  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    // Get current user ID from localStorage (only on client side)
    const getCurrentUserId = (): number => {
      if (typeof window === 'undefined') return 0;
      const token = localStorage.getItem('token');
      if (!token) return 0;
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id;
      } catch {
        return 0;
      }
    };
    
    setCurrentUserId(getCurrentUserId());
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      await sendMessage(selectedConversation.inquiry_id, newMessage);
      setNewMessage("");
      setIsTyping(false);
      setTyping(selectedConversation.inquiry_id, false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (!selectedConversation) return;

    // Handle typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTyping(selectedConversation.inquiry_id, true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setTyping(selectedConversation.inquiry_id, false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conversation => 
    conversation.other_user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading && conversations.length === 0) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading messages...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Messages
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Communicate with your buyers and customers
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {isConnected ? (
              <FaWifi style={{ color: "#10b981", fontSize: "1rem" }} />
            ) : (
              <FaTimes style={{ color: "#ef4444", fontSize: "1rem" }} />
            )}
            <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {unreadCount > 0 && (
            <div style={{ 
              background: "#ef4444", 
              color: "#fff", 
              borderRadius: "50%",
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 600
            }}>
              {unreadCount}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div style={{ 
          background: "#fee2e2", 
          color: "#dc2626", 
          padding: "1rem", 
          borderRadius: 8, 
          marginBottom: "2rem",
          border: "1px solid #fecaca"
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2rem", height: "calc(100vh - 200px)" }}>
        {/* Conversations List */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Search */}
          <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
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
                placeholder="Search conversations..."
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
          </div>

          {/* Conversations */}
          <div style={{ flex: 1, overflow: "auto" }}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.inquiry_id}
                  onClick={() => selectConversation(conversation)}
                  style={{
                    padding: "1rem",
                    borderBottom: "1px solid #f3f4f6",
                    cursor: "pointer",
                    background: selectedConversation?.inquiry_id === conversation.inquiry_id ? "#f3f4f6" : "#fff",
                    transition: "background 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ 
                        width: "40px", 
                        height: "40px", 
                        background: "#3b82f6", 
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 600
                      }}>
                        {conversation.other_user.name.charAt(0)}
                      </div>
                      {/* Online indicator */}
                      <div style={{ 
                        position: "absolute", 
                        bottom: 0, 
                        right: 0,
                        width: "12px",
                        height: "12px",
                        background: "#10b981",
                        borderRadius: "50%",
                        border: "2px solid #fff"
                      }} />
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center",
                        marginBottom: "0.25rem"
                      }}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: "#1f2937",
                          fontSize: "0.875rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}>
                          {conversation.other_user.name}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          {formatTime(conversation.last_message_time)}
                        </div>
                      </div>
                      
                      <div style={{ 
                        fontSize: "0.875rem", 
                        color: "#6b7280",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                      }}>
                        {conversation.unread_count > 0 && (
                          <div style={{ 
                            background: "#ef4444", 
                            color: "#fff", 
                            borderRadius: "50%",
                            width: "16px",
                            height: "16px",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600
                          }}>
                            {conversation.unread_count}
                          </div>
                        )}
                        {conversation.last_message}
                      </div>
                      
                      <div style={{ 
                        fontSize: "0.75rem", 
                        color: "#9ca3af",
                        marginTop: "0.25rem"
                      }}>
                        {conversation.product_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                color: "#6b7280" 
              }}>
                <FaUser style={{ fontSize: "2rem", color: "#d1d5db", marginBottom: "1rem" }} />
                <div style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  No conversations found
                </div>
                <div style={{ fontSize: "0.875rem" }}>
                  {searchTerm ? "Try adjusting your search" : "Messages from buyers will appear here"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          display: "flex",
          flexDirection: "column"
        }}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div style={{ 
                padding: "1rem 1.5rem", 
                borderBottom: "1px solid #e5e7eb",
                background: "#f9fafb",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <div style={{ position: "relative" }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    background: "#3b82f6", 
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 600
                  }}>
                    {selectedConversation.other_user.name.charAt(0)}
                  </div>
                  <div style={{ 
                    position: "absolute", 
                    bottom: 0, 
                    right: 0,
                    width: "12px",
                    height: "12px",
                    background: "#10b981",
                    borderRadius: "50%",
                    border: "2px solid #fff"
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#1f2937" }}>
                    {selectedConversation.other_user.name}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {selectedConversation.product_name}
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  {selectedConversation.unread_count > 0 ? `${selectedConversation.unread_count} unread` : "All caught up"}
                </div>
              </div>

              {/* Messages */}
              <div style={{ 
                flex: 1, 
                overflow: "auto", 
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    style={{
                      display: "flex",
                      justifyContent: message.sender_id === currentUserId ? "flex-end" : "flex-start"
                    }}
                  >
                    <div style={{
                      maxWidth: "70%",
                      padding: "0.75rem 1rem",
                      borderRadius: 16,
                      background: message.sender_id === currentUserId ? "#3b82f6" : "#f3f4f6",
                      color: message.sender_id === currentUserId ? "#fff" : "#1f2937",
                      fontSize: "0.875rem",
                      lineHeight: 1.4
                    }}>
                      <div style={{ marginBottom: "0.25rem" }}>
                        {message.message}
                      </div>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "0.25rem",
                        fontSize: "0.75rem",
                        opacity: 0.8
                      }}>
                        <FaClock style={{ fontSize: "0.625rem" }} />
                        {formatTime(message.created_at)}
                        {message.sender_id === currentUserId && (
                          message.is_read ? <FaCheckDouble style={{ fontSize: "0.625rem" }} /> : <FaCheck style={{ fontSize: "0.625rem" }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {Array.from(typingUsers.values()).map((typingUser) => (
                  typingUser.inquiry_id === selectedConversation.inquiry_id && 
                  typingUser.user_id !== currentUserId && (
                    <div key={typingUser.user_id} style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{
                        padding: "0.75rem 1rem",
                        borderRadius: 16,
                        background: "#f3f4f6",
                        color: "#6b7280",
                        fontSize: "0.875rem"
                      }}>
                        {typingUser.user_name} is typing...
                      </div>
                    </div>
                  )
                ))}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ 
                padding: "1rem", 
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                gap: "0.75rem"
              }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || !isConnected}
                  style={{
                    padding: "0.75rem 1rem",
                    background: newMessage.trim() && isConnected ? "#3b82f6" : "#d1d5db",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: newMessage.trim() && isConnected ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <FaPaperPlane style={{ fontSize: "0.875rem" }} />
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={{ 
              flex: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              color: "#6b7280"
            }}>
              <div style={{ textAlign: "center" }}>
                <FaUser style={{ fontSize: "3rem", color: "#d1d5db", marginBottom: "1rem" }} />
                <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Select a conversation
                </div>
                <div style={{ fontSize: "1rem" }}>
                  Choose a conversation from the list to start messaging
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 