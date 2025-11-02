"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiService } from "@/services/api";
import { guestCartService } from "@/services/guestCart";
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inlineErrors, setInlineErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [cartTransferMessage, setCartTransferMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiService.login(formData.email, formData.password);
      
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

      // Transfer guest cart items to user's account cart
      const guestCartItems = guestCartService.getCartItems();
      if (guestCartItems.length > 0) {
        try {
          // Add each guest cart item to the user's account cart
          for (const item of guestCartItems) {
            await apiService.addToCart({
              product_id: item.id,
              quantity: item.quantity
            });
          }
          
          // Clear the guest cart after successful transfer
          guestCartService.clearCart();
          
          // Show success message
          setCartTransferMessage(`✅ ${guestCartItems.length} item${guestCartItems.length > 1 ? 's' : ''} from your guest cart have been added to your account!`);
          
          console.log(`Successfully transferred ${guestCartItems.length} items from guest cart to account cart`);
        } catch (cartError) {
          console.error('Error transferring guest cart items:', cartError);
          // Don't block login if cart transfer fails
        }
      }
      
      // Redirect based on user type
      if (response.user.user_type === 'admin') {
        router.push('/dashboard/admin');
      } else if (response.user.user_type === 'producer') {
        router.push('/dashboard/producer');
      } else {
        router.push('/dashboard/buyer');
      }
    } catch (err: any) {
      let msg = err?.message || 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('invalid credentials') || msg.includes('401')) {
        setError('Invalid email or password.');
      } else if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
        setError('Server is unreachable. Please try again later.');
      } else if (msg.toLowerCase().includes('email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setInlineErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="login-container" style={{ background: '#fff', padding: '2rem', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,0.1)', width: '100%', maxWidth: 500, minWidth: 0, margin: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' }}>Welcome Back</h1>
          <p style={{ color: '#6b7280' }}>Sign in to your Bis-Connect account</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {cartTransferMessage && (
          <div style={{ background: '#d1fae5', border: '1px solid #a7f3d0', color: '#065f46', padding: '0.75rem', borderRadius: 6, marginBottom: '1rem' }}>
            {cartTransferMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Email Address
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
            <label htmlFor="password" style={{ display: 'block', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: 10, top: 14, color: '#9ca3af' }} />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                  borderRadius: 6,
                  border: inlineErrors.password ? '1.5px solid #dc2626' : '1px solid #d1d5db',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
                aria-invalid={!!inlineErrors.password}
              />
              <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 10, top: 10, background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 16 }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {inlineErrors.password && <div style={{ color: '#dc2626', fontSize: '0.95rem', marginTop: 2 }}>{inlineErrors.password}</div>}
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: '#6b7280' }}>
            Don't have an account?{' '}
            <Link href="/auth/register" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 