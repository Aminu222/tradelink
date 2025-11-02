"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaSearch, FaShoppingCart, FaHeart, FaSignInAlt, FaUserPlus, FaClipboardList, FaCaretDown } from "react-icons/fa";
import Link from "next/link";

export default function BuyerAccountPage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    company: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await apiService.getProfile();
        if (response.success && response.user) {
          const userData = response.user;
          setUser(userData);
          setFormData({
            name: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            company: userData.company_name || ""
          });
        } else {
          // Fallback to localStorage if API fails
          const userStr = localStorage.getItem("user");
          if (userStr) {
            try {
              const userData = JSON.parse(userStr);
              setUser(userData);
              setFormData({
                name: userData.name || userData.username || "",
                email: userData.email || "",
                phone: userData.phone || "",
                address: userData.address || "",
                company: userData.company || userData.company_name || ""
              });
            } catch (error) {
              console.error("Error parsing user data:", error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        // Fallback to localStorage if API fails
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setFormData({
              name: userData.name || userData.username || "",
              email: userData.email || "",
              phone: userData.phone || "",
              address: userData.address || "",
              company: userData.company || userData.company_name || ""
            });
          } catch (error) {
            console.error("Error parsing user data:", error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-profile-dropdown]')) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      const response = await apiService.updateProfile(formData);
      if (response.success) {
        // Update local storage with new user data
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        setMessage("Profile updated successfully!");
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.username || user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      company: user?.company_name || user?.company || ""
    });
    setIsEditing(false);
    setMessage("");
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: '4px solid #f3f4f6', 
          borderTop: '4px solid #0070f3', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }} />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Loading profile...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8fafc',
      padding: '0'
    }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '16px 20px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '32px'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            marginBottom: '12px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            My Account
          </h1>
          <p style={{ 
            fontSize: '18px', 
            opacity: 0.9, 
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Manage your profile and account settings
          </p>
          
          {/* Enhanced Search Bar with Cart & Wishlist */}
          <div style={{ 
            maxWidth: '1000px', 
            margin: '0 auto',
            position: 'relative'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {/* Bis-Connect Logo */}
              <Link href="/dashboard/buyer/products" style={{
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                textDecoration: 'none'
              }}>
                <h1 style={{ 
                  fontSize: '28px', 
                  fontWeight: 800, 
                  color: 'white', 
                  margin: 0,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  Bis-Connect
                </h1>
              </Link>

              {/* Search Bar */}
              <div style={{ 
                display: 'flex', 
                background: 'white', 
                borderRadius: '50px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                flex: 1,
                maxWidth: '600px'
              }}>
                <div style={{ 
                  position: 'relative', 
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <FaSearch style={{ 
                    position: 'absolute', 
                    left: '20px', 
                    color: '#9ca3af',
                    fontSize: '18px'
                  }} />
                  <input
                    type="text"
                    placeholder="Search for products, sellers, or categories..."
                    style={{
                      width: '100%',
                      padding: '16px 20px 16px 50px',
                      border: 'none',
                      fontSize: '16px',
                      outline: 'none',
                      background: 'transparent',
                      color: '#374151'
                    }}
                  />
                </div>
                <button
                  onClick={() => {}}
                  style={{
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    padding: '16px 32px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#0056b3'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#0070f3'}
                >
                  Search
                </button>
              </div>

              {/* Profile, Cart & Wishlist Icons */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px'
              }}>
                {/* Profile Dropdown */}
                <div style={{ position: 'relative' }} data-profile-dropdown>
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    style={{ 
                      textDecoration: 'none', 
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      transition: 'all 0.2s',
                      backdropFilter: 'blur(10px)',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  >
                    <FaUser style={{ fontSize: '20px' }} />
                    <FaCaretDown style={{ fontSize: '12px', marginLeft: '4px' }} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showProfileDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                      border: '1px solid #e5e7eb',
                      minWidth: '200px',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}>
                      <Link href="/dashboard/buyer/account" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaUser style={{ fontSize: '16px', color: '#3b82f6' }} />
                        My Account
                      </Link>
                      
                      <Link href="/dashboard/buyer/orders" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaClipboardList style={{ fontSize: '16px', color: '#f59e0b' }} />
                        Orders
                      </Link>
                      
                      <Link href="/dashboard/buyer/messages" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaEnvelope style={{ fontSize: '16px', color: '#8b5cf6' }} />
                        Message Center
                      </Link>
                      
                      <Link href="/dashboard/buyer/wishlist" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaHeart style={{ fontSize: '16px', color: '#ef4444' }} />
                        Wishlist
                      </Link>
                      
                      <div style={{
                        height: '1px',
                        background: '#e5e7eb',
                        margin: '4px 0'
                      }} />
                      
                      <Link href="/auth/login" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        color: '#374151',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowProfileDropdown(false)}
                      >
                        <FaSignInAlt style={{ fontSize: '16px', color: '#10b981' }} />
                        Switch Account
                      </Link>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <Link href="/dashboard/buyer/cart" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaShoppingCart style={{ fontSize: '20px' }} />
                </Link>

                {/* Wishlist */}
                <Link href="/dashboard/buyer/wishlist" style={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  <FaHeart style={{ fontSize: '20px' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px 40px" }}>
        {/* Success/Error Message */}
        {message && (
          <div style={{
            padding: "1rem",
            marginBottom: "2rem",
            borderRadius: 8,
            background: message.includes("successfully") ? "#d1fae5" : "#fee2e2",
            color: message.includes("successfully") ? "#065f46" : "#991b1b",
            border: `1px solid ${message.includes("successfully") ? "#a7f3d0" : "#fecaca"}`
          }}>
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div style={{
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden"
        }}>
          {/* Header */}
          <div style={{
            padding: "1.5rem",
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              Profile Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <FaEdit style={{ fontSize: "0.75rem" }} />
                Edit Profile
              </button>
            ) : (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <FaSave style={{ fontSize: "0.75rem" }} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <FaTimes style={{ fontSize: "0.75rem" }} />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Profile Content */}
          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {/* Personal Information */}
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "1rem" }}>
                  Personal Information
                </h3>
                
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: "0.875rem"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.875rem" }}>
                      {user?.username || user?.name || "Not provided"}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: "0.875rem"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.875rem" }}>
                      {user?.email || "Not provided"}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: "0.875rem"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.875rem" }}>
                      {user?.phone || "Not provided"}
                    </div>
                  )}
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#374151", marginBottom: "1rem" }}>
                  Business Information
                </h3>
                
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: "0.875rem"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.875rem" }}>
                      {user?.company_name || user?.company || "Not provided"}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: 6,
                        fontSize: "0.875rem",
                        resize: "vertical"
                      }}
                    />
                  ) : (
                    <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, fontSize: "0.875rem" }}>
                      {user?.address || "Not provided"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
            Account Overview
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>
                0
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Orders</div>
            </div>
            
            <div style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981", marginBottom: "0.5rem" }}>
                0
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Wishlist Items</div>
            </div>
            
            <div style={{
              background: "#fff",
              padding: "1.5rem",
              borderRadius: 8,
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e5e7eb",
              textAlign: "center"
            }}>
              <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.5rem" }}>
                ₦0
              </div>
              <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Spent</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 