"use client";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function ClientNavbarWrapper() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Completely remove the "Bis-Connect5" navbar from the entire system
  return null;
} 