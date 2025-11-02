"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";
import { FaUser, FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem('user');
    setUser(null);
    setShowDropdown(false);
    router.push('/');
  };

  return (
    <nav style={{ background: '#fff', padding: '1rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0070f3', margin: 0 }}>Bis-Connect5</h1>
        </Link>
        {/* Hamburger for mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: 28,
            color: '#374151',
            cursor: 'pointer',
          }}
          className="navbar-hamburger"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
        {/* Links */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
          className={`navbar-links${mobileMenuOpen ? ' open' : ''}`}
        >
          {user && user.type === 'admin' ? (
            <>
              <Link href="/dashboard/admin?page=users" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Users</Link>
              <Link href="/dashboard/admin?page=orders" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Orders</Link>
              <Link href="/dashboard/admin?page=financials" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Financials</Link>
              <Link href="/dashboard/admin?page=products" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Products</Link>
            </>
          ) : user ? (
            <>
              <Link href="/products" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Products</Link>
              <Link href="/dashboard/buyer?page=orders" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Orders</Link>
              <Link href="/dashboard/buyer?page=financials" style={{ textDecoration: 'none', color: '#374151', fontWeight: 500 }}>Financials</Link>
            </>
          ) : null}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#374151', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {user.name}
                <FaUser style={{ fontSize: '1.2rem', color: '#6b7280' }} />
              </button>
              {showDropdown && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  background: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: 8, 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                  padding: '0.5rem 0',
                  minWidth: 200,
                  zIndex: 1000
                }}>
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontWeight: 600, color: '#374151' }}>{user.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                  </div>
                  {user.type === 'admin' ? (
                    <Link href="/dashboard/admin" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#374151' }}>
                      Admin Dashboard
                    </Link>
                  ) : user.type === 'producer' ? (
                    <Link href="/dashboard/producer" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#374151' }}>
                      Seller Dashboard
                    </Link>
                  ) : (
                    <Link href="/dashboard/buyer" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#374151' }}>
                      Buyer Dashboard
                    </Link>
                  )}
                  <Link href={user.type === 'admin' ? "/dashboard/admin/account" : user.type === 'producer' ? "/dashboard/producer/account" : "/dashboard/buyer/account"} style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#374151' }}>
                    Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{ 
                      display: 'block', 
                      width: '100%', 
                      padding: '0.5rem 1rem', 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc2626', 
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.2)',
            zIndex: 99
          }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
} 