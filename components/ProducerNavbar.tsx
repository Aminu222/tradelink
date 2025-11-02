"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaHome, FaBoxOpen, FaClipboardList, FaComments, FaDollarSign, FaBell, FaUser, FaChartLine } from "react-icons/fa";
import { apiService } from "@/services/api";

const navLinks = [
  { href: "/dashboard/producer", label: "Dashboard", icon: <FaHome /> },
  { href: "/dashboard/producer/products", label: "Products", icon: <FaBoxOpen /> },
  { href: "/dashboard/producer/orders", label: "Orders", icon: <FaClipboardList /> },
  { href: "/dashboard/producer/messages", label: "Messages", icon: <FaComments /> },
  { href: "/dashboard/producer/financials", label: "Financials", icon: <FaChartLine /> },
  { href: "/dashboard/producer/payments", label: "Payments", icon: <FaDollarSign /> },
  { href: "/dashboard/producer/notifications", label: "Notifications", icon: <FaBell /> },
];

export default function ProducerNavbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    apiService.clearToken();
    localStorage.removeItem('user');
    setIsDropdownOpen(false);
    router.push('/');
  };

  return (
    <nav style={{
      background: "#fff",
      borderBottom: "1px solid #e5e7eb",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo/Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        <div style={{ 
          fontSize: "1.5rem", 
          fontWeight: 700, 
          color: "#3b82f6" 
        }}>
          Bis-Connect
        </div>
        <div style={{ 
          padding: "0.25rem 0.75rem", 
          background: "#dbeafe", 
          color: "#1e40af", 
          borderRadius: 20,
          fontSize: "0.75rem",
          fontWeight: 600
        }}>
          Seller
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem",
        flex: 1,
        justifyContent: "center",
        margin: "0 2rem"
      }}>
        {navLinks.map((link) => (
          <Link key={link.href} href={link.href} style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 0.75rem",
            textDecoration: "none",
            color: pathname === link.href ? "#3b82f6" : "#6b7280",
            background: pathname === link.href ? "#eff6ff" : "transparent",
            borderRadius: 6,
            fontWeight: pathname === link.href ? 600 : 500,
            transition: "all 0.2s",
            fontSize: "0.875rem",
            whiteSpace: "nowrap"
          }}>
            <span style={{ fontSize: "1rem" }}>{link.icon}</span>
            <span>
              {link.label}
            </span>
          </Link>
        ))}
      </div>

      {/* User Profile */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem",
            borderRadius: 6,
            color: "#374151"
          }}
        >
          <FaUser style={{ 
            fontSize: "1.2rem", 
            color: "#3b82f6" 
          }} />
        </button>

        {isDropdownOpen && (
          <div style={{
            position: "absolute",
            top: "100%",
            right: 0,
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 8,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            minWidth: "200px",
            zIndex: 1000,
            marginTop: "0.5rem"
          }}>
            <Link href="/dashboard/producer/account" style={{
              display: "block",
              padding: "0.75rem 1rem",
              textDecoration: "none",
              color: "#374151",
              borderBottom: "1px solid #f3f4f6"
            }}>
              Account Settings
            </Link>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                color: "#ef4444"
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "0.5rem",
          color: "#374151"
        }}
      >
        <div style={{ width: "20px", height: "2px", background: "#374151", margin: "4px 0" }}></div>
        <div style={{ width: "20px", height: "2px", background: "#374151", margin: "4px 0" }}></div>
        <div style={{ width: "20px", height: "2px", background: "#374151", margin: "4px 0" }}></div>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: "fixed",
          top: "80px",
          left: 0,
          right: 0,
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          zIndex: 999,
          padding: "1rem"
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                textDecoration: "none",
                color: pathname === link.href ? "#3b82f6" : "#6b7280",
                background: pathname === link.href ? "#eff6ff" : "transparent",
                borderRadius: 6,
                fontWeight: pathname === link.href ? 600 : 500,
                fontSize: "0.875rem"
              }}>
                <span style={{ fontSize: "1rem" }}>{link.icon}</span>
                {link.label}
              </Link>
            ))}
            
            {/* Mobile Logout Button */}
            <div style={{ borderTop: "1px solid #e5e7eb", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
              <Link href="/dashboard/producer/account" style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                textDecoration: "none",
                color: "#374151",
                fontSize: "0.875rem"
              }}>
                <FaUser style={{ fontSize: "1rem" }} />
                Account Settings
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontSize: "0.875rem"
                }}
              >
                <FaUser style={{ fontSize: "1rem" }} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 