"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaShieldAlt } from "react-icons/fa";

export default function AdminAccountPage() {
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
      setMessage("An error occurred while updating your profile.");
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
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>User not found. Please log in again.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
          Account Settings
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          Manage your admin account information and preferences
        </p>
      </div>

      {message && (
        <div style={{
          padding: "1rem",
          marginBottom: "1rem",
          borderRadius: 8,
          background: message.includes("successfully") ? "#d1fae5" : "#fee2e2",
          color: message.includes("successfully") ? "#065f46" : "#dc2626",
          border: `1px solid ${message.includes("successfully") ? "#a7f3d0" : "#fecaca"}`
        }}>
          {message}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ 
          padding: "1.5rem", 
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              Profile Information
            </h2>
            <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>
              Your personal and business information
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500
              }}
            >
              <FaEdit style={{ fontSize: "0.875rem" }} />
              Edit Profile
            </button>
          ) : (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "#10b981",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: saving ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  opacity: saving ? 0.6 : 1
                }}
              >
                <FaSave style={{ fontSize: "0.875rem" }} />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancel}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "#6b7280",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: 500
                }}
              >
                <FaTimes style={{ fontSize: "0.875rem" }} />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Profile Content */}
        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            {/* Name */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                <FaUser style={{ marginRight: "0.5rem", color: "#6b7280" }} />
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
                    fontSize: "1rem"
                  }}
                  placeholder="Enter your full name"
                />
              ) : (
                <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, color: "#374151" }}>
                  {user.username || user.name || "Not provided"}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                <FaEnvelope style={{ marginRight: "0.5rem", color: "#6b7280" }} />
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
                    fontSize: "1rem"
                  }}
                  placeholder="Enter your email address"
                />
              ) : (
                <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, color: "#374151" }}>
                  {user.email || "Not provided"}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                <FaPhone style={{ marginRight: "0.5rem", color: "#6b7280" }} />
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
                    fontSize: "1rem"
                  }}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, color: "#374151" }}>
                  {user.phone || "Not provided"}
                </div>
              )}
            </div>

            {/* Company */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
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
                    fontSize: "1rem"
                  }}
                  placeholder="Enter your company name"
                />
              ) : (
                <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, color: "#374151" }}>
                  {user.company_name || user.company || "Not provided"}
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, color: "#374151" }}>
                <FaMapMarkerAlt style={{ marginRight: "0.5rem", color: "#6b7280" }} />
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
                    fontSize: "1rem",
                    resize: "vertical"
                  }}
                  placeholder="Enter your address"
                />
              ) : (
                <div style={{ padding: "0.75rem", background: "#f9fafb", borderRadius: 6, color: "#374151", minHeight: "3rem" }}>
                  {user.address || "Not provided"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Information */}
      <div style={{ marginTop: "2rem", background: "#fff", borderRadius: 12, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", overflow: "hidden" }}>
        <div style={{ 
          padding: "1.5rem", 
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937", margin: 0 }}>
              Admin Information
            </h2>
            <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>
              Your administrative role and permissions
            </p>
          </div>
        </div>

        <div style={{ padding: "1.5rem" }}>
          <div style={{ display: "grid", gap: "1.5rem" }}>
            <div style={{ 
              background: "#f0f9ff", 
              padding: "1rem", 
              borderRadius: 8, 
              border: "1px solid #bae6fd" 
            }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
                <FaShieldAlt style={{ marginRight: "0.5rem", color: "#3b82f6" }} />
                Admin Role
              </h3>
              <p style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                You have full administrative access to the Bis-Connect platform. This includes:
              </p>
              <ul style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.5, margin: 0, paddingLeft: "1rem" }}>
                <li>User management and account oversight</li>
                <li>Product approval and moderation</li>
                <li>Order monitoring and dispute resolution</li>
                <li>Financial reporting and analytics</li>
                <li>Platform configuration and settings</li>
                <li>Commission management and tracking</li>
              </ul>
            </div>

            <div style={{ 
              background: "#fef3c7", 
              padding: "1rem", 
              borderRadius: 8, 
              border: "1px solid #f59e0b" 
            }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937", marginBottom: "0.5rem" }}>
                Security Notice
              </h3>
              <p style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "0.5rem" }}>
                As an administrator, you have access to sensitive platform data. Please ensure:
              </p>
              <ul style={{ color: "#374151", fontSize: "0.875rem", lineHeight: 1.5, margin: 0, paddingLeft: "1rem" }}>
                <li>Keep your login credentials secure</li>
                <li>Log out when accessing from shared devices</li>
                <li>Report any suspicious activity immediately</li>
                <li>Follow platform security guidelines</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Account Statistics */}
      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6", marginBottom: "0.5rem" }}>0</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Users</div>
        </div>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#10b981", marginBottom: "0.5rem" }}>0</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Products</div>
        </div>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b", marginBottom: "0.5rem" }}>0</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Total Orders</div>
        </div>
        <div style={{ background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#8b5cf6", marginBottom: "0.5rem" }}>0</div>
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>Platform Revenue</div>
        </div>
      </div>
    </div>
  );
}

