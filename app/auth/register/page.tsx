"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/services/api";
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaPhone, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    user_type: "buyer" as "buyer" | "producer",
    first_name: "",
    last_name: "",
    phone: "",
    // Optional fields that can be filled later
    company_name: "",
    address: "",
    country: "",
    city: "",
    postal_code: "",
    // Bank details (optional for producers during registration)
    bank_name: "",
    account_name: "",
    account_number: "",
    bank_code: "",
    swift_code: "",
    routing_number: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [inlineErrors, setInlineErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Bank details are now optional for producers during registration
    // They can be added later in their profile

    setLoading(true);

    try {
      const response = await apiService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        user_type: formData.user_type,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        company_name: formData.company_name || undefined,
        address: formData.address || undefined,
        country: formData.country || undefined,
        city: formData.city || undefined,
        postal_code: formData.postal_code || undefined,
        // Bank details (optional for producers during registration)
        bank_name: formData.bank_name || undefined,
        account_name: formData.account_name || undefined,
        account_number: formData.account_number || undefined,
        bank_code: formData.bank_code || undefined,
        swift_code: formData.swift_code || undefined,
        routing_number: formData.routing_number || undefined
      });
      
      // Store user info in localStorage for UI state
      localStorage.setItem('user', JSON.stringify({
        id: response.user.id,
        name: `${response.user.first_name} ${response.user.last_name}`,
        type: response.user.user_type,
        email: response.user.email,
        first_name: response.user.first_name,
        last_name: response.user.last_name,
        company_name: response.user.company_name,
        phone: response.user.phone,
        address: response.user.address,
        city: response.user.city,
        state: response.user.state,
        postal_code: response.user.postal_code,
        country: response.user.country
      }));
      
      // Redirect based on user type
      if (response.user.user_type === 'producer') {
        // Show success message and redirect to producer dashboard
        setMessage("Account created successfully! Please complete your business profile and bank details.");
        setMessageType("success");
        setTimeout(() => {
        router.push('/dashboard/producer');
        }, 2000);
      } else {
        router.push('/dashboard/buyer');
      }
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setError('Username or email already exists. Please use a different one.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setInlineErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'password') {
      // Simple password strength: 0-4
      let score = 0;
      if (value.length >= 6) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setPasswordStrength(score);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem' }}>
      <div style={{ background: '#fff', padding: '3rem', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', width: '100%', maxWidth: 800, maxHeight: '90vh', overflow: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Create Account</h1>
          <p style={{ color: '#6b7280' }}>Join Bis-Connect to connect with global markets</p>
          {formData.user_type === 'producer' && (
            <p style={{ fontSize: '0.9rem', color: '#059669', marginTop: '0.5rem', fontStyle: 'italic' }}>
              💡 You can complete your business profile and bank details after logging in
            </p>
          )}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ 
            background: messageType === 'success' ? '#f0fdf4' : '#fef2f2', 
            border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`, 
            color: messageType === 'success' ? '#166534' : '#dc2626', 
            padding: '0.75rem', 
            borderRadius: 6, 
            marginBottom: '1rem' 
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Info Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Account Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label htmlFor="username" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Username *
              </label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 6,
                    border: inlineErrors.username ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Choose a username"
                  aria-invalid={!!inlineErrors.username}
                />
              </div>
              {inlineErrors.username && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.username}</div>}
            </div>
            <div>
              <label htmlFor="user_type" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Account Type *
              </label>
              <select
                id="user_type"
                name="user_type"
                required
                value={formData.user_type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="buyer"> Buyer</option>
                <option value="producer">local Seller</option>
              </select>
            </div>
          </div>
          {/* Personal Info Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label htmlFor="first_name" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                First Name *
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  border: inlineErrors.first_name ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter first name"
                aria-invalid={!!inlineErrors.first_name}
              />
              {inlineErrors.first_name && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.first_name}</div>}
            </div>
            <div>
              <label htmlFor="last_name" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Last Name *
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  border: inlineErrors.last_name ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter last name"
                aria-invalid={!!inlineErrors.last_name}
              />
              {inlineErrors.last_name && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.last_name}</div>}
            </div>
          </div>
          {/* Contact Info Section (show for both types) */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Contact Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Email Address *
              </label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 6,
                    border: inlineErrors.email ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter your email"
                  aria-invalid={!!inlineErrors.email}
                />
              </div>
              {inlineErrors.email && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.email}</div>}
            </div>
            <div>
              <label htmlFor="phone" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Phone *
              </label>
              <div style={{ position: 'relative' }}>
                <FaPhone style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 6,
                    border: inlineErrors.phone ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter phone number"
                  aria-invalid={!!inlineErrors.phone}
                />
              </div>
              {inlineErrors.phone && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.phone}</div>}
            </div>
          </div>
          {/* Password Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Set Password</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 6,
                    border: inlineErrors.password ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Create a password"
                  aria-invalid={!!inlineErrors.password}
                />
              </div>
              {/* Password strength meter */}
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 6, marginBottom: 2 }}>
                <div style={{ width: `${(passwordStrength / 4) * 100}%`, height: '100%', background: passwordStrength < 2 ? '#f87171' : passwordStrength < 3 ? '#fbbf24' : '#10b981', borderRadius: 3, transition: 'width 0.2s' }} />
              </div>
              <div style={{ fontSize: '0.92rem', color: passwordStrength < 2 ? '#f87171' : passwordStrength < 3 ? '#fbbf24' : '#10b981' }}>
                {passwordStrength < 2 ? 'Weak' : passwordStrength < 3 ? 'Medium' : 'Strong'}
              </div>
              {inlineErrors.password && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.password}</div>}
            </div>
            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  border: inlineErrors.confirmPassword ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Re-enter password"
                aria-invalid={!!inlineErrors.confirmPassword}
              />
              {inlineErrors.confirmPassword && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.confirmPassword}</div>}
            </div>
          </div>
          {/* Company Information Section - Removed from registration, can be added in profile */}
          
                    {/* Bank Details Section - Removed from registration, can be added in profile */}
          {/* Address Section - Optional, can be filled later */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Address (Optional)</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label htmlFor="country" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Country
              </label>
              <div style={{ position: 'relative' }}>
                <FaGlobe style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter country"
                />
              </div>
            </div>
            <div>
              <label htmlFor="city" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                City
              </label>
              <div style={{ position: 'relative' }}>
                <FaMapMarkerAlt style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Enter city"
                />
              </div>
            </div>
            <div>
              <label htmlFor="address" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter address"
              />
            </div>
            <div>
              <label htmlFor="postal_code" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
                Postal Code
              </label>
              <input
                id="postal_code"
                name="postal_code"
                type="text"
                value={formData.postal_code}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter postal code"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : '#2563eb',
              color: '#fff',
              padding: '0.9rem',
              borderRadius: 8,
              border: 'none',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 12,
              boxShadow: '0 2px 8px rgba(37,99,235,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
            aria-busy={loading}
          >
            {loading && <span className="spinner" style={{ width: 18, height: 18, border: '2.5px solid #fff', borderTop: '2.5px solid #2563eb', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />}
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#6b7280' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 