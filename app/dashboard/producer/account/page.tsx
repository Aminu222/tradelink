"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaShieldAlt, FaCog, FaBell, FaUniversity, FaPlus, FaTrash, FaStar } from "react-icons/fa";

export default function ProducerAccountPage() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [changingPassword, setChangingPassword] = useState(false);

  // Bank details state
  const [bankDetails, setBankDetails] = useState<any[]>([]);
  const [loadingBankDetails, setLoadingBankDetails] = useState(true);
  const [showAddBankModal, setShowAddBankModal] = useState(false);
  const [editingBankId, setEditingBankId] = useState<number | null>(null);
  const [bankFormData, setBankFormData] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    account_type: "savings"
  });
  const [bankFormErrors, setBankFormErrors] = useState<{ [key: string]: string }>({});
  const [savingBank, setSavingBank] = useState(false);

  const [formData, setFormData] = useState({
    business_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip_code: "",
    business_type: "",
    description: ""
  });

  useEffect(() => {
    loadProfile();
    loadBankDetails();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      showMessage("No authentication token found. Please log in again.", "error");
      return false;
    }
    
    if (!userStr) {
      showMessage("User data not found. Please log in again.", "error");
      return false;
    }
    
    return true;
  };

  const loadProfile = async () => {
    try {
      // Check authentication status first
      if (!checkAuthStatus()) {
        return;
      }

      // Get user data from localStorage as fallback
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr!);
      
      // Try to get profile from backend API first
      try {
        const response = await apiService.getProfile();
        
        if (response.success && response.user) {
          const apiUser = response.user;
                  const userProfile = {
          id: apiUser.id,
          business_name: apiUser.company_name || apiUser.username || "Your Business Name",
          contact_person: `${apiUser.first_name || 'User'} ${apiUser.last_name || ''}`.trim(),
          email: apiUser.email,
          phone: apiUser.phone || "",
          address: apiUser.address || "",
          city: apiUser.city || "",
          zip_code: apiUser.postal_code || "",
          business_type: "Agriculture", // Default for producers
          description: "Update your business description to attract more buyers.",
          created_at: new Date().toISOString(),
          status: "active"
        };
        
        setProfile(userProfile);
        setFormData({
          business_name: userProfile.business_name,
          contact_person: userProfile.contact_person,
          email: userProfile.email,
          phone: userProfile.phone,
          address: userProfile.address,
          city: userProfile.city,
          zip_code: userProfile.zip_code,
          business_type: userProfile.business_type,
          description: userProfile.description
        });
          return; // Success, exit early
        }
      } catch (apiError) {
        console.log("API call failed, using localStorage data:", apiError);
        // Continue to localStorage fallback
      }
      
      // Fallback to localStorage data if API fails
      const userProfile = {
        id: userData.id,
        business_name: userData.company_name || userData.name || "Your Business Name",
        contact_person: `${userData.first_name || userData.name?.split(' ')[0] || 'User'} ${userData.last_name || userData.name?.split(' ')[1] || ''}`.trim(),
        email: userData.email,
        phone: userData.phone || "",
        address: userData.address || "",
        city: userData.city || "",
        zip_code: userData.postal_code || "",
        business_type: "Agriculture", // Default for producers
        description: "Update your business description to attract more buyers.",
        created_at: new Date().toISOString(),
        status: "active"
      };
      
      // Log what data we have for debugging
      console.log("Using localStorage data:", userData);
      console.log("Constructed profile:", userProfile);
      
      setProfile(userProfile);
      setFormData({
        business_name: userProfile.business_name,
        contact_person: userProfile.contact_person,
        email: userProfile.email,
        phone: userProfile.phone,
        address: userProfile.address,
        city: userProfile.city,
        zip_code: userProfile.zip_code,
        business_type: userProfile.business_type,
        description: userProfile.description
      });
      
      // Show a warning that we're using cached data
      showMessage("Using cached profile data. Your session may have expired. Please log out and log back in for full functionality.", "error");
      
    } catch (error) {
      console.error("Error loading profile:", error);
      showMessage("Error loading profile. Please log in again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBankDetails = async () => {
    try {
      const response = await apiService.getProducerBankDetails();
      
      if (response.detailed_bank_details) {
        setBankDetails(response.detailed_bank_details);
      }
    } catch (error) {
      console.error("Error loading bank details:", error);
      showMessage("Error loading bank details. Please try again later.", "error");
    } finally {
      setLoadingBankDetails(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Map frontend fields to backend API fields
      const profileUpdateData = {
        name: formData.business_name, // username
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        company: formData.business_name, // company_name
        first_name: formData.contact_person.split(' ')[0] || formData.contact_person,
        last_name: formData.contact_person.split(' ').slice(1).join(' ') || '',
        city: formData.city,
        postal_code: formData.zip_code,
        country: 'Nigeria' // Default for producers
      };

      const response = await apiService.updateProfile(profileUpdateData);
      
      // Update local profile state with the response
      if (response.success && response.user) {
        setProfile((prev: any) => ({
          ...prev,
          business_name: response.user.company_name || response.user.name,
          contact_person: `${response.user.first_name} ${response.user.last_name}`.trim(),
          email: response.user.email,
          phone: response.user.phone || '',
          address: response.user.address || '',
          city: response.user.city || '',
          zip_code: response.user.postal_code || ''
        }));
      }
      
      setEditing(false);
      showMessage("Profile updated successfully", "success");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const errorMessage = error?.message || "Error updating profile. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setFormData({
      business_name: profile.business_name,
      contact_person: profile.contact_person,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      zip_code: profile.zip_code,
      business_type: profile.business_type,
      description: profile.description
    });
    setEditing(false);
  };

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const changePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }
    
    setChangingPassword(true);
    
    try {
      await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
      showMessage("Password changed successfully", "success");
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error?.message || "Error changing password. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordErrors({});
  };

  // Bank details functions
  const validateBankForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!bankFormData.bank_name.trim()) {
      errors.bank_name = 'Bank name is required';
    }
    if (!bankFormData.account_number.trim()) {
      errors.account_number = 'Account number is required';
    } else if (!/^\d{10,11}$/.test(bankFormData.account_number)) {
      errors.account_number = 'Account number must be 10-11 digits';
    }
    if (!bankFormData.account_name.trim()) {
      errors.account_name = 'Account name is required';
    }
    
    setBankFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBankInputChange = (field: string, value: string) => {
    setBankFormData(prev => ({ ...prev, [field]: value }));
    if (bankFormErrors[field]) {
      setBankFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const openAddBankModal = () => {
    setBankFormData({
      bank_name: "",
      account_number: "",
      account_name: "",
      account_type: "savings"
    });
    setBankFormErrors({});
    setEditingBankId(null);
    setShowAddBankModal(true);
  };

  const openEditBankModal = (bankDetail: any) => {
    setBankFormData({
      bank_name: bankDetail.bank_name,
      account_number: bankDetail.account_number,
      account_name: bankDetail.account_name,
      account_type: bankDetail.account_type
    });
    setBankFormErrors({});
    setEditingBankId(bankDetail.id);
    setShowAddBankModal(true);
  };

  const saveBankDetail = async () => {
    if (!validateBankForm()) {
      return;
    }

    setSavingBank(true);
    try {
      let response;
      if (editingBankId) {
        response = await apiService.updateProducerBankDetails(editingBankId, bankFormData);
      } else {
        response = await apiService.addProducerBankDetails(bankFormData);
      }

      if (response.message) {
        setShowAddBankModal(false);
        loadBankDetails(); // Reload bank details
        showMessage(response.message, "success");
      }
    } catch (error: any) {
      console.error("Error saving bank details:", error);
      const errorMessage = error?.message || "Error saving bank details. Please try again.";
      showMessage(errorMessage, "error");
    } finally {
      setSavingBank(false);
    }
  };

  const deleteBankDetail = async (bankId: number) => {
    if (!confirm("Are you sure you want to delete this bank account?")) {
      return;
    }

    try {
      const response = await apiService.deleteProducerBankDetails(bankId);
      if (response.message) {
        loadBankDetails(); // Reload bank details
        showMessage(response.message, "success");
      }
    } catch (error: any) {
      console.error("Error deleting bank details:", error);
      const errorMessage = error?.message || "Error deleting bank details. Please try again.";
      showMessage(errorMessage, "error");
    }
  };

  const setPrimaryBank = async (bankId: number) => {
    try {
      const response = await apiService.setPrimaryBankDetails(bankId);
      if (response.message) {
        loadBankDetails(); // Reload bank details
        showMessage(response.message, "success");
      }
    } catch (error: any) {
      console.error("Error setting primary bank:", error);
      const errorMessage = error?.message || "Error setting primary bank. Please try again.";
      showMessage(errorMessage, "error");
    }
  };

  const closeBankModal = () => {
    setShowAddBankModal(false);
    setBankFormData({
      bank_name: "",
      account_number: "",
      account_name: "",
      account_type: "savings"
    });
    setBankFormErrors({});
    setEditingBankId(null);
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "#1f2937", marginBottom: "0.5rem" }}>
            Account Settings
          </h1>
          <p style={{ color: "#6b7280", fontSize: "1rem" }}>
            Manage your business profile and account preferences
          </p>
          
          {/* Welcome message for new producers */}
          {(!profile.business_name || profile.business_name === "Your Business Name") && (
            <div style={{ 
              background: '#f0f9ff', 
              border: '1px solid #0ea5e9', 
              color: '#0c4a6e', 
              padding: '1rem', 
              borderRadius: 8, 
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>🎯</span>
              <div>
                <strong>Welcome to Bis-Connect!</strong> Complete your business profile to attract more buyers and start selling your products.
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Success/Error Message */}
      {message && (
        <div style={{ 
          padding: "1rem", 
          borderRadius: 6, 
          marginBottom: "2rem",
          background: messageType === "success" ? "#d1fae5" : "#fef3c7",
          color: messageType === "success" ? "#065f46" : "#92400e",
          border: `1px solid ${messageType === "success" ? "#a7f3d0" : "#fde68a"}`
        }}>
          <div>
            <strong>⚠️ {message}</strong>
            {messageType === "error" && (
              <div style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.8 }}>
                This usually means your session has expired. Click "Logout & Re-login" above to refresh your session.
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Profile Information */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden"
        }}>
          <div style={{ 
            padding: "1.5rem", 
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
              Business Profile
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#3b82f6",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.875rem",
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
                  onClick={saveProfile}
                  disabled={saving}
                  style={{
                    padding: "0.5rem 1rem",
                    background: saving ? "#9ca3af" : "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    cursor: saving ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                  }}
                >
                  <FaSave style={{ fontSize: "0.75rem" }} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "0.875rem",
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

          <div style={{ padding: "1.5rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Business Name */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Business Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange("business_name", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.business_name}
                  </div>
                )}
              </div>

              {/* Contact Person */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Contact Person
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange("contact_person", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.contact_person}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Email Address
                </label>
                {editing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Phone Number
                </label>
                {editing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.phone}
                  </div>
                )}
              </div>

              {/* Business Type */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Business Type
                </label>
                {editing ? (
                  <select
                    value={formData.business_type}
                    onChange={(e) => handleInputChange("business_type", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem",
                      background: "#fff"
                    }}
                  >
                    <option value="">Select Business Type</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Service">Service</option>
                  </select>
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.business_type}
                  </div>
                )}
              </div>

              {/* Address */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Street Address
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.address}
                  </div>
                )}
              </div>

              {/* City, Zip */}
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  City
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.city}
                  </div>
                )}
              </div>

              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  ZIP Code
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.zip_code}
                    onChange={(e) => handleInputChange("zip_code", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                      fontSize: "0.875rem"
                    }}
                  />
                ) : (
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937"
                  }}>
                    {profile.zip_code}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "#374151", 
                  marginBottom: "0.5rem" 
                }}>
                  Business Description
                </label>
                {editing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={4}
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
                  <div style={{ 
                    padding: "0.75rem", 
                    background: "#f9fafb", 
                    borderRadius: 6, 
                    fontSize: "0.875rem",
                    color: "#1f2937",
                    lineHeight: 1.5
                  }}>
                    {profile.description}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details Section */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 8, 
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          marginTop: "2rem"
        }}>
          <div style={{ 
            padding: "1.5rem", 
            borderBottom: "1px solid #e5e7eb",
            background: "#f9fafb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1f2937" }}>
              Bank Details
            </h2>
            <button
              onClick={openAddBankModal}
              style={{
                padding: "0.5rem 1rem",
                background: "#10b981",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaPlus style={{ fontSize: "0.75rem" }} />
              Add Bank Account
            </button>
          </div>

          <div style={{ padding: "1.5rem" }}>
            {loadingBankDetails ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                Loading bank details...
              </div>
            ) : bankDetails.length > 0 ? (
              <div style={{ display: "grid", gap: "1rem" }}>
                {bankDetails.map((bank) => (
                  <div key={bank.id} style={{ 
                    padding: "1rem", 
                    border: "1px solid #e5e7eb", 
                    borderRadius: 6,
                    background: bank.is_active ? "#f0f9ff" : "#fff",
                    position: "relative"
                  }}>
                    {bank.is_active && (
                      <div style={{ 
                        position: "absolute", 
                        top: "0.5rem", 
                        right: "0.5rem",
                        background: "#3b82f6",
                        color: "#fff",
                        padding: "0.25rem 0.5rem",
                        borderRadius: 4,
                        fontSize: "0.75rem",
                        fontWeight: 500
                      }}>
                        Primary
                      </div>
                    )}
                    
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <FaUniversity style={{ fontSize: "1.25rem", color: "#6b7280" }} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1f2937" }}>
                            {bank.bank_name}
                          </div>
                          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                            {bank.account_name}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {!bank.is_active && (
                          <button
                            onClick={() => setPrimaryBank(bank.id)}
                            style={{
                              padding: "0.25rem 0.5rem",
                              background: "#3b82f6",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem"
                            }}
                          >
                            <FaStar style={{ fontSize: "0.625rem" }} />
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => openEditBankModal(bank)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#f3f4f6",
                            color: "#374151",
                            border: "none",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteBankDetail(bank.id)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: 4,
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                        >
                          <FaTrash style={{ fontSize: "0.625rem" }} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      Account: {bank.account_number}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      Type: {bank.account_type.charAt(0).toUpperCase() + bank.account_type.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                color: "#6b7280" 
              }}>
                <FaUniversity style={{ fontSize: "2rem", color: "#d1d5db", marginBottom: "1rem" }} />
                <div style={{ fontSize: "1rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                  No bank accounts added
                </div>
                <div style={{ fontSize: "0.875rem" }}>
                  Add your bank account details to receive payments from buyers
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Account Status */}
          <div style={{ 
            background: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            padding: "1.5rem"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
              Account Status
            </h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ 
                width: "12px", 
                height: "12px", 
                background: "#10b981", 
                borderRadius: "50%" 
              }} />
              <span style={{ fontSize: "0.875rem", color: "#1f2937" }}>
                Active Account
              </span>
            </div>
            <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ 
            background: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            padding: "1.5rem"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
              Quick Actions
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <button 
                onClick={() => setShowPasswordModal(true)}
                style={{
                  padding: "0.75rem",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  textAlign: "left"
                }}
              >
                <FaShieldAlt style={{ color: "#3b82f6" }} />
                Change Password
              </button>
              <button style={{
                padding: "0.75rem",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: 6,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textAlign: "left"
              }}>
                <FaBell style={{ color: "#8b5cf6" }} />
                Notification Preferences
              </button>
              <button style={{
                padding: "0.75rem",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: 6,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                textAlign: "left"
              }}>
                <FaCog style={{ color: "#6b7280" }} />
                Account Settings
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ 
            background: "#fff", 
            borderRadius: 8, 
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            padding: "1.5rem"
          }}>
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#1f2937", marginBottom: "1rem" }}>
              Contact Information
            </h3>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <FaEnvelope style={{ color: "#6b7280", fontSize: "0.875rem" }} />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                  {profile.email}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <FaPhone style={{ color: "#6b7280", fontSize: "0.875rem" }} />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                  {profile.phone}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <FaMapMarkerAlt style={{ color: "#6b7280", fontSize: "0.875rem" }} />
                <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                  {profile.city} {profile.zip_code}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: 8,
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937" }}>
                Change Password
              </h2>
              <button
                onClick={closePasswordModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Current Password */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: passwordErrors.currentPassword ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                  placeholder="Enter your current password"
                />
                {passwordErrors.currentPassword && (
                  <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {passwordErrors.currentPassword}
                  </div>
                )}
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: passwordErrors.newPassword ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                  placeholder="Enter your new password"
                />
                {passwordErrors.newPassword && (
                  <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {passwordErrors.newPassword}
                  </div>
                )}
                <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                  Password must be at least 6 characters long
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: passwordErrors.confirmPassword ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                  placeholder="Confirm your new password"
                />
                {passwordErrors.confirmPassword && (
                  <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {passwordErrors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={changePassword}
                  disabled={changingPassword}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: changingPassword ? "#9ca3af" : "#3b82f6",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: changingPassword ? "not-allowed" : "pointer",
                    fontWeight: 500
                  }}
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bank Details Modal */}
      {showAddBankModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem"
        }}>
          <div style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: 8,
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "#1f2937" }}>
                {editingBankId ? "Edit Bank Account" : "Add Bank Account"}
              </h2>
              <button
                onClick={closeBankModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Bank Name */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={bankFormData.bank_name}
                  onChange={(e) => handleBankInputChange("bank_name", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: bankFormErrors.bank_name ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                  placeholder="Enter bank name"
                />
                {bankFormErrors.bank_name && (
                  <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {bankFormErrors.bank_name}
                  </div>
                )}
              </div>

              {/* Account Name */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Account Name *
                </label>
                <input
                  type="text"
                  value={bankFormData.account_name}
                  onChange={(e) => handleBankInputChange("account_name", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: bankFormErrors.account_name ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                  placeholder="Enter account holder name"
                />
                {bankFormErrors.account_name && (
                  <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {bankFormErrors.account_name}
                  </div>
                )}
              </div>

              {/* Account Number */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Account Number *
                </label>
                <input
                  type="text"
                  value={bankFormData.account_number}
                  onChange={(e) => handleBankInputChange("account_number", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: bankFormErrors.account_number ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem"
                  }}
                  placeholder="Enter 10-11 digit account number"
                />
                {bankFormErrors.account_number && (
                  <div style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    {bankFormErrors.account_number}
                  </div>
                )}
              </div>

              {/* Account Type */}
              <div>
                <label style={{ display: "block", fontWeight: 500, color: "#374151", marginBottom: "0.5rem" }}>
                  Account Type
                </label>
                <select
                  value={bankFormData.account_type}
                  onChange={(e) => handleBankInputChange("account_type", e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: 6,
                    fontSize: "0.875rem",
                    background: "#fff"
                  }}
                >
                  <option value="savings">Savings Account</option>
                  <option value="current">Current Account</option>
                  <option value="checking">Checking Account</option>
                </select>
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={closeBankModal}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: "#6b7280",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={saveBankDetail}
                  disabled={savingBank}
                  style={{
                    padding: "0.75rem 1.5rem",
                    background: savingBank ? "#9ca3af" : "#10b981",
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    cursor: savingBank ? "not-allowed" : "pointer",
                    fontWeight: 500
                  }}
                >
                  {savingBank ? "Saving..." : (editingBankId ? "Update" : "Add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 