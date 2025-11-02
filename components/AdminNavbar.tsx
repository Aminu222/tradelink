"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { apiService } from "@/services/api";
import { FaUser } from "react-icons/fa";

export default function AdminNavbar() {
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem("user");
    setUser(null);
    setShowDropdown(false);
    router.push("/");
  };

  // Check if user is admin - handle both user.type and user.user_type
  const isAdmin = user && (user.type === "admin" || user.user_type === "admin");
  
  // Don't render if still loading
  if (isLoading) {
    return null;
  }
  
  // Don't render if no user or not admin
  if (!user) {
    return null;
  }
  
  if (!isAdmin) {
    return null;
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Loading...";
    if (user.name) return user.name;
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.username) return user.username;
    return "Admin User";
  };

  const isActive = (path: string) => {
    if (path === "/dashboard/admin") {
      return pathname === "/dashboard/admin";
    }
    return pathname.startsWith(path);
  };

  const getLinkStyle = (path: string) => ({
    textDecoration: 'none',
    color: isActive(path) ? '#2563eb' : '#374151',
    fontWeight: isActive(path) ? 600 : 500,
    padding: '0.5rem 1rem',
    borderRadius: 6,
    background: isActive(path) ? '#eff6ff' : 'transparent',
    transition: 'all 0.2s'
  });

  return (
    <nav style={{ background: '#fff', padding: '1rem 2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1200, margin: '0 auto' }}>
        <Link href="/dashboard/admin" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0070f3', margin: 0 }}>Bis-Connect Admin</h1>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard/admin" style={getLinkStyle("/dashboard/admin")}>Dashboard</Link>
          <Link href="/dashboard/admin/products" style={getLinkStyle("/dashboard/admin/products")}>Products</Link>
          <Link href="/dashboard/admin/users" style={getLinkStyle("/dashboard/admin/users")}>Users</Link>
          <Link href="/dashboard/admin/orders" style={getLinkStyle("/dashboard/admin/orders")}>Orders</Link>
          <Link href="/dashboard/admin/financials" style={getLinkStyle("/dashboard/admin/financials")}>Financials</Link>
          <Link href="/dashboard/admin/commissions" style={getLinkStyle("/dashboard/admin/commissions")}>Commissions</Link>
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
              {getUserDisplayName()}
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
                  <div style={{ fontWeight: 600, color: '#374151' }}>{getUserDisplayName()}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                </div>
                <Link href="/dashboard/admin/account" style={{ display: 'block', padding: '0.5rem 1rem', textDecoration: 'none', color: '#374151' }}>
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
        </div>
      </div>
      {showDropdown && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  );
} 