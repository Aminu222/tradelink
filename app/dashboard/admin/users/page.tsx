"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaGlobe, FaLock, FaEye, FaEyeSlash, FaUsers, FaUserTie, FaIndustry, FaUserShield } from "react-icons/fa";

const API_BASE = "http://localhost:5000";

function Spinner() {
  return <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ width: 32, height: 32, border: '4px solid #e5e7eb', borderTop: '4px solid #0070f3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} /></div>;
}

type AddUserForm = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  user_type: string;
  first_name: string;
  last_name: string;
  company_name: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  postal_code: string;
};

type AddUserModalProps = {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: AddUserForm;
  setForm: React.Dispatch<React.SetStateAction<AddUserForm>>;
  loading: boolean;
  error: string;
  inlineErrors: Record<string, string>;
  setInlineErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  passwordStrength: number;
  setPasswordStrength: React.Dispatch<React.SetStateAction<number>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
};

function AddUserModal({ onClose, onSubmit, form, setForm, loading, error, inlineErrors, setInlineErrors, passwordStrength, setPasswordStrength, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }: AddUserModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);
  useEffect(() => { if (modalRef.current) (modalRef.current.querySelector('input,select') as HTMLElement)?.focus(); }, []);
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: AddUserForm) => ({ ...prev, [name]: value }));
    setInlineErrors((prev: Record<string, string>) => ({ ...prev, [name]: '' }));
    if (name === 'password') {
      let score = 0;
      if (value.length >= 6) score++;
      if (/[A-Z]/.test(value)) score++;
      if (/[0-9]/.test(value)) score++;
      if (/[^A-Za-z0-9]/.test(value)) score++;
      setPasswordStrength(score);
    }
  };
  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!form.username) errs.username = 'Username is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.first_name) errs.first_name = 'First name is required';
    if (!form.last_name) errs.last_name = 'Last name is required';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  }, [form]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setInlineErrors(errs);
    if (Object.keys(errs).length === 0) onSubmit(e);
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '1rem', position: 'fixed', top: 0, left: 0, width: '100vw', zIndex: 1000 }}>
      <div ref={modalRef} style={{ background: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', width: '100%', maxWidth: 600, maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 28, color: '#6b7280', cursor: 'pointer', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Add New User</h1>
          <p style={{ color: '#6b7280' }}>Create a new user account for Bis-Connect</p>
        </div>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>{error}</div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Account Info Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Account Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="username" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Username *</label>
              <div style={{ position: 'relative' }}>
                <FaUser style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input id="username" name="username" type="text" required value={form.username} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: inlineErrors.username ? '1.5px solid #dc2626' : '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Choose a username" autoFocus aria-invalid={!!inlineErrors.username} />
              </div>
              {inlineErrors.username && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.username}</div>}
            </div>
            <div>
              <label htmlFor="user_type" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Account Type *</label>
              <select id="user_type" name="user_type" required value={form.user_type} onChange={handleInput} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }}>
                <option value="buyer">International Buyer</option>
                <option value="producer">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {/* Personal Info Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Personal Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="first_name" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>First Name *</label>
              <input id="first_name" name="first_name" type="text" required value={form.first_name} onChange={handleInput} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: inlineErrors.first_name ? '1.5px solid #dc2626' : '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter first name" aria-invalid={!!inlineErrors.first_name} />
              {inlineErrors.first_name && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.first_name}</div>}
            </div>
            <div>
              <label htmlFor="last_name" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Last Name *</label>
              <input id="last_name" name="last_name" type="text" required value={form.last_name} onChange={handleInput} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: inlineErrors.last_name ? '1.5px solid #dc2626' : '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter last name" aria-invalid={!!inlineErrors.last_name} />
              {inlineErrors.last_name && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.last_name}</div>}
            </div>
          </div>
          {/* Contact Info Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Contact Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="email" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Email *</label>
              <div style={{ position: 'relative' }}>
                <FaEnvelope style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input id="email" name="email" type="email" required value={form.email} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: inlineErrors.email ? '1.5px solid #dc2626' : '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter email address" aria-invalid={!!inlineErrors.email} />
              </div>
              {inlineErrors.email && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.email}</div>}
            </div>
            <div>
              <label htmlFor="phone" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Phone</label>
              <div style={{ position: 'relative' }}>
                <FaPhone style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input id="phone" name="phone" type="text" value={form.phone} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter phone number" />
              </div>
            </div>
          </div>
          {/* Password Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Set Password</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="password" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Password *</label>
              <div style={{ position: 'relative' }}>
                <FaLock style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} required value={form.password} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: inlineErrors.password ? '1.5px solid #dc2626' : '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter password" aria-invalid={!!inlineErrors.password} />
                <span onClick={() => setShowPassword((v) => !v)} style={{ position: 'absolute', right: 10, top: 14, cursor: 'pointer', color: '#9ca3af' }}>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
              </div>
              <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, marginTop: 6, marginBottom: 2 }}>
                <div style={{ width: `${(passwordStrength / 4) * 100}%`, height: '100%', background: passwordStrength < 2 ? '#f87171' : passwordStrength < 3 ? '#fbbf24' : '#10b981', borderRadius: 3, transition: 'width 0.2s' }} />
              </div>
              <div style={{ fontSize: '0.92rem', color: passwordStrength < 2 ? '#f87171' : passwordStrength < 3 ? '#fbbf24' : '#10b981' }}>{passwordStrength < 2 ? 'Weak' : passwordStrength < 3 ? 'Medium' : 'Strong'}</div>
              {inlineErrors.password && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.password}</div>}
            </div>
            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required value={form.confirmPassword} onChange={handleInput} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: inlineErrors.confirmPassword ? '1.5px solid #dc2626' : '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Re-enter password" aria-invalid={!!inlineErrors.confirmPassword} />
                <span onClick={() => setShowConfirmPassword((v) => !v)} style={{ position: 'absolute', right: 10, top: 14, cursor: 'pointer', color: '#9ca3af' }}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</span>
              </div>
              {inlineErrors.confirmPassword && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.confirmPassword}</div>}
            </div>
          </div>
          {/* Company Info Section (for producer/admin) */}
          {(form.user_type === 'producer' || form.user_type === 'admin') && (
            <>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Company Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div>
                  <label htmlFor="company_name" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Company Name</label>
                  <div style={{ position: 'relative' }}>
                    <FaBuilding style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                    <input id="company_name" name="company_name" type="text" value={form.company_name} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter company name" />
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Address Section */}
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', marginBottom: 4 }}>Address</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="country" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Country</label>
              <div style={{ position: 'relative' }}>
                <FaGlobe style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input id="country" name="country" type="text" value={form.country} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter country" />
              </div>
            </div>
            <div>
              <label htmlFor="city" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>City</label>
              <div style={{ position: 'relative' }}>
                <FaMapMarkerAlt style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
                <input id="city" name="city" type="text" value={form.city} onChange={handleInput} style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter city" />
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="address" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Address</label>
              <input id="address" name="address" type="text" value={form.address} onChange={handleInput} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter address" />
            </div>
            <div>
              <label htmlFor="postal_code" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>Postal Code</label>
              <input id="postal_code" name="postal_code" type="text" value={form.postal_code} onChange={handleInput} style={{ width: '100%', padding: '0.75rem', borderRadius: 6, border: '1px solid #d1d5db', fontSize: '1rem', boxSizing: 'border-box' }} placeholder="Enter postal code" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
            <button type="button" onClick={onClose} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ background: loading ? '#9ca3af' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '0.75rem 1.5rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '1rem' }}>{loading ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState("");
  const [addUserSuccess, setAddUserSuccess] = useState("");
  const [addUserInlineErrors, setAddUserInlineErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirm, setConfirm] = useState<{ userId: number; isActive: boolean } | null>(null);

  const [addUserForm, setAddUserForm] = useState<AddUserForm>({
    username: '', email: '', password: '', confirmPassword: '', user_type: 'buyer', first_name: '', last_name: '', company_name: '', phone: '', address: '', country: '', city: '', postal_code: ''
  });

  const userTypeRef = useRef<HTMLSelectElement>(null);
  const userStartDateRef = useRef<HTMLInputElement>(null);
  const userEndDateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUsers();
  }, [searchParams]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearch.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, userSearch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get user_id from URL parameters
      const userId = searchParams.get('user_id');
      
      // Build URL with query parameters
      let url = `${API_BASE}/admin/users`;
      const params = new URLSearchParams();
      if (userId) {
        params.append('user_id', userId);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data);
      setFilteredUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId: number, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ is_active: isActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user status');
      setSuccess(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      setConfirm(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const handleUserFilter = () => {
    const userType = userTypeRef.current?.value;
    const startDate = userStartDateRef.current?.value;
    const endDate = userEndDateRef.current?.value;
    
    let filtered = users;
    if (userType) filtered = filtered.filter(u => u.user_type === userType);
    if (startDate) filtered = filtered.filter(u => u.created_at >= startDate);
    if (endDate) filtered = filtered.filter(u => u.created_at <= endDate);
    
    setFilteredUsers(filtered);
  };

  const handleUserExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Username,Email,Type,Name,Status,Created At\n" +
      filteredUsers.map(u => `${u.id},${u.username},${u.email},${u.user_type},${u.first_name} ${u.last_name},${u.is_active ? 'Active' : 'Inactive'},${u.created_at}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserLoading(true);
    setAddUserError("");
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          username: addUserForm.username,
          email: addUserForm.email,
          password: addUserForm.password,
          user_type: addUserForm.user_type,
          first_name: addUserForm.first_name,
          last_name: addUserForm.last_name,
          company_name: addUserForm.company_name,
          phone: addUserForm.phone,
          address: addUserForm.address,
          country: addUserForm.country,
          city: addUserForm.city,
          postal_code: addUserForm.postal_code
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      setAddUserSuccess('User created successfully');
      setShowAddUser(false);
      setAddUserForm({
        username: '', email: '', password: '', confirmPassword: '', user_type: 'buyer', first_name: '', last_name: '', company_name: '', phone: '', address: '', country: '', city: '', postal_code: ''
      });
      setAddUserInlineErrors({});
      setPasswordStrength(0);
      setShowPassword(false);
      setShowConfirmPassword(false);
      fetchUsers();
    } catch (err: any) {
      setAddUserError(err.message || 'Failed to create user');
    } finally {
      setAddUserLoading(false);
    }
  };

  // Calculate user type counts
  const userStats = {
    total: users.length,
    buyers: users.filter(user => user.user_type === 'buyer').length,
    producers: users.filter(user => user.user_type === 'producer').length,
    admins: users.filter(user => user.user_type === 'admin').length,
    active: users.filter(user => user.is_active).length
  };

  if (loading) return <Spinner />;
  if (error) return <div style={{ color: "red", padding: 32 }}>{error}</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 32, color: '#1f2937' }}>User Management</h1>
      
      {/* Show when viewing a specific user */}
      {searchParams.get('user_id') && filteredUsers.length === 1 && (
        <div style={{ 
          background: '#dbeafe', 
          color: '#1e40af', 
          padding: '1rem', 
          borderRadius: 8, 
          marginBottom: 16, 
          border: '1px solid #bfdbfe',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FaUser style={{ fontSize: '1rem' }} />
          <span style={{ fontWeight: 500 }}>
            Viewing seller profile: <strong>{filteredUsers[0]?.first_name} {filteredUsers[0]?.last_name}</strong> 
            ({filteredUsers[0]?.username})
          </span>
        </div>
      )}
      
      {success && <div style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: 6, marginBottom: 16, fontWeight: 500 }}>{success}</div>}
      
      {/* User Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        {/* Total Users */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#dbeafe', borderRadius: 8, padding: 12 }}>
              <FaUsers style={{ fontSize: 24, color: '#2563eb' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{userStats.total}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Users</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
            {userStats.active} active users
          </div>
        </div>

        {/* Total Buyers */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#d1fae5', borderRadius: 8, padding: 12 }}>
              <FaUserTie style={{ fontSize: 24, color: '#059669' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{userStats.buyers}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Buyers</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
            International buyers
          </div>
        </div>

        {/* Total Producers */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#fef3c7', borderRadius: 8, padding: 12 }}>
              <FaIndustry style={{ fontSize: 24, color: '#d97706' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{userStats.producers}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Producers</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
                            Nigerian sellers
          </div>
        </div>

        {/* Total Admins */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ background: '#fce7f3', borderRadius: 8, padding: 12 }}>
              <FaUserShield style={{ fontSize: 24, color: '#be185d' }} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1f2937' }}>{userStats.admins}</div>
              <div style={{ fontSize: 14, color: '#6b7280' }}>Total Admins</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#059669' }}>
            System administrators
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700 }}>All Users</h2>
        <button onClick={() => setShowAddUser(true)} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>+ Add User</button>
      </div>
      
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <select ref={userTypeRef} style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }}>
          <option value="">All Types</option>
          <option value="producer">Producer</option>
          <option value="buyer">Buyer</option>
          <option value="admin">Admin</option>
        </select>
        <input ref={userStartDateRef} type="date" style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
        <input ref={userEndDateRef} type="date" style={{ padding: 8, borderRadius: 6, border: '1px solid #d1d5db' }} />
        <button onClick={handleUserFilter} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Filter</button>
        <button onClick={handleUserExport} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, cursor: 'pointer' }}>Export CSV</button>
      </div>
      
      <input type="text" placeholder="Search users..." value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #d1d5db', width: 300 }} />
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filteredUsers.map((u: any) => (
          <div key={u.id} style={{ 
            background: '#fff', 
            borderRadius: 12, 
            padding: 20, 
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
            border: '1px solid #e5e7eb',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: u.user_type === 'buyer' ? '#d1fae5' : u.user_type === 'producer' ? '#fef3c7' : '#fce7f3', 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {u.user_type === 'buyer' ? (
                  <FaUserTie style={{ color: '#059669', fontSize: '1.25rem' }} />
                ) : u.user_type === 'producer' ? (
                  <FaIndustry style={{ color: '#d97706', fontSize: '1.25rem' }} />
                ) : (
                  <FaUserShield style={{ color: '#be185d', fontSize: '1.25rem' }} />
                )}
              </div>
              <div style={{ 
                padding: '0.25rem 0.75rem', 
                borderRadius: 20, 
                fontSize: '0.75rem',
                fontWeight: 500,
                background: u.is_active ? '#d1fae5' : '#fee2e2',
                color: u.is_active ? '#065f46' : '#dc2626'
              }}>
                {u.is_active ? 'Active' : 'Inactive'}
              </div>
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem', fontSize: '1.1rem' }}>
                {u.first_name} {u.last_name}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                @{u.username}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {u.email}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ 
                display: 'inline-block',
                padding: '0.25rem 0.75rem', 
                borderRadius: 20, 
                fontSize: '0.75rem',
                fontWeight: 500,
                background: u.user_type === 'buyer' ? '#d1fae5' : u.user_type === 'producer' ? '#fef3c7' : '#fce7f3',
                color: u.user_type === 'buyer' ? '#065f46' : u.user_type === 'producer' ? '#92400e' : '#be185d'
              }}>
                {u.user_type === 'buyer' ? 'International Buyer' : u.user_type === 'producer' ? 'Seller' : 'Admin'}
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                ID: {u.id}
              </div>
              <button 
                onClick={() => setConfirm({ userId: u.id, isActive: !u.is_active })} 
                style={{ 
                  background: u.is_active ? "#f87171" : "#10b981", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 6, 
                  padding: "8px 16px", 
                  cursor: "pointer",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = u.is_active ? "#ef4444" : "#059669";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = u.is_active ? "#f87171" : "#10b981";
                }}
              >
                {u.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {confirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', minWidth: 320 }}>
            <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>Are you sure?</h3>
            <p style={{ marginBottom: 24 }}>You are about to {confirm.isActive ? 'activate' : 'deactivate'} this user.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirm(null)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 500, fontSize: '1rem' }}>Cancel</button>
              <button onClick={() => handleUserStatus(confirm.userId, confirm.isActive)} style={{ background: confirm.isActive ? '#10b981' : '#f87171', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>{confirm.isActive ? 'Activate' : 'Deactivate'}</button>
            </div>
          </div>
        </div>
      )}
      
      {showAddUser && (
        <AddUserModal
          onClose={() => {
            setShowAddUser(false);
            setAddUserForm({
              username: '', email: '', password: '', confirmPassword: '', user_type: 'buyer', first_name: '', last_name: '', company_name: '', phone: '', address: '', country: '', city: '', postal_code: ''
            });
            setAddUserError('');
            setAddUserSuccess('');
            setAddUserInlineErrors({});
            setPasswordStrength(0);
            setShowPassword(false);
            setShowConfirmPassword(false);
          }}
          onSubmit={handleAddUser}
          form={addUserForm}
          setForm={setAddUserForm}
          loading={addUserLoading}
          error={addUserError}
          inlineErrors={addUserInlineErrors}
          setInlineErrors={setAddUserInlineErrors}
          passwordStrength={passwordStrength}
          setPasswordStrength={setPasswordStrength}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      )}
    </div>
  );
} 